using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace CaPheMinhHuu.Models
{
    [Table("LoginHistory")]
    public class LoginHistory
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [StringLength(20)]
        public string Portal { get; set; } = null!;  // Admin, Staff, Customer
        public DateTime LoginTime { get; set; } = DateTime.Now;
        [StringLength(50)]
        public DateTime? LogoutTime { get; set; }
        [StringLength(50)]
        public string? IpAddress { get; set; }
        [StringLength(500)]
        public string? UserAgent { get; set; }
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = null!;  // Success, Failed
        [StringLength(100)]
        public string? FailReason { get; set; }
        // Navigation
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}
