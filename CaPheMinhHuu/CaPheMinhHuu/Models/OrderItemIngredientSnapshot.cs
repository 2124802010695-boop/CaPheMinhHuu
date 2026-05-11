using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    /// <summary>
    /// BOM Snapshot — lưu định mức nguyên liệu tại thời điểm order.
    /// Immutable: không bị ảnh hưởng khi recipe thay đổi sau này.
    /// Dùng cho: COGS history, variance analysis, audit trail.
    /// </summary>
    public class OrderItemIngredientSnapshot : BaseEntity
    {
        // FK → OrderItem (Cascade delete)
        public int OrderItemId { get; set; }
        public OrderItem OrderItem { get; set; } = null!;

        // Snapshot thông tin nguyên liệu — KHÔNG dùng FK để tránh phụ thuộc vào bảng Ingredients
        // Dữ liệu này là chứng từ kế toán, phải bất biến
        public int IngredientId { get; set; }                    // Reference only, không FK constraint
        public string IngredientName { get; set; } = null!;      // Snapshot tên tại thời điểm order
        public string BaseUnit { get; set; } = null!;            // Snapshot đơn vị kho

        // Snapshot từ Recipe tại thời điểm order
        [Column(TypeName = "decimal(18,4)")]
        public decimal QuantityRequired { get; set; }            // Định mức gốc từ Recipe

        [Column(TypeName = "decimal(5,4)")]
        public decimal YieldFactor { get; set; } = 1.0m;        // Hệ số hao hụt từ Recipe

        public int RecipeVersion { get; set; } = 1;              // Version recipe tại thời điểm order

        // Snapshot từ OrderItem
        [Column(TypeName = "decimal(18,4)")]
        public decimal SizeMultiplier { get; set; } = 1.0m;     // Từ ProductSize.RecipeMultiplier

        public int OrderQuantity { get; set; }                   // OrderItem.Quantity

        // Kết quả tính toán — ActualDeducted = (QuantityRequired / YieldFactor) × SizeMultiplier × OrderQuantity
        [Column(TypeName = "decimal(18,4)")]
        public decimal ActualDeducted { get; set; }
    }
}
