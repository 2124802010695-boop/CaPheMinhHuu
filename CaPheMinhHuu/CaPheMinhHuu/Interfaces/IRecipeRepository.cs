using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IRecipeRepository
    {
        // Lấy tất cả công thức của 1 món
        Task<IEnumerable<Recipe>> GetByProductIdAsync(int productId);

        // Thêm dòng công thức
        Task AddAsync(Recipe recipe);

        // Xóa dòng công thức
        Task<bool> DeleteAsync(int id);

        // Kiểm tra xem nguyên liệu này đã có trong món chưa (tránh trùng)
        Task<bool> ExistsAsync(int productId, int ingredientId);
    }
}