using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.Recipe;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Services.Implements
{
    public class RecipeService : IRecipeService
    {
        private readonly IRecipeRepository _repo;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RecipeService> _logger;

        public RecipeService(
            IRecipeRepository repo,
            ApplicationDbContext context,
            ILogger<RecipeService> logger)
        {
            _repo    = repo;
            _context = context;
            _logger  = logger;
        }

        public async Task<IEnumerable<RecipeViewDto>> GetByProductIdAsync(int productId)
        {
            var recipes = await _repo.GetByProductIdAsync(productId);
            return recipes.Select(r => new RecipeViewDto
            {
                Id               = r.Id,
                IngredientId     = r.IngredientId,
                IngredientName   = r.Ingredient?.Name ?? "N/A",
                Unit             = r.Ingredient?.BaseUnit ?? "",
                QuantityRequired = r.QuantityRequired,
                YieldFactor      = r.YieldFactor,
                IsActive         = r.IsActive,
                Version          = r.Version
            });
        }

        public async Task<RecipeViewDto> AddIngredientToProductAsync(RecipeCreateDto dto)
        {
            if (await _repo.ExistsAsync(dto.ProductId, dto.IngredientId))
                throw new Exception("Nguyên liệu này đã có trong công thức!");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var recipe = new Recipe
                {
                    ProductId        = dto.ProductId,
                    IngredientId     = dto.IngredientId,
                    QuantityRequired = dto.QuantityRequired,
                    YieldFactor      = dto.YieldFactor,
                    IsActive         = true,
                    Version          = 1
                };

                await _repo.AddWithoutSaveAsync(recipe);
                await _context.SaveChangesAsync();

                await CreateNewVersionSnapshotAsync(dto.ProductId, changedBy: null, reason: "Thêm nguyên liệu mới");

                await transaction.CommitAsync();

                _logger.LogInformation("Recipe added: Product {ProductId}, Ingredient {IngredientId}", dto.ProductId, dto.IngredientId);

                return new RecipeViewDto
                {
                    Id               = recipe.Id,
                    IngredientId     = recipe.IngredientId,
                    QuantityRequired = recipe.QuantityRequired,
                    YieldFactor      = recipe.YieldFactor,
                    IsActive         = recipe.IsActive,
                    Version          = recipe.Version
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> RemoveIngredientFromProductAsync(int recipeId)
        {
            var recipe = await _context.Recipes.FindAsync(recipeId);
            if (recipe == null) return false;

            var productId = recipe.ProductId;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                recipe.IsDeleted = true;
                await _context.SaveChangesAsync();

                await CreateNewVersionSnapshotAsync(productId, changedBy: null, reason: "Xóa nguyên liệu khỏi công thức");

                await transaction.CommitAsync();

                _logger.LogInformation("Recipe removed: RecipeId {RecipeId}, Product {ProductId}", recipeId, productId);
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<RecipeVersionDto>> GetVersionHistoryAsync(int productId)
        {
            var versions = await _context.RecipeVersions
                .Include(v => v.Lines)
                .Where(v => v.ProductId == productId)
                .OrderByDescending(v => v.VersionNumber)
                .ToListAsync();

            return versions.Select(v => new RecipeVersionDto
            {
                Id            = v.Id,
                ProductId     = v.ProductId,
                VersionNumber = v.VersionNumber,
                EffectiveFrom = v.EffectiveFrom,
                EffectiveTo   = v.EffectiveTo,
                IsCurrent     = v.IsCurrent,
                ChangedBy     = v.ChangedBy,
                ChangeReason  = v.ChangeReason,
                Lines         = v.Lines.Select(l => new RecipeVersionLineDto
                {
                    IngredientId     = l.IngredientId,
                    IngredientName   = l.IngredientName,
                    BaseUnit         = l.BaseUnit,
                    QuantityRequired = l.QuantityRequired,
                    YieldFactor      = l.YieldFactor,
                    UnitCostSnapshot = l.UnitCostSnapshot,
                    Note             = l.Note
                }).ToList()
            });
        }

        // ========== PRIVATE HELPERS ==========

        /// <summary>
        /// Tạo RecipeVersion snapshot mới sau mỗi thay đổi công thức.
        /// Đóng version cũ → tạo version mới với toàn bộ công thức hiện tại.
        /// </summary>
        private async Task CreateNewVersionSnapshotAsync(
            int productId, string? changedBy, string? reason)
        {
            // 1. Đóng version hiện tại
            var currentVersion = await _context.RecipeVersions
                .FirstOrDefaultAsync(v => v.ProductId == productId && v.IsCurrent && !v.IsDeleted);

            int nextVersionNumber = 1;
            if (currentVersion != null)
            {
                currentVersion.IsCurrent   = false;
                currentVersion.EffectiveTo = DateTime.UtcNow;
                nextVersionNumber          = currentVersion.VersionNumber + 1;
            }

            // 2. Lấy toàn bộ công thức hiện tại (sau khi add/delete đã commit)
            var currentRecipes = await _context.Recipes
                .Include(r => r.Ingredient)
                .Where(r => r.ProductId == productId && !r.IsDeleted && r.IsActive)
                .ToListAsync();

            // 3. Tạo RecipeVersion mới
            var newVersion = new RecipeVersion
            {
                ProductId     = productId,
                VersionNumber = nextVersionNumber,
                EffectiveFrom = DateTime.UtcNow,
                EffectiveTo   = null,
                IsCurrent     = true,
                ChangedBy     = changedBy,
                ChangeReason  = reason
            };

            // 4. Load tất cả batches cần thiết — 1 query duy nhất (tránh N+1)
            var ingredientIds = currentRecipes.Select(r => r.IngredientId).ToList();
            var allBatches = await _context.InventoryBatches
                .Where(b => ingredientIds.Contains(b.IngredientId)
                         && !b.IsDeleted
                         && b.CurrentQuantity > 0)
                .ToListAsync();

            // 5. Snapshot từng ingredient — tính WACC in-memory
            foreach (var recipe in currentRecipes)
            {
                var batches     = allBatches.Where(b => b.IngredientId == recipe.IngredientId).ToList();
                var totalQty    = batches.Sum(b => b.CurrentQuantity);
                var wacc        = totalQty > 0
                    ? Math.Round(batches.Sum(b => b.CurrentQuantity * b.ImportPricePerBaseUnit) / totalQty, 4)
                    : 0;

                newVersion.Lines.Add(new RecipeVersionLine
                {
                    IngredientId     = recipe.IngredientId,
                    IngredientName   = recipe.Ingredient?.Name ?? "",
                    BaseUnit         = recipe.Ingredient?.BaseUnit ?? "",
                    QuantityRequired = recipe.QuantityRequired,
                    YieldFactor      = recipe.YieldFactor,
                    UnitCostSnapshot = wacc,
                    Note             = recipe.Note
                });
            }

            _context.RecipeVersions.Add(newVersion);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "RecipeVersion v{Version} created for Product {ProductId} — {LineCount} ingredients",
                nextVersionNumber, productId, newVersion.Lines.Count);
        }

        // GetIngredientWaccAsync removed — WACC now computed inline in CreateNewVersionSnapshotAsync
        // using a single batch query for all ingredients (N+1 fix)
    }
}