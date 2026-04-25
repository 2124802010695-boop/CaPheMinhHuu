using CaPheMinhHuu.DTOs.Category;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Services.Implements
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            // Chuyển đổi Entity sang DTO (Mapping thủ công)
            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            });
        }

        public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto createDto)
        {
            var newCategory = new Category
            {
                Name = createDto.Name,
                Description = createDto.Description
            };

            var created = await _categoryRepository.AddAsync(newCategory);

            return new CategoryDto
            {
                Id = created.Id,
                Name = created.Name,
                Description = created.Description
            };
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            return await _categoryRepository.DeleteAsync(id);
        }
        public async Task<bool> UpdateCategoryAsync(int id, CategoryUpdateDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return false;

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.UpdatedDate = DateTime.Now;

            await _categoryRepository.UpdateAsync(category);
            return true;
        }
    }
}