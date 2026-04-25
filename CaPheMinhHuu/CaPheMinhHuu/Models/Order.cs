namespace CaPheMinhHuu.Models
{
    public class Order : BaseEntity
    {
       
        public int? UserId { get; set; } // Cho phép null (khách vãng lai)
        public string CustomerName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Address { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Chờ xử lý";
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public string PaymentMethod { get; set; } = null!;
        public int TableNumber { get; set; } = 0;
        public User? User { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
