using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllAsync(); // Lấy kèm Category
        Task<Product> AddAsync(Product product);
        Task<bool> DeleteAsync(int id);
        Task UpdateAsync(Product product);
        Task<Product?> GetByIdAsync(int id);
    }
}