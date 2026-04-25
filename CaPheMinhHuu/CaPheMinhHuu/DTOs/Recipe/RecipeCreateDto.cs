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
    }
}