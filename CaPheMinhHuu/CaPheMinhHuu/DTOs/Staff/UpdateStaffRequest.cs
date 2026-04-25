using System.ComponentModel.DataAnnotations;
namespace CaPheMinhHuu.DTOs.Staff
{
    public class UpdateStaffRequest
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = null!;
        [Required]
        [StringLength(15)]
        public string Phone { get; set; } = null!;
        [StringLength(100)]
        public string? Email { get; set; }
        [Required]
        public string Role { get; set; } = null!;  // Cashier hoặc Kitchen
        public decimal Salary { get; set; }
        public decimal SalaryCoefficient { get; set; } = 1.0m;
    }
}