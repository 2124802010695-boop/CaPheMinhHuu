using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.Category
{
    public class CategoryCreateDto
    {
        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}