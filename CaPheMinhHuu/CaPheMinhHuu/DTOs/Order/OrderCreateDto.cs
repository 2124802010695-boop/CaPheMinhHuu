namespace CaPheMinhHuu.DTOs.Order
{
    public class OrderCreateDto
    {
        public string CustomerName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? Address { get; set; }
        public string PaymentMethod { get; set; } = "Cash";
        public int TableNumber { get; set; } = 0;
        public List<OrderItemDto> Items { get; set; } = new();
    }
    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}