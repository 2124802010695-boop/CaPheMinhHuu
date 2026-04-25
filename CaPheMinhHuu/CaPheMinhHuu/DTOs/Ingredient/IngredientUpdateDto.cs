using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.Ingredient
{
    /// <summary>
    /// DTO để cập nhật thông tin nguyên liệu
    /// CHỈ cập nhật Master Data, KHÔNG cập nhật Units và Batches
    /// </summary>
    public class IngredientUpdateDto
    {
        [Required(ErrorMessage = "Tên nguyên liệu không được để trống")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? SKU { get; set; }

        [Required(ErrorMessage = "Đơn vị cơ bản không được để trống")]
        [MaxLength(20)]
        public string BaseUnit { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng chọn nhóm nguyên liệu")]
        public int IngredientCategoryId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Tồn tối thiểu phải >= 0")]
        public decimal MinStock { get; set; } = 0;

        [Range(0, double.MaxValue, ErrorMessage = "Tồn tối đa phải >= 0")]
        public decimal MaxStock { get; set; } = 0;

        public int DefaultShelfLifeDays { get; set; } = 180;
    }
}
