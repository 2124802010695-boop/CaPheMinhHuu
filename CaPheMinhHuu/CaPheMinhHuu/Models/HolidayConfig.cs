using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace CaPheMinhHuu.Models
{
    [Table("HolidayConfig")]
    public class HolidayConfig
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public DateTime Date { get; set; }  // Ngày lễ
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;  // Tên ngày lễ
        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal SalaryMultiplier { get; set; } = 1.0m;  // Hệ số nhân (2.0 = x2, 3.0 = x3)
        public bool IsActive { get; set; } = true;
        public int CreatedBy { get; set; }  // Admin tạo
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        // Navigation
        [ForeignKey("CreatedBy")]
        public User Creator { get; set; } = null!;
    }
}