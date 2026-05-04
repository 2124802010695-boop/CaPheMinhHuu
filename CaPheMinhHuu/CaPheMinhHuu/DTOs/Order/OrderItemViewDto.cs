namespace CaPheMinhHuu.DTOs.Order
{
    public class OrderItemViewDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal PriceAtOrder { get; set; }
        public decimal Subtotal { get; set; }
        public string? Note { get; set; }
    }
}
