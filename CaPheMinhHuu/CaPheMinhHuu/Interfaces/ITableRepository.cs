using CaPheMinhHuu.Models;
namespace CaPheMinhHuu.Interfaces
{
    public interface ITableRepository
    {
        Task<IEnumerable<Table>> GetAllAsync();
        Task<Table?> GetByIdAsync(int id);
        Task<Table> CreateAsync(Table table);
        Task UpdateAsync(Table table);
        Task DeleteAsync(int id);
        Task UpdateStatusAsync(int tableId, string status);
    }

}