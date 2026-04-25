using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IIngredientCategoryRepository
    {
        Task<IEnumerable<IngredientCategory>> GetAllAsync();
        Task<IngredientCategory?> GetByIdAsync(int id);
        Task<IngredientCategory> AddAsync(IngredientCategory category);
        Task<IngredientCategory> UpdateAsync(IngredientCategory category);
        Task<bool> DeleteAsync(int id);
    }
}