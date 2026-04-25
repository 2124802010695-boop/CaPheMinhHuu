using CaPheMinhHuu.DTOs.Recipe;

namespace CaPheMinhHuu.Interfaces
{
    public interface IRecipeService
    {
        Task<IEnumerable<RecipeViewDto>> GetByProductIdAsync(int productId);
        Task<RecipeViewDto> AddIngredientToProductAsync(RecipeCreateDto dto);
        Task<bool> RemoveIngredientFromProductAsync(int recipeId);
    }
}