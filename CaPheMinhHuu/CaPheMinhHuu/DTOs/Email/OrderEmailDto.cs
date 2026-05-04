namespace CaPheMinhHuu.DTOs.Email
{
    public class OrderEmailDto
    {
        public string OrderCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string TableNumber { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }
        public List<OrderItemInfo> Items { get; set; } = new List<OrderItemInfo>();
    }
}