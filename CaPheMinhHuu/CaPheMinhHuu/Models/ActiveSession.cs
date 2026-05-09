using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    [Table("ActiveSessions")]
    public class ActiveSession
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(100)]
        public string TabId { get; set; } = null!;

        [Required]
        [StringLength(20)]
        public string Role { get; set; } = null!;

        [StringLength(45)]
        public string? IpAddress { get; set; }

        [StringLength(500)]
        public string? UserAgent { get; set; }

        public DateTime LoginAt { get; set; } = DateTime.Now;
        public DateTime LastSeen { get; set; } = DateTime.Now;
        public DateTime? LogoutAt { get; set; }
        public bool IsActive { get; set; } = true;

        [StringLength(50)]
        public string? LogoutReason { get; set; }
        // Manual, Crash, ForceAdmin, TokenExpired

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}
