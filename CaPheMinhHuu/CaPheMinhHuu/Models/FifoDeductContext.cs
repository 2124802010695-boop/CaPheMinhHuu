namespace CaPheMinhHuu.Models
{
    /// <summary>
    /// Context object truyền vào DeductStockFIFOAsync để log IngredientUsageLog.
    /// Null = không log (backward compat cho các call không cần audit).
    /// </summary>
    public class FifoDeductContext
    {
        public int OrderId { get; set; }
        public int OrderItemId { get; set; }
        public string OrderCode { get; set; } = null!;
        public DateTime OrderDate { get; set; }
        public int RecipeVersion { get; set; } = 1;
    }
}
