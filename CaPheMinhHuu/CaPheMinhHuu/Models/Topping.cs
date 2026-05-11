using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    public class Topping : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public bool IsActive { get; set; } = true;

        // Liên kết với Ingredient để trừ kho (nullable — topping không bắt buộc có kho)
        public int? IngredientId { get; set; }
        public Ingredient? Ingredient { get; set; }

        // Mỗi lần dùng trừ bao nhiêu (gram/ml/viên)
        [Column(TypeName = "decimal(18,3)")]
        public decimal PortionSize { get; set; } = 0;

        [MaxLength(20)]
        public string? PortionUnit { get; set; } // gram, ml, viên, phần

        // Navigation
        public ICollection<OrderItemTopping> OrderItemToppings { get; set; } = new List<OrderItemTopping>();
    }
}
