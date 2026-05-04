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
        public int? TableId { get; set; }

        [Required(ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm")]
        [MinLength(1, ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm")]
        public List<OrderItemDto> Items { get; set; } = new();
    }
    
}
