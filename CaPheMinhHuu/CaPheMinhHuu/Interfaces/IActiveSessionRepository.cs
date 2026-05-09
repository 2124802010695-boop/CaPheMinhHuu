using CaPheMinhHuu.Models;
namespace CaPheMinhHuu.Interfaces
{
    public interface IActiveSessionRepository
    {
        Task AddAsync(ActiveSession session);
        Task<ActiveSession?> GetByTabIdAsync(string tabId);
        Task<IEnumerable<ActiveSession>> GetActiveByUserIdAsync(int userId);
        Task<IEnumerable<ActiveSession>> GetActiveByTabIdAsync(string tabId);
        Task<IEnumerable<ActiveSession>> GetAllActiveAsync();
        Task UpdateAsync(ActiveSession session);
        Task SaveChangesAsync();
    }
}
