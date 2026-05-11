using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.Topping;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Services.Implements
{
    public class ToppingService : IToppingService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ToppingService> _logger;

        public ToppingService(ApplicationDbContext context, ILogger<ToppingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<ToppingViewDto>> GetAllAsync(bool includeInactive = false)
        {
            var query = _context.Toppings
                .Include(t => t.Ingredient)
                .Where(t => !t.IsDeleted);

            if (!includeInactive)
                query = query.Where(t => t.IsActive);

            var entities = await query.ToListAsync();
            return entities.Select(t => MapToViewDto(t)).ToList();
        }

        public async Task<ToppingViewDto?> GetByIdAsync(int id)
        {
            var topping = await _context.Toppings
                .Include(t => t.Ingredient)
                .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
            return topping == null ? null : MapToViewDto(topping);
        }

        public async Task<ToppingViewDto> CreateAsync(ToppingCreateDto dto)
        {
            // Risk 2: Validate IngredientId + PortionSize consistency
            if (dto.IngredientId.HasValue && dto.PortionSize <= 0)
                throw new InvalidOperationException(
                    "Khi liên kết với nguyên liệu, PortionSize phải > 0");

            if (!dto.IngredientId.HasValue && dto.PortionSize > 0)
                throw new InvalidOperationException(
                    "Đã nhập PortionSize nhưng chưa chọn nguyên liệu liên kết");

            // Risk 1: Validate IngredientId exists
            if (dto.IngredientId.HasValue)
            {
                var ingredient = await _context.Ingredients
                    .FirstOrDefaultAsync(i => i.Id == dto.IngredientId.Value && !i.IsDeleted);
                if (ingredient == null)
                    throw new InvalidOperationException(
                        $"Nguyên liệu ID {dto.IngredientId.Value} không tồn tại");
            }

            var topping = new Topping
            {
                Name         = dto.Name,
                Price        = dto.Price,
                IsActive     = true,
                IngredientId = dto.IngredientId,
                PortionSize  = dto.PortionSize,
                PortionUnit  = dto.PortionUnit
            };
            _context.Toppings.Add(topping);
            await _context.SaveChangesAsync();
            await _context.Entry(topping).Reference(t => t.Ingredient).LoadAsync();
            _logger.LogInformation("Topping created: {Name}", topping.Name);
            return MapToViewDto(topping);
        }

        public async Task<ToppingViewDto?> UpdateAsync(int id, ToppingUpdateDto dto)
        {
            var topping = await _context.Toppings
                .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
            if (topping == null) return null;

            // Risk 1: Validate new IngredientId if provided
            if (dto.IngredientId.HasValue && dto.IngredientId.Value != 0)
            {
                var ingredient = await _context.Ingredients
                    .FirstOrDefaultAsync(i => i.Id == dto.IngredientId.Value && !i.IsDeleted);
                if (ingredient == null)
                    throw new InvalidOperationException(
                        $"Nguyên liệu ID {dto.IngredientId.Value} không tồn tại");
            }

            // Apply updates
            if (dto.Name != null) topping.Name = dto.Name;
            if (dto.Price.HasValue) topping.Price = dto.Price.Value;
            if (dto.IngredientId.HasValue) topping.IngredientId = dto.IngredientId == 0 ? null : dto.IngredientId;
            if (dto.PortionSize.HasValue) topping.PortionSize = dto.PortionSize.Value;
            if (dto.PortionUnit != null) topping.PortionUnit = dto.PortionUnit;
            if (dto.IsActive.HasValue) topping.IsActive = dto.IsActive.Value;

            // Risk 2: Validate consistency after update
            if (topping.IngredientId.HasValue && topping.PortionSize <= 0)
                throw new InvalidOperationException(
                    "Khi liên kết với nguyên liệu, PortionSize phải > 0");

            if (!topping.IngredientId.HasValue && topping.PortionSize > 0)
                throw new InvalidOperationException(
                    "Đã gỡ liên kết nguyên liệu thì PortionSize phải = 0");

            await _context.SaveChangesAsync();
            await _context.Entry(topping).Reference(t => t.Ingredient).LoadAsync();
            return MapToViewDto(topping);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var topping = await _context.Toppings
                .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
            if (topping == null) return false;
            topping.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleActiveAsync(int id)
        {
            var topping = await _context.Toppings
                .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
            if (topping == null) return false;
            topping.IsActive = !topping.IsActive;
            await _context.SaveChangesAsync();
            return true;
        }

        private static ToppingViewDto MapToViewDto(Topping t) => new()
        {
            Id             = t.Id,
            Name           = t.Name,
            Price          = t.Price,
            IsActive       = t.IsActive,
            IngredientId   = t.IngredientId,
            IngredientName = t.Ingredient?.Name,
            PortionSize    = t.PortionSize,
            PortionUnit    = t.PortionUnit
        };
    }
}
