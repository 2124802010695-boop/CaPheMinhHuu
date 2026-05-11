namespace CaPheMinhHuu.DTOs.Order
{
    public class GuestOrderCreateDto
    {
        public int? TableId { get; set; }
        public string? Email { get; set; }
        public List<GuestOrderItemDto> Items { get; set; } = new();
    }

    public class GuestOrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? Note { get; set; }
        public string? SizeLabel { get; set; }
        public string? SugarLevel { get; set; }
        public string? IceLevel { get; set; }
        public List<OrderItemToppingDto> Toppings { get; set; } = new();
    }
}
