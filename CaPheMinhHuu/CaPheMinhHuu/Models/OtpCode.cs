namespace CaPheMinhHuu.Models
{
    public class OtpCode : BaseEntity
    {
        public string Target { get; set; } = null!;      // Email hoặc Phone
        public string TargetType { get; set; } = "Email"; // Email, Phone
        public string Code { get; set; } = null!;          // 6 số
        public string Purpose { get; set; } = "Register";  // Register, ResetPassword, VerifyEmail
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; } = false;
        public int AttemptCount { get; set; } = 0;         // Chống brute-force (max 5)
    }
}
