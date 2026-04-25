namespace CaPheMinhHuu.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = null!;           // Chuỗi token ngẫu nhiên
        public int UserId { get; set; }                       // FK tới User
        public DateTime ExpiresAt { get; set; }               // Hết hạn khi nào
        public DateTime CreatedAt { get; set; }               // Tạo lúc nào
        public string? CreatedByIp { get; set; }              // IP tạo token
        public DateTime? RevokedAt { get; set; }              // Bị thu hồi lúc nào (null = chưa)
        public string? RevokedByIp { get; set; }              // IP thu hồi
        public string? ReplacedByToken { get; set; }          // Token mới thay thế

        // Navigation
        public User User { get; set; } = null!;

        // Computed properties
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt != null;
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}