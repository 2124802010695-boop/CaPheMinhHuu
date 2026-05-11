using CaPheMinhHuu.DTOs.Topping;

namespace CaPheMinhHuu.Interfaces
{
    public interface IToppingService
    {
        Task<List<ToppingViewDto>> GetAllAsync(bool includeInactive = false);
        Task<ToppingViewDto?> GetByIdAsync(int id);
        Task<ToppingViewDto> CreateAsync(ToppingCreateDto dto);
        Task<ToppingViewDto?> UpdateAsync(int id, ToppingUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ToggleActiveAsync(int id);
    }
}
