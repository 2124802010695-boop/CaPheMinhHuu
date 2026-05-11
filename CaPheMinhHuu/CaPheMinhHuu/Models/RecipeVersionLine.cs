using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    /// <summary>
    /// Snapshot một dòng nguyên liệu trong RecipeVersion.
    /// Không dùng FK cho IngredientId — immutable historical record.
    /// UnitCostSnapshot = WACC của ingredient tại thời điểm tạo version.
    /// </summary>
    public class RecipeVersionLine : BaseEntity
    {
        public int RecipeVersionId { get; set; }
        public RecipeVersion? RecipeVersion { get; set; }

        // Snapshot — không FK để tránh phụ thuộc vào bảng Ingredients
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = null!;
        public string BaseUnit { get; set; } = null!;

        [Column(TypeName = "decimal(18,4)")]
        public decimal QuantityRequired { get; set; }

        [Column(TypeName = "decimal(5,4)")]
        public decimal YieldFactor { get; set; } = 1.0m;

        // WACC tại thời điểm tạo version — cho historical costing + margin analysis
        [Column(TypeName = "decimal(18,4)")]
        public decimal UnitCostSnapshot { get; set; } = 0;

        public string? Note { get; set; }
    }
}
