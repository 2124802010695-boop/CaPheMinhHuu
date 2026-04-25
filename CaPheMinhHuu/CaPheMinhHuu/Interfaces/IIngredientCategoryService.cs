using CaPheMinhHuu.DTOs.IngredientCategory;

namespace CaPheMinhHuu.Interfaces
{
    public interface IIngredientCategoryService
    {
        // Lấy danh sách hiển thị
        Task<IEnumerable<IngredientCategoryViewDto>> GetAllAsync();

        // Lấy chi tiết 1 cái
        Task<IngredientCategoryViewDto> GetByIdAsync(int id);

        // Tạo mới (Dùng DTO Create để validate input)
        Task<IngredientCategoryViewDto> CreateAsync(IngredientCategoryCreateDto dto);

        // Cập nhật
        Task UpdateAsync(int id, IngredientCategoryUpdateDto dto);

        // Xóa
        Task DeleteAsync(int id);
    }
}