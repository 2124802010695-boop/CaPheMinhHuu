
using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.Ingredient;
using CaPheMinhHuu.DTOs.Order;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;
using CaPheMinhHuu.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CaPheMinhHuu.Services.Implements
{
    public class IngredientService : IIngredientService
    {
        private readonly IIngredientRepository _ingredientRepo;
        private readonly IIngredientUnitRepository _unitRepo;
        private readonly IInventoryBatchRepository _batchRepo;
        private readonly IRecipeRepository _recipeRepo;
        private readonly ApplicationDbContext _context;
        
        private readonly ILogger<IngredientService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IHubContext<AppHub> _hubContext;

        public IngredientService(
            IIngredientRepository ingredientRepo,
            IIngredientUnitRepository unitRepo,
            IInventoryBatchRepository batchRepo,
            IRecipeRepository recipeRepo,
            ApplicationDbContext context,
            ILogger<IngredientService> logger,
            IHttpContextAccessor httpContextAccessor,
            IHubContext<AppHub> hubContext)
        {
            _ingredientRepo = ingredientRepo;
            _unitRepo = unitRepo;
            _batchRepo = batchRepo;
            _recipeRepo = recipeRepo;
            _context = context;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _hubContext = hubContext;
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
            var units = (ingredient.Units ?? new List<IngredientUnit>())
                .Where(u => !u.IsDeleted)
                .ToList();
            var allBatches = (ingredient.Batches ?? new List<InventoryBatch>())
                .Where(b => !b.IsDeleted)
                .OrderByDescending(b => b.ImportDate)  // Mới nhất trước
                .ToList();

            // Tồn kho chỉ tính batch còn hàng
            var currentStock = allBatches
                .Where(b => !b.ExpiryDate.HasValue || b.ExpiryDate.Value > DateTime.Now)
                .Sum(b => b.CurrentQuantity);

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
                    CreatedBy = b.CreatedBy,
                    PurchaseUnitName = b.PurchaseUnit?.UnitName,
                    PurchaseQuantity = b.PurchaseQuantity
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
        public async Task RestoreStockForOrderAsync(List<OrderItem> items)
        {
            foreach (var item in items)
            {
                var recipes = await _recipeRepo.GetByProductIdAsync(item.ProductId);
                foreach (var recipe in recipes)
                {
                    // Symmetric với DeductStock: restore đúng lượng đã trừ (bao gồm YieldFactor)
                    var yfR = recipe.YieldFactor > 0 ? recipe.YieldFactor : 1.0m;
                    var quantityToRestore = (recipe.QuantityRequired / yfR) * item.Quantity * item.SizeMultiplier;
                    // Lấy batch gần nhất (nhập mới nhất) để hoàn vào
                    var batches = await _batchRepo.GetAvailableFIFOAsync(recipe.IngredientId);
                    var targetBatch = batches.FirstOrDefault(); // FIFO: hoàn vào lô cũ nhất
                    if (targetBatch != null)
                    {
                        targetBatch.CurrentQuantity += quantityToRestore;
                    }
                }
            }
            await _batchRepo.SaveChangesAsync();
            _logger.LogInformation("Hoàn kho cho {Count} sản phẩm sau khi hủy đơn", items.Count);
        }

        // ========== UNIT MANAGEMENT ==========

        public async Task<IngredientUnitViewDto> AddUnitAsync(int ingredientId, AddIngredientUnitDto dto)
        {
            // 1. Validate ingredient tồn tại
            var ingredient = await _ingredientRepo.GetByIdAsync(ingredientId);
            if (ingredient == null)
                throw new KeyNotFoundException($"Không tìm thấy nguyên liệu #{ingredientId}");

            // 2. Guard: không được trùng tên BaseUnit
            if (dto.UnitName.Trim().Equals(ingredient.BaseUnit.Trim(), StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException($"Tên đơn vị không được trùng với BaseUnit '{ingredient.BaseUnit}'");

            // 3. Guard: không được trùng tên unit đang active
            var existingUnits = await _unitRepo.GetByIngredientIdAsync(ingredientId);
            if (existingUnits.Any(u => u.UnitName.Trim().Equals(dto.UnitName.Trim(), StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"Đơn vị '{dto.UnitName}' đã tồn tại cho nguyên liệu này");

            // 4. Tạo unit mới — IsBaseUnit luôn false
            var unit = new IngredientUnit
            {
                IngredientId = ingredientId,
                UnitName = dto.UnitName.Trim(),
                ConversionRate = dto.ConversionRate,
                IsBaseUnit = false
            };

            await _unitRepo.AddAsync(unit);
            _logger.LogInformation("Thêm unit '{UnitName}' (×{Rate}) cho NL #{Id}",
                unit.UnitName, unit.ConversionRate, ingredientId);

            // 5. Map → DTO
            return new IngredientUnitViewDto
            {
                Id = unit.Id,
                UnitName = unit.UnitName,
                ConversionRate = unit.ConversionRate,
                IsBaseUnit = unit.IsBaseUnit
            };
        }

        public async Task<bool> DeleteUnitAsync(int ingredientId, int unitId)
        {
            // 1. Validate unit tồn tại và thuộc đúng ingredient
            var unit = await _unitRepo.GetByIdAsync(unitId);
            if (unit == null || unit.IngredientId != ingredientId)
                return false;

            // 2. Guard: không được xóa BaseUnit
            if (unit.IsBaseUnit)
                throw new InvalidOperationException("Không thể xóa đơn vị cơ bản (BaseUnit)");

            // 3. Soft delete
            var result = await _unitRepo.DeleteAsync(unitId);
            if (result)
                _logger.LogInformation("Xóa unit #{UnitId} '{UnitName}' khỏi NL #{IngId}",
                    unitId, unit.UnitName, ingredientId);

            return result;
        }

        // ========== BATCH MANAGEMENT ==========

        public async Task<InventoryBatchViewDto?> AddBatchAsync(int ingredientId, BatchCreateDto dto)
        {
            // 1. Validate ingredient tồn tại
            var ingredient = await _ingredientRepo.GetByIdAsync(ingredientId);
            if (ingredient == null) return null;

            var batchCode = dto.BatchCode ?? GenerateBatchCode(ingredientId);

            // 2. Tính CurrentQuantity và ImportPricePerBaseUnit
            decimal currentQty = dto.Quantity;
            decimal pricePerBase = dto.ImportPricePerBaseUnit;
            int? purchaseUnitId = null;
            decimal? purchaseQuantity = null;
            string? purchaseUnitName = null;

            if (dto.PurchaseUnitId.HasValue)
            {
                // Validate PurchaseUnit thuộc đúng ingredient
                var units = await _unitRepo.GetByIngredientIdAsync(ingredientId);
                var purchaseUnit = units.FirstOrDefault(u => u.Id == dto.PurchaseUnitId.Value);
                if (purchaseUnit == null)
                    throw new InvalidOperationException(
                        $"Đơn vị nhập #{dto.PurchaseUnitId} không thuộc nguyên liệu này");

                // Validate PurchaseQuantity
                if (!dto.PurchaseQuantity.HasValue || dto.PurchaseQuantity.Value <= 0)
                    throw new InvalidOperationException(
                        "Cần nhập số lượng theo đơn vị nhập kho (PurchaseQuantity)");

                // Guard ConversionRate > 0
                var rate = purchaseUnit.ConversionRate > 0 ? purchaseUnit.ConversionRate : 1;

                // Quy đổi về BaseUnit
                currentQty = dto.PurchaseQuantity.Value * rate;
                pricePerBase = dto.ImportPricePerBaseUnit / rate;

                purchaseUnitId = purchaseUnit.Id;
                purchaseQuantity = dto.PurchaseQuantity.Value;
                purchaseUnitName = purchaseUnit.UnitName;
            }

            // 3. Tạo batch
            var batch = new InventoryBatch
            {
                IngredientId = ingredientId,
                BatchCode = batchCode,
                CurrentQuantity = currentQty,
                InitialQuantity = currentQty,
                ImportPricePerBaseUnit = pricePerBase,
                ImportDate = dto.ImportDate,
                ManufactureDate = dto.ManufactureDate,
                ExpiryDate = dto.ExpiryDate,
                LocationId = dto.LocationId,
                PurchaseUnitId = purchaseUnitId,
                PurchaseQuantity = purchaseQuantity,
                CreatedBy = GetCurrentUserName()
            };

            await _batchRepo.AddAsync(batch);
            _logger.LogInformation(
                "Nhập lô {BatchCode} cho NL #{Id}, SL: {Qty} {Unit} = {BaseQty} {BaseUnit}",
                batchCode, ingredientId,
                purchaseQuantity ?? currentQty,
                purchaseUnitName ?? ingredient.BaseUnit,
                currentQty, ingredient.BaseUnit);

            // 4. Map → DTO
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
                ExpiryStatus = GetExpiryStatus(batch.ExpiryDate),
                PurchaseUnitName = purchaseUnitName,
                PurchaseQuantity = purchaseQuantity
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
            if (dto.PurchaseUnitId.HasValue) batch.PurchaseUnitId = dto.PurchaseUnitId;
            if (dto.PurchaseQuantity.HasValue) batch.PurchaseQuantity = dto.PurchaseQuantity;

            await _batchRepo.UpdateAsync(batch);

            // Load PurchaseUnit name để trả về
            string? purchaseUnitName = null;
            if (batch.PurchaseUnitId.HasValue)
            {
                var units = await _unitRepo.GetByIngredientIdAsync(ingredientId);
                purchaseUnitName = units
                    .FirstOrDefault(u => u.Id == batch.PurchaseUnitId.Value)?.UnitName;
            }

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
                ExpiryStatus = GetExpiryStatus(batch.ExpiryDate),
                PurchaseUnitName = purchaseUnitName,
                PurchaseQuantity = batch.PurchaseQuantity
            };
        }

        public async Task<bool> DeleteBatchAsync(int ingredientId, int batchId)
        {
            var batch = await _batchRepo.GetByIdAsync(batchId);
            if (batch == null || batch.IngredientId != ingredientId) return false;

            return await _batchRepo.DeleteAsync(batchId);
        }

        public async Task<InventoryBatchViewDto?> DisposeBatchAsync(int ingredientId, int batchId)
        {
            var ingredient = await _context.Ingredients
                .Include(i => i.Batches)
                .FirstOrDefaultAsync(i => i.Id == ingredientId && !i.IsDeleted);
            if (ingredient == null) return null;

            var batch = ingredient.Batches.FirstOrDefault(b => b.Id == batchId && !b.IsDeleted);
            if (batch == null) return null;

            batch.CurrentQuantity = 0;
            batch.UpdatedDate = DateTime.Now;
            
            await _context.SaveChangesAsync();

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
                ExpiryStatus = GetExpiryStatus(batch.ExpiryDate),
                CreatedBy = batch.CreatedBy,
                PurchaseUnitName = null,
                PurchaseQuantity = batch.PurchaseQuantity
            };
        }
        // ========== STOCK OPERATIONS ==========
        /// <summary>
        /// Internal FIFO deduct — mutate batch quantities, KHÔNG SaveChanges.
        /// Caller chịu trách nhiệm SaveChanges + transaction.
        /// Trả về list (batch, deductedQty) để caller log audit.
        /// </summary>
        private async Task<List<(InventoryBatch Batch, decimal Deducted)>> DeductStockFIFOInternalAsync(
            int ingredientId, decimal quantityNeeded)
        {
            var batches = await _batchRepo.GetAvailableFIFOAsync(ingredientId);
            var totalAvailable = batches.Sum(b => b.CurrentQuantity);
            if (totalAvailable < quantityNeeded)
                throw new InvalidOperationException(
                    $"Không đủ tồn kho cho nguyên liệu ID {ingredientId}. Cần: {quantityNeeded}, Có: {totalAvailable}");

            var movements = new List<(InventoryBatch Batch, decimal Deducted)>();
            var remaining = quantityNeeded;
            foreach (var batch in batches)
            {
                if (remaining <= 0) break;
                var deducted = batch.CurrentQuantity >= remaining
                    ? remaining
                    : batch.CurrentQuantity;
                batch.CurrentQuantity -= deducted;
                remaining -= deducted;
                movements.Add((batch, deducted));
            }
            return movements;
        }

        /// <summary>
        /// Public FIFO deduct — dùng cho standalone call (không cần audit log).
        /// Tự SaveChanges + trigger LowStockAlert.
        /// </summary>
        public async Task<bool> DeductStockFIFOAsync(int ingredientId, decimal quantityNeeded)
        {
            var movements = await DeductStockFIFOInternalAsync(ingredientId, quantityNeeded);
            await _batchRepo.SaveChangesAsync();

            _logger.LogInformation("Trừ kho NL #{Id}: {Qty} đơn vị (FIFO)", ingredientId, quantityNeeded);

            // LowStockAlert trigger
            var ingredient = await _ingredientRepo.GetByIdAsync(ingredientId);
            var totalRemaining = await _batchRepo.GetTotalStockAsync(ingredientId);
            if (ingredient != null && totalRemaining <= ingredient.MinStock)
            {
                await _hubContext.Clients.Group("Broadcast").SendAsync("LowStockAlert", new
                {
                    ingredientName = ingredient.Name,
                    remaining      = totalRemaining,
                    unit           = ingredient.BaseUnit
                });
                _logger.LogWarning("LowStock Alert: {Name} còn {Qty} {Unit}",
                    ingredient.Name, totalRemaining, ingredient.BaseUnit);
            }
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
                    // Chuẩn BOM: needed = (QuantityRequired / YieldFactor) × Quantity × SizeMultiplier
                    // Guard YieldFactor > 0 để tránh DivideByZeroException
                    var yf1 = recipe.YieldFactor > 0 ? recipe.YieldFactor : 1.0m;
                    var needed = (recipe.QuantityRequired / yf1) * item.Quantity * item.SizeMultiplier;

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
        /// <summary>
        /// Deduct kho cho order — atomic: batch deduct + usage log trong cùng 1 transaction.
        /// Nhận List<OrderItem> (entity) để có OrderItemId sau khi DB save.
        /// </summary>
        public async Task DeductStockForOrderAsync(
            List<OrderItem> items, string orderCode, DateTime orderDate)
        {
            using var transaction = await _batchRepo.BeginTransactionAsync();
            try
            {
                foreach (var item in items)
                {
                    var recipes = await _recipeRepo.GetByProductIdAsync(item.ProductId);
                    foreach (var recipe in recipes.Where(r => r.IsActive && !r.IsDeleted))
                    {
                        // Chuẩn BOM: needed = (QuantityRequired / YieldFactor) × Quantity × SizeMultiplier
                        // Guard YieldFactor > 0 để tránh DivideByZeroException
                        var yf2 = recipe.YieldFactor > 0 ? recipe.YieldFactor : 1.0m;
                        var needed = (recipe.QuantityRequired / yf2) * item.Quantity * item.SizeMultiplier;
                        // Deduct FIFO — không SaveChanges
                        var movements = await DeductStockFIFOInternalAsync(recipe.IngredientId, needed);

                        // Insert usage log — 1 row per batch movement (proportional split)
                        foreach (var (batch, deducted) in movements)
                        {
                            _context.IngredientUsageLogs.Add(new IngredientUsageLog
                            {
                                OrderId         = item.OrderId,
                                OrderItemId     = item.Id,
                                OrderCode       = orderCode,
                                OrderDate       = orderDate,
                                BatchId         = batch.Id,
                                BatchCode       = batch.BatchCode,
                                BatchImportDate = batch.ImportDate,
                                IngredientId    = recipe.IngredientId,
                                IngredientName  = recipe.Ingredient?.Name ?? "",
                                BaseUnit        = recipe.Ingredient?.BaseUnit ?? "",
                                CostPerBaseUnit = batch.ImportPricePerBaseUnit,
                                DeductedQty     = deducted,
                                TotalCost       = Math.Round(deducted * batch.ImportPricePerBaseUnit, 2),
                                TheoreticalQty  = deducted,
                                Variance        = 0,
                                RecipeVersion   = recipe.Version
                            });
                        }

                        // LowStockAlert sau khi deduct
                        var ingredient = await _ingredientRepo.GetByIdAsync(recipe.IngredientId);
                        var totalRemaining = movements.Sum(m => m.Batch.CurrentQuantity);
                        if (ingredient != null && totalRemaining <= ingredient.MinStock)
                        {
                            await _hubContext.Clients.Group("Broadcast").SendAsync("LowStockAlert", new
                            {
                                ingredientName = ingredient.Name,
                                remaining      = totalRemaining,
                                unit           = ingredient.BaseUnit
                            });
                        }
                    }
                }
                // Atomic commit: batch mutations + usage logs cùng lúc
                await _batchRepo.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task DeductStockForToppingsAsync(List<OrderItemToppingDto> toppings)
        {
            if (toppings == null || !toppings.Any()) return;

            using var transaction = await _batchRepo.BeginTransactionAsync();
            try
            {
                foreach (var toppingDto in toppings)
                {
                    // Lấy Topping từ DB để biết IngredientId + PortionSize
                    var topping = await _context.Toppings
                        .FirstOrDefaultAsync(t => t.Id == toppingDto.ToppingId && !t.IsDeleted);

                    if (topping == null || !topping.IngredientId.HasValue || topping.PortionSize <= 0)
                        continue; // Topping không có kho → bỏ qua

                    var needed = topping.PortionSize * toppingDto.Quantity;
                    await DeductStockFIFOAsync(topping.IngredientId.Value, needed);
                }
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task RestoreStockForToppingsAsync(List<CaPheMinhHuu.Models.OrderItemTopping> toppings)
        {
            if (toppings == null || !toppings.Any()) return;

            foreach (var orderItemTopping in toppings)
            {
                var topping = await _context.Toppings
                    .FirstOrDefaultAsync(t => t.Id == orderItemTopping.ToppingId && !t.IsDeleted);

                if (topping == null || !topping.IngredientId.HasValue || topping.PortionSize <= 0)
                    continue;

                var quantityToRestore = topping.PortionSize * orderItemTopping.Quantity;
                var batches = await _batchRepo.GetAvailableFIFOAsync(topping.IngredientId.Value);
                var targetBatch = batches.FirstOrDefault();
                if (targetBatch != null)
                {
                    targetBatch.CurrentQuantity += quantityToRestore;
                }
            }
            await _batchRepo.SaveChangesAsync();
            _logger.LogInformation("Hoàn kho topping cho {Count} items", toppings.Count);
        }
    }
}