using CaPheMinhHuu.DTOs.Product;
using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<ProductViewDto>> GetAllProductsAsync();
        Task<ProductViewDto> CreateProductAsync(ProductCreateDto dto);
        Task<bool> DeleteProductAsync(int id);
        Task<bool> UpdateProductAsync(int id, ProductUpdateDto dto);
        Task<Product?> GetProductByIdAsync(int id);           // Lấy product entity (để xóa ảnh cũ)
        Task UpdateProductImageAsync(int id, string imageUrl); // Cập nhật chỉ mỗi ImageUrl
    }
}