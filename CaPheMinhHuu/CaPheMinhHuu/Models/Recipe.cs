using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    public class Recipe : BaseEntity
    {
      

        // Món nào? (FK)
        public int ProductId { get; set; }
        public Product? Product { get; set; }

        // Dùng nguyên liệu gì? (FK)
        public int IngredientId { get; set; }
        public Ingredient? Ingredient { get; set; }

        // Dùng bao nhiêu?
        [Column(TypeName = "decimal(18,4)")] // Dùng 4 số lẻ để chính xác (VD: 0.0025 kg)
        public decimal QuantityRequired { get; set; }

        public string? Note { get; set; }
    }
}