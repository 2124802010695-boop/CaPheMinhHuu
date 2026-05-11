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
        public string? OrderCode { get; set; }
        public string? Email { get; set; }
        public string? CashierName { get; set; }
        public bool IsPaid { get; set; }
        public List<OrderItemViewDto> Items { get; set; } = new();
    }
    
}