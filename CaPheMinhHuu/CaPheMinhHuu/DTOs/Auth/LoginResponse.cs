namespace CaPheMinhHuu.DTOs.Auth
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserInfo User { get; set; } = null!;
        public bool IsFirstLogin { get; set; } = false;
    }
    public class UserInfo
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? StaffCode { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Avatar { get; set; }
    }
}