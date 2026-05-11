using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    public class OrderItem : BaseEntity
    {
        
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal PriceAtOrder { get; set; }
        public string? Note { get; set; }          // Ghi chú từng món: "ít đá", "không đường"...

        // Size customization
        public string? SizeLabel { get; set; }          // "S" / "M" / "L"
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal SizeExtraPrice { get; set; } = 0; // Phụ thu size
        public decimal SizeMultiplier { get; set; } = 1.0m;

        // Sugar & Ice level
        public string? SugarLevel { get; set; }  // "0%" / "25%" / "50%" / "75%" / "100%"
        public string? IceLevel { get; set; }    // "Không đá" / "Ít đá" / "Bình thường" / "Nhiều đá"

        // Topping total (denormalized)
        [Column(TypeName = "decimal(18,2)")]
        public decimal ToppingTotal { get; set; } = 0;  // SUM(LineTotal) của tất cả toppings

        // Navigation
        public ICollection<OrderItemTopping> Toppings { get; set; } = new List<OrderItemTopping>();

        // BOM Snapshot — định mức nguyên liệu tại thời điểm order (1 OrderItem → nhiều dòng snapshot)
        public ICollection<OrderItemIngredientSnapshot> IngredientSnapshots { get; set; } = new List<OrderItemIngredientSnapshot>();

        // Khóa ngoại
        public Order Order { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
