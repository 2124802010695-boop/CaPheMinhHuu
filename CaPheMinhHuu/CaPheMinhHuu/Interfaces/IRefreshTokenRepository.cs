using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task AddAsync(RefreshToken token);
        Task<RefreshToken?> GetActiveByTokenAsync(string token); // Include User
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<RefreshToken?> GetLatestActiveByUserIdAsync(int userId);
        Task SaveChangesAsync();
    }
}
