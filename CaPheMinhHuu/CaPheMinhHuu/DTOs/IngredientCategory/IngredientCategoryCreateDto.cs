using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.IngredientCategory
{
    public class IngredientCategoryCreateDto
    {
        [Required(ErrorMessage = "Tên loại nguyên liệu là bắt buộc")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
    }
}