namespace CaPheMinhHuu.Models
{
    public class OrderItem : BaseEntity
    {
        
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal PriceAtOrder { get; set; }
        public string? Note { get; set; }          // Ghi chú từng món: "ít đá", "không đường"...

        // Khóa ngoại
        public Order Order { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
