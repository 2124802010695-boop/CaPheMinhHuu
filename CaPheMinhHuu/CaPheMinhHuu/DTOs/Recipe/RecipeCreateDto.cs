using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.Recipe
{
    public class RecipeCreateDto
    {
        [Required]
        public int ProductId { get; set; } // Món nào?

        [Required]
        public int IngredientId { get; set; } // Nguyên liệu gì?

        [Required]
        [Range(0.0001, double.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public decimal QuantityRequired { get; set; } // Bao nhiêu? (VD: 0.05 kg)

        // Hệ số hao hụt — mặc định 1.0 (không hao hụt)
        // Ví dụ: 0.8 = 80% nguyên liệu dùng được → hệ thống tự tính cần nhập thêm 25%
        [Range(0.01, 1.0, ErrorMessage = "YieldFactor phải từ 0.01 đến 1.0")]
        public decimal YieldFactor { get; set; } = 1.0m;
    }
}