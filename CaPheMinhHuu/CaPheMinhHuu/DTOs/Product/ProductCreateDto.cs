using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
namespace CaPheMinhHuu.DTOs.Product
{
    public class ProductCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

         public string? Unit { get; set; }
        public string? ImageUrl { get; set; }
        public IFormFile? ImageFile { get; set; }// Tạm thời gửi link ảnh string
        public int PreparationTime { get; set; }
        public int? CategoryId { get; set; }
    }
}