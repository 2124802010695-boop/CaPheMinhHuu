using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IIngredientUnitRepository
    {
        Task<IEnumerable<IngredientUnit>> GetAllAsync();
        Task<IngredientUnit?> GetByIdAsync(int id);
        Task<IngredientUnit> AddAsync(IngredientUnit unit);
        Task<IngredientUnit> UpdateAsync(IngredientUnit unit);
        Task<bool> DeleteAsync(int id);

        // Custom method: Lấy tất cả đơn vị của 1 nguyên liệu
        Task<IEnumerable<IngredientUnit>> GetByIngredientIdAsync(int ingredientId);
    }
}