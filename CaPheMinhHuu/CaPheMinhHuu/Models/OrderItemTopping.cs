using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    public class OrderItemTopping : BaseEntity
    {
        public int OrderItemId { get; set; }
        public OrderItem? OrderItem { get; set; }

        public int ToppingId { get; set; }
        public Topping? Topping { get; set; }

        // Snapshot tên + giá tại thời điểm order (tránh thay đổi giá sau này ảnh hưởng lịch sử)
        [Required]
        [MaxLength(200)]
        public string ToppingName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } // Giá 1 phần tại thời điểm order

        public int Quantity { get; set; } = 1; // Số phần topping

        // LineTotal = Price × Quantity (denormalized để query nhanh)
        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; } = 0;
    }
}
