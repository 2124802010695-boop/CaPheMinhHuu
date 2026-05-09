using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace CaPheMinhHuu.Models
{
    [Table("User")]
    public class User : BaseEntity
    {
        
        
        // ===== USERNAME (Dùng cho cả Admin và Staff) =====
        [Required]
        [StringLength(20)]
        public string Username { get; set; } = null!;  // VD: "admin", "nhi_ca", "binh_ki"
        // ===== COMMON =====
        [StringLength(100)]
        public string? Email { get; set; }
        [StringLength(15)]
        public string? Phone { get; set; }
        [StringLength(255)]
        public string? PasswordHash { get; set; }
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = null!;
        [StringLength(255)]
        public string? Avatar { get; set; }
        // ===== ROLE & AUTH =====
        [Required]
        [StringLength(20)]
        public string Role { get; set; } = "Customer";  // Admin, Cashier, Kitchen, Customer
        [StringLength(20)]
        public string? AuthProvider { get; set; }  // Local, Google, Facebook
        [StringLength(100)]
        public string? GoogleId { get; set; }
        [StringLength(100)]
        public string? FacebookId { get; set; }
        // ===== STATUS =====
        public bool IsActive { get; set; } = true;
        public bool IsFirstLogin { get; set; } = true;  // Bắt buộc đổi mật khẩu (Staff)
        public bool IsEmailVerified { get; set; } = false;
        public int LoyaltyPoints { get; set; } = 0;
        public DateTime? DateOfBirth { get; set; }
        public bool IsPhoneVerified { get; set; } = false;
        // ===== SECURITY =====
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LockedUntil { get; set; }
        public DateTime? LastLoginAt { get; set; }
        // ===== STAFF SALARY =====
        [Column(TypeName = "decimal(18,2)")]
        public decimal? Salary { get; set; }  // Lương cơ bản
        [Column(TypeName = "decimal(5,2)")]
        public decimal? SalaryCoefficient { get; set; }  // Hệ số lương
        // ===== AUDIT =====
        public int? CreatedBy { get; set; }  // Admin tạo nhân viên
        
        // ===== NAVIGATION =====
        [ForeignKey("CreatedBy")]
        public User? Creator { get; set; }
    }
}