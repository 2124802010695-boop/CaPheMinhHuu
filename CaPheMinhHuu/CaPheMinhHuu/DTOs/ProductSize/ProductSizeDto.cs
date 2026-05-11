using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.ProductSize
{
    public class ProductSizeCreateDto
    {
        [Required]
        [MaxLength(10)]
        public string Label { get; set; } = string.Empty; // S, M, L, XL

        [Range(0, double.MaxValue)]
        public decimal PriceExtra { get; set; } = 0;

        [Range(0.1, 10)]
        public decimal RecipeMultiplier { get; set; } = 1.0m;

        public int SortOrder { get; set; } = 0;
    }

    public class ProductSizeUpdateDto
    {
        public decimal? PriceExtra { get; set; }
        [Range(0.1, 10)]
        public decimal? RecipeMultiplier { get; set; }
        public bool? IsActive { get; set; }
        public int? SortOrder { get; set; }
    }

    public class ProductSizeViewDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Label { get; set; } = null!;
        public decimal PriceExtra { get; set; }
        public decimal RecipeMultiplier { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
    }
}
