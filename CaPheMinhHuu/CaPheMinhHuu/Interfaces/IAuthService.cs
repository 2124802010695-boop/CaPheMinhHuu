using CaPheMinhHuu.DTOs.Auth;

namespace CaPheMinhHuu.Interfaces
{
    public interface IAuthService
    {
        // Nhận vào Request, trả về Response (Token + User Info)
        Task<LoginResponse?> LoginAsync(LoginRequest request);
        // NEW - Admin Portal
        Task<LoginResponse?> AdminLoginAsync(AdminLoginRequest request);
        // NEW - Staff Portal
        Task<LoginResponse?> StaffLoginAsync(StaffLoginRequest request);
        Task<bool> ChangePasswordAsync(string staffCode, string oldPassword, string newPassword);
        // NEW - Helpers
        Task<bool> RecordLoginHistoryAsync(int userId, string portal, string status, string? ipAddress, string? userAgent, string? failReason = null);
        // Refresh Token
        Task<LoginResponse?> RefreshTokenAsync(string refreshToken, string? ipAddress);
        Task<bool> RevokeTokenAsync(string refreshToken, string? ipAddress);
    }
}
