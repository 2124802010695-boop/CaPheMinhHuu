using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.ProductSize;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Services.Implements
{
    public class ProductSizeService : IProductSizeService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductSizeService> _logger;

        public ProductSizeService(ApplicationDbContext context, ILogger<ProductSizeService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<ProductSizeViewDto>> GetByProductIdAsync(int productId)
        {
            var entities = await _context.ProductSizes
                .Where(ps => ps.ProductId == productId && !ps.IsDeleted && ps.IsActive)
                .OrderBy(ps => ps.SortOrder)
                .ToListAsync();
            return entities.Select(ps => MapToViewDto(ps)).ToList();
        }

        public async Task<ProductSizeViewDto> CreateAsync(int productId, ProductSizeCreateDto dto)
        {
            // Risk 1: Validate product exists
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == productId && !p.IsDeleted);
            if (product == null)
                throw new InvalidOperationException($"Sản phẩm ID {productId} không tồn tại");

            // Kiểm tra trùng label
            var existing = await _context.ProductSizes
                .FirstOrDefaultAsync(ps => ps.ProductId == productId
                    && ps.Label == dto.Label
                    && !ps.IsDeleted);
            if (existing != null)
                throw new InvalidOperationException($"Size '{dto.Label}' đã tồn tại cho sản phẩm này");

            var size = new ProductSize
            {
                ProductId        = productId,
                Label            = dto.Label,
                PriceExtra       = dto.PriceExtra,
                RecipeMultiplier = dto.RecipeMultiplier,
                SortOrder        = dto.SortOrder,
                IsActive         = true
            };
            _context.ProductSizes.Add(size);
            await _context.SaveChangesAsync();
            _logger.LogInformation("ProductSize created: Product {ProductId} Size {Label}", productId, dto.Label);
            return MapToViewDto(size);
        }

        public async Task<ProductSizeViewDto?> UpdateAsync(int productId, int sizeId, ProductSizeUpdateDto dto)
        {
            var size = await _context.ProductSizes
                .FirstOrDefaultAsync(ps => ps.Id == sizeId
                    && ps.ProductId == productId
                    && !ps.IsDeleted);
            if (size == null) return null;

            if (dto.PriceExtra.HasValue) size.PriceExtra = dto.PriceExtra.Value;
            if (dto.RecipeMultiplier.HasValue) size.RecipeMultiplier = dto.RecipeMultiplier.Value;
            if (dto.IsActive.HasValue) size.IsActive = dto.IsActive.Value;
            if (dto.SortOrder.HasValue) size.SortOrder = dto.SortOrder.Value;

            await _context.SaveChangesAsync();
            return MapToViewDto(size);
        }

        public async Task<bool> DeleteAsync(int productId, int sizeId)
        {
            var size = await _context.ProductSizes
                .FirstOrDefaultAsync(ps => ps.Id == sizeId
                    && ps.ProductId == productId
                    && !ps.IsDeleted);
            if (size == null) return false;
            size.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        private static ProductSizeViewDto MapToViewDto(ProductSize ps) => new()
        {
            Id               = ps.Id,
            ProductId        = ps.ProductId,
            Label            = ps.Label,
            PriceExtra       = ps.PriceExtra,
            RecipeMultiplier = ps.RecipeMultiplier,
            IsActive         = ps.IsActive,
            SortOrder        = ps.SortOrder
        };
    }
}
