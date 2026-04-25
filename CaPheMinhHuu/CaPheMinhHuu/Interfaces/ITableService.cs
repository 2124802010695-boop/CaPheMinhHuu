using CaPheMinhHuu.Models;
using CaPheMinhHuu.DTOs.Table;

namespace CaPheMinhHuu.Interfaces
{
    public interface ITableService
    {
        Task<IEnumerable<Table>> GetAllAsync();
        Task<Table?> GetByIdAsync(int id);
        Task<Table> CreateAsync(CreateTableDto dto);
        Task UpdateAsync(int id, UpdateTableDto dto);
        Task UpdateStatusAsync(int id, string status);
        Task DeleteAsync(int id);
    }
}