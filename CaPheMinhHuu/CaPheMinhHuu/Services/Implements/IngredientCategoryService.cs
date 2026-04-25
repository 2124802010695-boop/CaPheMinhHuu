using CaPheMinhHuu.DTOs.IngredientCategory;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Services.Implements
{
    public class IngredientCategoryService : IIngredientCategoryService
    {
        private readonly IIngredientCategoryRepository _repository;

        public IngredientCategoryService(IIngredientCategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<IngredientCategoryViewDto>> GetAllAsync()
        {
            var data = await _repository.GetAllAsync();
            return data.Select(x => new IngredientCategoryViewDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description ?? "",
            });
        }

        public async Task<IngredientCategoryViewDto> GetByIdAsync(int id)
        {
            var x = await _repository.GetByIdAsync(id);
            if (x == null) throw new KeyNotFoundException("Không tìm thấy danh mục");

            return new IngredientCategoryViewDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description ?? ""
            };
        }

        public async Task<IngredientCategoryViewDto> CreateAsync(IngredientCategoryCreateDto dto)
        {
            var entity = new IngredientCategory
            {
                Name = dto.Name,
                Description = dto.Description
            };

            var newEntity = await _repository.AddAsync(entity);

            return new IngredientCategoryViewDto
            {
                Id = newEntity.Id,
                Name = newEntity.Name,
                Description = newEntity.Description ?? ""
            };
        }

        public async Task UpdateAsync(int id, IngredientCategoryUpdateDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) throw new KeyNotFoundException("Không tìm thấy danh mục");

            entity.Name = dto.Name;
            entity.Description = dto.Description;

            await _repository.UpdateAsync(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var result = await _repository.DeleteAsync(id);
            if (!result) throw new KeyNotFoundException("Không tìm thấy danh mục để xóa");
        }
    }
}