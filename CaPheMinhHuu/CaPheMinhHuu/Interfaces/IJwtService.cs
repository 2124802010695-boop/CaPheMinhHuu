using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IJwtService
    {
        string GenerateAccessToken(User user);
        string GenerateAccessToken(User user, int? shiftId = null);
        RefreshToken GenerateRefreshToken(int userId, string? ipAddress = null);
    }
}
