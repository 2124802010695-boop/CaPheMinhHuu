
using CaPheMinhHuu.DTOs.Ingredient;
using CaPheMinhHuu.DTOs.Order;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Services.Implements
{
    public class IngredientService : IIngredientService
    {
        private readonly IIngredientRepository _ingredientRepo;
        private readonly IIngredientUnitRepository _unitRepo;
        private readonly IInventoryBatchRepository _batchRepo;
        private readonly IRecipeRepository _recipeRepo;
        
        private readonly ILogger<IngredientService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public IngredientService(
            IIngredientRepository ingredientRepo,
            IIngredientUnitRepository unitRepo,
            IInventoryBatchRepository batchRepo,
            IRecipeRepository recipeRepo,
            
            ILogger<IngredientService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _ingredientRepo = ingredientRepo;
            _unitRepo = unitRepo;
            _batchRepo = batchRepo;
            _recipeRepo = recipeRepo;
            
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        // ========== GET ALL ==========
        public async Task<IEnumerable<IngredientViewDto>> GetAllAsync()
        {
            var ingredients = await _ingredientRepo.GetAllAsync();

            var result = new List<IngredientViewDto>();

            foreach (var ing in ingredients)
            {
                var dto = await MapToViewDto(ing);
                result.Add(dto);
            }

            return result;
        }

        // ========== GET BY ID ==========
        public async Task<IngredientViewDto?> GetByIdAsync(int id)
        {
            var ingredient = await _ingredientRepo.GetByIdAsync(id);
            if (ingredient == null) return null;

            return await MapToViewDto(ingredient);
        }

        // ========== CREATE ==========
        public async Task<IngredientViewDto> CreateAsync(IngredientCreateDto dto)
        {
            // 1. Tạo Ingredient (Master Data)
            var ingredient = new Ingredient
            {
                Name = dto.Name,
                SKU = dto.SKU,
                BaseUnit = dto.BaseUnit,
                IngredientCategoryId = dto.IngredientCategoryId,
                MinStock = dto.MinStock,
                MaxStock = dto.MaxStock,
                DefaultShelfLifeDays = dto.DefaultShelfLifeDays
            };

            await _ingredientRepo.AddAsync(ingredient);
            _logger.LogInformation("Nguyên liệu mới: #{Id} - {Name}, SKU: {SKU}", ingredient.Id, ingredient.Name, ingredient.SKU);

            // 2. Tạo BaseUnit mặc định (ConversionRate = 1)
            var baseUnit = new IngredientUnit
            {
                IngredientId = ingredient.Id,
                UnitName = dto.BaseUnit,
                ConversionRate = 1,
                IsBaseUnit = true
            };
            await _unitRepo.AddAsync(baseUnit);

            // 3. Tạo các đơn vị quy đổi khác (nếu có)
            if (dto.Units != null && dto.Units.Any())
            {
                foreach (var unitDto in dto.Units)
                {
                    var unit = new IngredientUnit
                    {
                        IngredientId = ingredient.Id,
                        UnitName = unitDto.UnitName,
                        ConversionRate = unitDto.ConversionRate,
                        IsBaseUnit = unitDto.IsBaseUnit
                    };
                    await _unitRepo.AddAsync(unit);
                }
            }

            // 4. Tạo lô hàng đầu tiên (nếu có)
            if (dto.InitialBatch != null)
            {
                var batchCode = dto.InitialBatch.BatchCode ?? GenerateBatchCode(ingredient.Id);

                var batch = new InventoryBatch
                {
                    IngredientId = ingredient.Id,
                    BatchCode = batchCode,
                    CurrentQuantity = dto.InitialBatch.Quantity,
                    InitialQuantity = dto.InitialBatch.Quantity,
                    ImportPricePerBaseUnit = dto.InitialBatch.ImportPricePerBaseUnit,
                    ImportDate = dto.InitialBatch.ImportDate,
                    ManufactureDate = dto.InitialBatch.ManufactureDate,
                    ExpiryDate = dto.InitialBatch.ExpiryDate,
                    LocationId = dto.InitialBatch.LocationId,
                    CreatedBy = GetCurrentUserName()
                };
                await _batchRepo.AddAsync(batch);
            }

            // 5. Trả về DTO
            var createdIngredient = await _ingredientRepo.GetByIdAsync(ingredient.Id);
            return await MapToViewDto(createdIngredient!);
        }

        // ========== UPDATE ==========
        public async Task<IngredientViewDto?> UpdateAsync(int id, IngredientUpdateDto dto)
        {
            var ingredient = await _ingredientRepo.GetByIdAsync(id);
            if (ingredient == null) return null;

            // Chỉ cập nhật Master Data
            ingredient.Name = dto.Name;
            ingredient.SKU = dto.SKU;
            ingredient.BaseUnit = dto.BaseUnit;
            ingredient.IngredientCategoryId = dto.IngredientCategoryId;
            ingredient.MinStock = dto.MinStock;
            ingredient.MaxStock = dto.MaxStock;
            ingredient.DefaultShelfLifeDays = dto.DefaultShelfLifeDays;

            await _ingredientRepo.UpdateAsync(ingredient);

            return await MapToViewDto(ingredient);
        }

        // ========== DELETE ==========
        public async Task<bool> DeleteAsync(int id)
        {
            var result = await _ingredientRepo.DeleteAsync(id);
            if (result) _logger.LogInformation("Xóa nguyên liệu #{Id}", id);
            return result;
        }

        // ========== HELPER METHODS ==========

        private Task<IngredientViewDto> MapToViewDto(Ingredient ingredient)
        {
            var units = ingredient.Units ?? new List<IngredientUnit>();
            var allBatches = (ingredient.Batches ?? new List<InventoryBatch>())
                .Where(b => !b.IsDeleted)
                .OrderByDescending(b => b.ImportDate)  // Mới nhất trước
                .ToList();

            // Tồn kho chỉ tính batch còn hàng
            var currentStock = allBatches.Sum(b => b.CurrentQuantity);

            var stockStatus = "OK";
            if (currentStock <= 0) stockStatus = "Out";
            else if (currentStock <= ingredient.MinStock) stockStatus = "Low";

            return Task.FromResult(new IngredientViewDto
            {
                Id = ingredient.Id,
                Name = ingredient.Name,
                SKU = ingredient.SKU,
                BaseUnit = ingredient.BaseUnit,
                IngredientCategoryId = ingredient.IngredientCategoryId,
                CategoryName = ingredient.IngredientCategory?.Name ?? "Chưa phân loại",
                MinStock = ingredient.MinStock,
                MaxStock = ingredient.MaxStock,
                DefaultShelfLifeDays = ingredient.DefaultShelfLifeDays,
                CurrentStock = currentStock,
                StockStatus = stockStatus,
                Units = units.Select(u => new IngredientUnitViewDto
                {
                    Id = u.Id,
                    UnitName = u.UnitName,
                    ConversionRate = u.ConversionRate,
                    IsBaseUnit = u.IsBaseUnit
                }).ToList(),
                // ✅ Trả về TẤT CẢ batch (kể cả đã dùng hết) để xem lịch sử
                Batches = allBatches.Select(b => new InventoryBatchViewDto
                {
                    Id = b.Id,
                    BatchCode = b.BatchCode,
                    CurrentQuantity = b.CurrentQuantity,
                    InitialQuantity = b.InitialQuantity,
                    ImportPricePerBaseUnit = b.ImportPricePerBaseUnit,
                    ImportDate = b.ImportDate,
                    ManufactureDate = b.ManufactureDate,
                    ExpiryDate = b.ExpiryDate,
                    DaysUntilExpiry = b.ExpiryDate.HasValue
                        ? (int)(b.ExpiryDate.Value - DateTime.Now).TotalDays : null,
                    ExpiryStatus = GetExpiryStatus(b.ExpiryDate),
                    CreatedBy = b.CreatedBy ?? "Admin"
                }).ToList(),
                CreatedDate = ingredient.CreatedDate,
                UpdatedDate = ingredient.UpdatedDate
            });
        }

        private string GenerateBatchCode(int ingredientId)
        {
            return $"BATCH-{ingredientId:D4}-{DateTime.Now:yyyyMMddHHmmss}";
        }

        private string GetExpiryStatus(DateTime? expiryDate)
        {
            if (!expiryDate.HasValue) return "NoExpiry";

            var daysLeft = (expiryDate.Value - DateTime.Now).TotalDays;

            if (daysLeft < 0) return "Expired";
            if (daysLeft <= 30) return "NearExpiry";
            return "Fresh";
        }
        private string GetCurrentUserName()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            return user?.FindFirst("name")?.Value
                ?? user?.FindFirst("fullName")?.Value
                ?? user?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
                ?? "Admin";
        }

        // ========== SKU GENERATION ==========

        public async Task<string> GenerateSKUAsync(string ingredientName)
        {
            if (string.IsNullOrWhiteSpace(ingredientName))
                throw new ArgumentException("Tên nguyên liệu không được để trống");

            // 1. Bỏ dấu tiếng Việt
            var normalized = RemoveVietnameseTones(ingredientName);

            // 2. Chuyển thành chữ hoa và tách từ
            var words = normalized.ToUpper()
                .Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

            // 3. Lấy tối đa 2 từ đầu tiên
            var shortName = string.Join("-", words.Take(2));

            // 4. Loại bỏ ký tự đặc biệt
            shortName = System.Text.RegularExpressions.Regex.Replace(shortName, @"[^A-Z0-9-]", "");

            // 5. Tạo SKU base
            var skuBase = $"SKU-{shortName}";

            // 6. Tìm số thứ tự tiếp theo
            var counter = 1;
            var sku = $"{skuBase}-{counter:D3}";

            while (await _ingredientRepo.ExistsBySKU(sku))
            {
                counter++;
                sku = $"{skuBase}-{counter:D3}";
            }

            return sku;
        }

        private string RemoveVietnameseTones(string text)
        {
            var vietnameseMap = new Dictionary<char, char>
            {
                {'á', 'a'}, {'à', 'a'}, {'ả', 'a'}, {'ã', 'a'}, {'ạ', 'a'},
                {'ă', 'a'}, {'ắ', 'a'}, {'ằ', 'a'}, {'ẳ', 'a'}, {'ẵ', 'a'}, {'ặ', 'a'},
                {'â', 'a'}, {'ấ', 'a'}, {'ầ', 'a'}, {'ẩ', 'a'}, {'ẫ', 'a'}, {'ậ', 'a'},
                {'é', 'e'}, {'è', 'e'}, {'ẻ', 'e'}, {'ẽ', 'e'}, {'ẹ', 'e'},
                {'ê', 'e'}, {'ế', 'e'}, {'ề', 'e'}, {'ể', 'e'}, {'ễ', 'e'}, {'ệ', 'e'},
                {'í', 'i'}, {'ì', 'i'}, {'ỉ', 'i'}, {'ĩ', 'i'}, {'ị', 'i'},
                {'ó', 'o'}, {'ò', 'o'}, {'ỏ', 'o'}, {'õ', 'o'}, {'ọ', 'o'},
                {'ô', 'o'}, {'ố', 'o'}, {'ồ', 'o'}, {'ổ', 'o'}, {'ỗ', 'o'}, {'ộ', 'o'},
                {'ơ', 'o'}, {'ớ', 'o'}, {'ờ', 'o'}, {'ở', 'o'}, {'ỡ', 'o'}, {'ợ', 'o'},
                {'ú', 'u'}, {'ù', 'u'}, {'ủ', 'u'}, {'ũ', 'u'}, {'ụ', 'u'},
                {'ư', 'u'}, {'ứ', 'u'}, {'ừ', 'u'}, {'ử', 'u'}, {'ữ', 'u'}, {'ự', 'u'},
                {'ý', 'y'}, {'ỳ', 'y'}, {'ỷ', 'y'}, {'ỹ', 'y'}, {'ỵ', 'y'},
                {'đ', 'd'},
                {'Á', 'A'}, {'À', 'A'}, {'Ả', 'A'}, {'Ã', 'A'}, {'Ạ', 'A'},
                {'Ă', 'A'}, {'Ắ', 'A'}, {'Ằ', 'A'}, {'Ẳ', 'A'}, {'Ẵ', 'A'}, {'Ặ', 'A'},
                {'Â', 'A'}, {'Ấ', 'A'}, {'Ầ', 'A'}, {'Ẩ', 'A'}, {'Ẫ', 'A'}, {'Ậ', 'A'},
                {'É', 'E'}, {'È', 'E'}, {'Ẻ', 'E'}, {'Ẽ', 'E'}, {'Ẹ', 'E'},
                {'Ê', 'E'}, {'Ế', 'E'}, {'Ề', 'E'}, {'Ể', 'E'}, {'Ễ', 'E'}, {'Ệ', 'E'},
                {'Í', 'I'}, {'Ì', 'I'}, {'Ỉ', 'I'}, {'Ĩ', 'I'}, {'Ị', 'I'},
                {'Ó', 'O'}, {'Ò', 'O'}, {'Ỏ', 'O'}, {'Õ', 'O'}, {'Ọ', 'O'},
                {'Ô', 'O'}, {'Ố', 'O'}, {'Ồ', 'O'}, {'Ổ', 'O'}, {'Ỗ', 'O'}, {'Ộ', 'O'},
                {'Ơ', 'O'}, {'Ớ', 'O'}, {'Ờ', 'O'}, {'Ở', 'O'}, {'Ỡ', 'O'}, {'Ợ', 'O'},
                {'Ú', 'U'}, {'Ù', 'U'}, {'Ủ', 'U'}, {'Ũ', 'U'}, {'Ụ', 'U'},
                {'Ư', 'U'}, {'Ứ', 'U'}, {'Ừ', 'U'}, {'Ử', 'U'}, {'Ữ', 'U'}, {'Ự', 'U'},
                {'Ý', 'Y'}, {'Ỳ', 'Y'}, {'Ỷ', 'Y'}, {'Ỹ', 'Y'}, {'Ỵ', 'Y'},
                {'Đ', 'D'}
            };

            var result = new System.Text.StringBuilder();
            foreach (var c in text)
            {
                result.Append(vietnameseMap.ContainsKey(c) ? vietnameseMap[c] : c);
            }

            return result.ToString();
        }

        // ========== BATCH MANAGEMENT ==========

        public async Task<InventoryBatchViewDto?> AddBatchAsync(int ingredientId, BatchCreateDto dto)

        {
            var ingredient = await _ingredientRepo.GetByIdAsync(ingredientId);
            if (ingredient == null) return null;

            var batchCode = dto.BatchCode ?? GenerateBatchCode(ingredientId);

            var batch = new InventoryBatch
            {
                IngredientId = ingredientId,
                BatchCode = batchCode,
                CurrentQuantity = dto.Quantity,
                InitialQuantity = dto.Quantity,
                ImportPricePerBaseUnit = dto.ImportPricePerBaseUnit,
                ImportDate = dto.ImportDate,
                ManufactureDate = dto.ManufactureDate,
                ExpiryDate = dto.ExpiryDate,
                LocationId = dto.LocationId,
                CreatedBy = GetCurrentUserName()
            };

            await _batchRepo.AddAsync(batch);
            _logger.LogInformation("Nhập lô {BatchCode} cho NL #{Id}, SL: {Qty}", batchCode, ingredientId, dto.Quantity);

            return new InventoryBatchViewDto
            {
                Id = batch.Id,
                BatchCode = batch.BatchCode,
                CurrentQuantity = batch.CurrentQuantity,
                InitialQuantity = batch.InitialQuantity,
                ImportPricePerBaseUnit = batch.ImportPricePerBaseUnit,
                ImportDate = batch.ImportDate,
                ManufactureDate = batch.ManufactureDate,
                ExpiryDate = batch.ExpiryDate,
                DaysUntilExpiry = batch.ExpiryDate.HasValue
                    ? (int)(batch.ExpiryDate.Value - DateTime.Now).TotalDays : null,
                ExpiryStatus = GetExpiryStatus(batch.ExpiryDate)
            };
        }

        public async Task<IEnumerable<InventoryBatchViewDto>?> GetBatchesAsync(int ingredientId)
        {
            var ingredient = await _ingredientRepo.GetByIdAsync(ingredientId);
            if (ingredient == null) return null;

            var batches = await _batchRepo.GetByIngredientIdAsync(ingredientId);

            return batches.Select(b => new InventoryBatchViewDto
            {
                Id = b.Id,
                BatchCode = b.BatchCode,
                CurrentQuantity = b.CurrentQuantity,
                InitialQuantity = b.InitialQuantity,
                ImportPricePerBaseUnit = b.ImportPricePerBaseUnit,
                ImportDate = b.ImportDate,
                ManufactureDate = b.ManufactureDate,
                ExpiryDate = b.ExpiryDate,
                DaysUntilExpiry = b.ExpiryDate.HasValue
                    ? (int)(b.ExpiryDate.Value - DateTime.Now).TotalDays
                    : (int?)null,
                ExpiryStatus = GetExpiryStatus(b.ExpiryDate)
            });
        }

        public async Task<InventoryBatchViewDto?> UpdateBatchAsync(int ingredientId, int batchId, BatchUpdateDto dto)
        {
            var batch = await _batchRepo.GetByIdAsync(batchId);
            if (batch == null || batch.IngredientId != ingredientId) return null;

            // Cập nhật các trường nếu có giá trị mới
            if (dto.BatchCode != null) batch.BatchCode = dto.BatchCode;
            if (dto.Quantity.HasValue)
            {
                batch.CurrentQuantity = dto.Quantity.Value;
                // KHÔNG set InitialQuantity — giữ giá trị nhập ban đầu
            }
            if (dto.ImportPricePerBaseUnit.HasValue) batch.ImportPricePerBaseUnit = dto.ImportPricePerBaseUnit.Value;
            if (dto.ImportDate.HasValue) batch.ImportDate = dto.ImportDate.Value;
            if (dto.ManufactureDate.HasValue) batch.ManufactureDate = dto.ManufactureDate;
            if (dto.ExpiryDate.HasValue) batch.ExpiryDate = dto.ExpiryDate;
            if (dto.LocationId.HasValue) batch.LocationId = dto.LocationId;

            await _batchRepo.UpdateAsync(batch);

            return new InventoryBatchViewDto
            {
                Id = batch.Id,
                BatchCode = batch.BatchCode,
                CurrentQuantity = batch.CurrentQuantity,
                InitialQuantity = batch.InitialQuantity,
                ImportPricePerBaseUnit = batch.ImportPricePerBaseUnit,
                ImportDate = batch.ImportDate,
                ManufactureDate = batch.ManufactureDate,
                ExpiryDate = batch.ExpiryDate,
                DaysUntilExpiry = batch.ExpiryDate.HasValue
                    ? (int)(batch.ExpiryDate.Value - DateTime.Now).TotalDays : null,
                ExpiryStatus = GetExpiryStatus(batch.ExpiryDate)
            };
        }

        public async Task<bool> DeleteBatchAsync(int ingredientId, int batchId)
        {
            var batch = await _batchRepo.GetByIdAsync(batchId);
            if (batch == null || batch.IngredientId != ingredientId) return false;

            return await _batchRepo.DeleteAsync(batchId);
        }
        // ========== STOCK OPERATIONS ==========
        public async Task<bool> DeductStockFIFOAsync(int ingredientId, decimal quantityNeeded)
        {
            var batches = await _batchRepo.GetAvailableFIFOAsync(ingredientId);

            var totalAvailable = batches.Sum(b => b.CurrentQuantity);
            if (totalAvailable < quantityNeeded)
                throw new InvalidOperationException(
                    $"Không đủ tồn kho cho nguyên liệu ID {ingredientId}. Cần: {quantityNeeded}, Có: {totalAvailable}");
            var remaining = quantityNeeded;
            foreach (var batch in batches)
            {
                if (remaining <= 0) break;
                if (batch.CurrentQuantity >= remaining)
                {
                    batch.CurrentQuantity -= remaining;
                    remaining = 0;
                }
                else
                {
                    remaining -= batch.CurrentQuantity;
                    batch.CurrentQuantity = 0;
                   
                }
            }
            await _batchRepo.SaveChangesAsync();

            _logger.LogInformation("Trừ kho NL #{Id}: {Qty} đơn vị (FIFO)", ingredientId, quantityNeeded);
            return true;
        }
        public async Task<StockCheckResult> CheckStockForOrderAsync(List<OrderItemDto> items)
        {
            var result = new StockCheckResult { IsAvailable = true };

            foreach (var item in items)
            {
                var recipes = await _recipeRepo.GetByProductIdAsync(item.ProductId);

                foreach (var recipe in recipes)
                {
                    var needed = recipe.QuantityRequired * item.Quantity;

                    
                    var available = await _batchRepo.GetTotalStockAsync(recipe.IngredientId);

                    if (available < needed)
                    {
                        result.IsAvailable = false;

                        result.Shortages.Add(new StockShortage
                        {
                            IngredientId = recipe.IngredientId,
                            IngredientName = recipe.Ingredient?.Name ?? "",
                            Required = needed,
                            Available = available,
                            Shortage = needed - available
                        });
                    }
                }
            }

            return result;
        }
        public async Task DeductStockForOrderAsync(List<OrderItemDto> items)
        {
            using var transaction = await _batchRepo.BeginTransactionAsync();
            try
            {
                foreach (var item in items)
                {
                    var recipes = await _recipeRepo.GetByProductIdAsync(item.ProductId);
                    foreach (var recipe in recipes)
                    {
                        var needed = recipe.QuantityRequired * item.Quantity;
                        await DeductStockFIFOAsync(recipe.IngredientId, needed);
                    }
                }
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}