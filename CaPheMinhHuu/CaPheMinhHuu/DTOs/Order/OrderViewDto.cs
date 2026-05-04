namespace CaPheMinhHuu.DTOs.Order
{
    public class OrderViewDto
    {
        public int Id { get; set; }
        public string? CustomerName { get; set; }
        public string? Phone { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = null!;
        public DateTime OrderDate { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public int? TableId { get; set; }
        public string? TableName { get; set; }
        public List<OrderItemViewDto> Items { get; set; } = new();
    }
    public class OrderItemViewDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal PriceAtOrder { get; set; }
        public decimal Subtotal { get; set; }
    }
}