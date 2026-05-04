using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.Order
{
    public class OrderItemDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "ProductId phải > 0")]
        public int ProductId { get; set; }

        [Range(1, 100, ErrorMessage = "Số lượng phải từ 1 đến 100")]
        public int Quantity { get; set; }

        public string? Note { get; set; }
    }
}
