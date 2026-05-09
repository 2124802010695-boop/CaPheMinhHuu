using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IOtpRepository
    {
        Task<OtpCode?> GetActiveOtpAsync(string target, string purpose);
        Task AddAsync(OtpCode otp);
        Task UpdateAsync(OtpCode otp);
        Task DeleteExpiredAsync();
    }
}
