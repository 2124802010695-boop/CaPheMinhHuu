namespace CaPheMinhHuu.Models
{
    public class Order : BaseEntity
    {
       
        public int? UserId { get; set; } // Cho phép null (khách vãng lai)
        public string? CustomerName { get; set; }  // Nullable: POS tại quán không cần, Customer online bắt buộc qua DTO
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public string PaymentMethod { get; set; } = null!;
        public int? TableId { get; set; }
        public Table? Table { get; set; }
        public User? User { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public string? Email { get; set; }
        public string OrderCode { get; set; } = "";
        public Payment? Payment { get; set; }

        public int? ShiftId { get; set; }
        public Shift? Shift { get; set; }
    }
}
