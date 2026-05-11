using CaPheMinhHuu.DTOs.ProductSize;

namespace CaPheMinhHuu.Interfaces
{
    public interface IProductSizeService
    {
        Task<List<ProductSizeViewDto>> GetByProductIdAsync(int productId);
        Task<ProductSizeViewDto> CreateAsync(int productId, ProductSizeCreateDto dto);
        Task<ProductSizeViewDto?> UpdateAsync(int productId, int sizeId, ProductSizeUpdateDto dto);
        Task<bool> DeleteAsync(int productId, int sizeId);
    }
}
