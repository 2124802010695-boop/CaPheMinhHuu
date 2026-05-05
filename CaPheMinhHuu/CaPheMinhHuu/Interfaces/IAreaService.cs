using CaPheMinhHuu.DTOs.Area;

namespace CaPheMinhHuu.Interfaces
{
    public interface IAreaService
    {
        Task<IEnumerable<AreaResponseDto>> GetAllAsync();
        Task<AreaResponseDto?> GetByIdAsync(int id);
        Task<AreaResponseDto> CreateAsync(AreaCreateDto dto);
        Task UpdateAsync(int id, AreaUpdateDto dto);
        Task DeleteAsync(int id);
    }
}
