using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    /// <summary>
    /// Inventory movement ledger — 1 row per batch per deduction.
    /// Immutable audit trail: không sửa, không xóa.
    /// Phục vụ: FIFO audit, variance analysis, COGS, batch traceability.
    /// </summary>
    public class IngredientUsageLog : BaseEntity
    {
        // Order context — snapshot, không FK để tránh cascade delete
        public int OrderId { get; set; }
        public int OrderItemId { get; set; }
        public string OrderCode { get; set; } = null!;
        public DateTime OrderDate { get; set; }

        // Batch — nullable FK: batch xóa → log vẫn sống
        public int? BatchId { get; set; }
        public InventoryBatch? Batch { get; set; }
        public string BatchCode { get; set; } = null!;      // snapshot
        public DateTime BatchImportDate { get; set; }        // snapshot — FIFO ordering proof

        // Ingredient — snapshot, không FK
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = null!;
        public string BaseUnit { get; set; } = null!;

        // Cost snapshot tại thời điểm deduct
        [Column(TypeName = "decimal(18,4)")]
        public decimal CostPerBaseUnit { get; set; }         // = batch.ImportPricePerBaseUnit

        [Column(TypeName = "decimal(18,4)")]
        public decimal DeductedQty { get; set; }             // thực tế trừ từ batch này

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCost { get; set; }               // = DeductedQty × CostPerBaseUnit

        // BOM reference
        [Column(TypeName = "decimal(18,4)")]
        public decimal TheoreticalQty { get; set; }          // proportional split của batch này

        [Column(TypeName = "decimal(18,4)")]
        public decimal Variance { get; set; }                // DeductedQty - TheoreticalQty (0 ban đầu)

        public int RecipeVersion { get; set; } = 1;
    }
}
