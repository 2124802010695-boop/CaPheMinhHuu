using CaPheMinhHuu.DTOs.Recipe;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Services.Implements
{
    public class RecipeService : IRecipeService
    {
        private readonly IRecipeRepository _repo;

        public RecipeService(IRecipeRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<RecipeViewDto>> GetByProductIdAsync(int productId)
        {
            var recipes = await _repo.GetByProductIdAsync(productId);

            // Map từ Entity sang ViewDto
            return recipes.Select(r => new RecipeViewDto
            {
                Id = r.Id,
                IngredientId = r.IngredientId,
                IngredientName = r.Ingredient?.Name ?? "N/A",
                Unit = r.Ingredient?.BaseUnit ?? "",  // ✅ SỬA: Unit -> BaseUnit
                QuantityRequired = r.QuantityRequired
            });
        }

        public async Task<RecipeViewDto> AddIngredientToProductAsync(RecipeCreateDto dto)
        {
            // 1. Kiểm tra trùng
            if (await _repo.ExistsAsync(dto.ProductId, dto.IngredientId))
            {
                throw new Exception("Nguyên liệu này đã có trong công thức!");
            }

            // 2. Map từ Dto sang Entity
            var recipe = new Recipe
            {
                ProductId = dto.ProductId,
                IngredientId = dto.IngredientId,
                QuantityRequired = dto.QuantityRequired
            };

            // 3. Lưu xuống DB
            await _repo.AddAsync(recipe);

            // 4. Trả về kết quả (để Frontend hiển thị ngay)
            // Lưu ý: Lúc này chưa có tên nguyên liệu, Frontend có thể reload lại list
            return new RecipeViewDto
            {
                Id = recipe.Id,
                IngredientId = recipe.IngredientId,
                QuantityRequired = recipe.QuantityRequired
            };
        }

        public async Task<bool> RemoveIngredientFromProductAsync(int recipeId)
        {
            return await _repo.DeleteAsync(recipeId);
        }
    }
}