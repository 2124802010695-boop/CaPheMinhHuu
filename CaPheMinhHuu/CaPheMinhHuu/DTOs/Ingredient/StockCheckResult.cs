namespace CaPheMinhHuu.DTOs.Ingredient
{
    /// <summary>
    /// Kết quả kiểm tra tồn kho cho đơn hàng
    /// </summary>
    public class StockCheckResult
    {
        public bool IsAvailable { get; set; }
        public List<StockShortage> Shortages { get; set; } = new();
    }

    /// <summary>
    /// Chi tiết nguyên liệu thiếu
    /// </summary>
    public class StockShortage
    {
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = "";
        public decimal Required { get; set; }
        public decimal Available { get; set; }
        public decimal Shortage { get; set; }
    }
}
