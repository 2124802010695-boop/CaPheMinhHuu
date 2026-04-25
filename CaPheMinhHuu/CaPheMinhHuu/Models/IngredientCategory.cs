using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.Models
{
    // Đây là bảng danh mục nhóm: VD: "Trái cây", "Siro", "Bao bì"
    public class IngredientCategory : BaseEntity
    {
        

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
    }
}