using CaPheMinhHuu.DTOs.Category;

namespace CaPheMinhHuu.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
        Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto createDto);
        Task<bool> DeleteCategoryAsync(int id);
        Task<bool> UpdateCategoryAsync(int id, CategoryUpdateDto dto);

    }
}