namespace CaPheMinhHuu.DTOs.Recipe
{
    public class RecipeVersionDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int VersionNumber { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public bool IsCurrent { get; set; }
        public string? ChangedBy { get; set; }
        public string? ChangeReason { get; set; }
        public List<RecipeVersionLineDto> Lines { get; set; } = new();
    }

    public class RecipeVersionLineDto
    {
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = null!;
        public string BaseUnit { get; set; } = null!;
        public decimal QuantityRequired { get; set; }
        public decimal YieldFactor { get; set; }
        public decimal UnitCostSnapshot { get; set; }
        public string? Note { get; set; }
        // Computed — tổng chi phí lý thuyết cho 1 ly: (QuantityRequired / YieldFactor) × UnitCostSnapshot
        public decimal TheoreticalCostPerUnit =>
            YieldFactor > 0 ? Math.Round((QuantityRequired / YieldFactor) * UnitCostSnapshot, 4) : 0;
    }
}
