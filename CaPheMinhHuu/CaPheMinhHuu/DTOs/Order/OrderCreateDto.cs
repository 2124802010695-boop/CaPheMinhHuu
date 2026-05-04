using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.Order
{
    public class OrderCreateDto
    {
        // POS tại quán: customer info không bắt buộc
        public string? CustomerName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string PaymentMethod { get; set; } = "Cash";
        public int TableNumber { get; set; } = 0;

        [Required(ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm")]
        [MinLength(1, ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm")]
        public List<OrderItemDto> Items { get; set; } = new();
    }
    public class OrderItemDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "ProductId phải > 0")]
        public int ProductId { get; set; }

        [Range(1, 100, ErrorMessage = "Số lượng phải từ 1 đến 100")]
        public int Quantity { get; set; }
    }
}