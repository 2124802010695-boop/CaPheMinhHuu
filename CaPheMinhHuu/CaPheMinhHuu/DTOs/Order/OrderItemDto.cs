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

        // Size customization
        public string? SizeLabel { get; set; }        // "S" / "M" / "L"
        public decimal SizeMultiplier { get; set; } = 1.0m; // RecipeMultiplier từ ProductSizes

        // Sugar & Ice
        public string? SugarLevel { get; set; }  // "0%" / "25%" / "50%" / "75%" / "100%"
        public string? IceLevel { get; set; }    // "Không đá" / "Ít đá" / "Bình thường" / "Nhiều đá"

        // Toppings
        public List<OrderItemToppingDto> Toppings { get; set; } = new();
    }
}
