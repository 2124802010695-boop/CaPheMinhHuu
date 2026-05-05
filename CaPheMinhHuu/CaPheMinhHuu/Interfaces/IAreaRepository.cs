using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IAreaRepository
    {
        Task<IEnumerable<Area>> GetAllAsync();
        Task<Area?> GetByIdAsync(int id);
        Task<Area> CreateAsync(Area area);
        Task UpdateAsync(Area area);
        Task DeleteAsync(int id);
    }
}
