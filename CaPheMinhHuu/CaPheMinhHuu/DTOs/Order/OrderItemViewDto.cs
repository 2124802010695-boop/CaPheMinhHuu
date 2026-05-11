namespace CaPheMinhHuu.DTOs.Order
{
    public class OrderItemViewDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal PriceAtOrder { get; set; }
        public string? Note { get; set; }
        public string? ImageUrl { get; set; }

        // Size
        public string? SizeLabel { get; set; }
        public decimal SizeExtraPrice { get; set; }

        // Sugar & Ice
        public string? SugarLevel { get; set; }
        public string? IceLevel { get; set; }

        // Toppings
        public decimal ToppingTotal { get; set; }
        public List<OrderItemToppingViewDto> Toppings { get; set; } = new();

        // Snapshot định mức tại thời điểm order (cho COGS + variance report)
        public decimal RecipeSnapshotQty { get; set; }

        // Subtotal chuẩn hóa:
        // = (PriceAtOrder + SizeExtraPrice) × Quantity + ToppingTotal
        public decimal SubtotalFull => (PriceAtOrder + SizeExtraPrice) * Quantity + ToppingTotal;
    }
}
