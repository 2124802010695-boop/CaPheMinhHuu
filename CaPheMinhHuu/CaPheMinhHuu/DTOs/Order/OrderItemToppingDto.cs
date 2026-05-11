namespace CaPheMinhHuu.DTOs.Order
{
    // Dùng khi TẠO đơn (input)
    public class OrderItemToppingDto
    {
        public int ToppingId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    // Dùng khi XEM đơn (output)
    public class OrderItemToppingViewDto
    {
        public int ToppingId { get; set; }
        public string ToppingName { get; set; } = null!;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; } // Price × Quantity
    }
}
