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

        // Hệ số hao hụt (Yield Factor) — chuẩn BOM công nghiệp
        // 1.0 = không hao hụt, 0.8 = chỉ dùng được 80% → cần nhập 1/0.8 = 1.25x
        [Column(TypeName = "decimal(5,4)")]
        public decimal YieldFactor { get; set; } = 1.0m;

        // Trạng thái dòng công thức — cho phép disable mà không xóa
        public bool IsActive { get; set; } = true;

        // Phiên bản công thức — tăng khi update QuantityRequired hoặc YieldFactor
        public int Version { get; set; } = 1;

        public string? Note { get; set; }
    }
}