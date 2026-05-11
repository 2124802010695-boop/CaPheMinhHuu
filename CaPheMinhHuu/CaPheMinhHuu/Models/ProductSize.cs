using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    public class ProductSize : BaseEntity
    {
        public int ProductId { get; set; }
        public Product? Product { get; set; }

        [Required]
        [MaxLength(10)]
        public string Label { get; set; } = string.Empty; // S, M, L, XL

        // Giá cộng thêm so với giá base (Hướng A — tách giá)
        [Column(TypeName = "decimal(18,2)")]
        public decimal PriceExtra { get; set; } = 0;

        // Hệ số nhân nguyên liệu so với công thức base
        // S=0.8, M=1.0 (default), L=1.2
        [Column(TypeName = "decimal(18,2)")]
        public decimal RecipeMultiplier { get; set; } = 1.0m;

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0; // Thứ tự hiển thị S < M < L
    }
}
