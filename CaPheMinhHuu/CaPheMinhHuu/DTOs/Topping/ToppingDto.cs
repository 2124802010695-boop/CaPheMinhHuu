using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.Topping
{
    public class ToppingCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public int? IngredientId { get; set; }

        [Range(0, double.MaxValue)]
        public decimal PortionSize { get; set; } = 0;

        [MaxLength(20)]
        public string? PortionUnit { get; set; }
    }

    public class ToppingUpdateDto
    {
        [MaxLength(200)]
        public string? Name { get; set; }
        [Range(0, double.MaxValue)]
        public decimal? Price { get; set; }
        public int? IngredientId { get; set; }
        public decimal? PortionSize { get; set; }
        [MaxLength(20)]
        public string? PortionUnit { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ToppingViewDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
        public int? IngredientId { get; set; }
        public string? IngredientName { get; set; }
        public decimal PortionSize { get; set; }
        public string? PortionUnit { get; set; }
    }
}
