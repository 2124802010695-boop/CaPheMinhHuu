using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace CaPheMinhHuu.Models
{
    [Table("RequestTicket")]
    public class RequestTicket
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [StringLength(20)]
        public string Type { get; set; } = null!;  // AdminRequest, StaffApplication
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = null!;
        [Required]
        [StringLength(100)]
        public string Email { get; set; } = null!;
        [Required]
        [StringLength(15)]
        public string Phone { get; set; } = null!;
        [StringLength(500)]
        public string? Message { get; set; }
        [StringLength(20)]
        public string? Position { get; set; }  // Cashier, Kitchen (cho Staff)
        [StringLength(500)]
        public string? Experience { get; set; }
        [StringLength(500)]
        public string? SocialLinks { get; set; }  // JSON
        [StringLength(20)]
        public string Status { get; set; } = "Pending";  // Pending, Approved, Rejected
        public int? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        [StringLength(500)]
        public string? ReviewNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        // Navigation
        [ForeignKey("ReviewedBy")]
        public User? Reviewer { get; set; }
    }
}