using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.Ingredient
{
    /// <summary>
    /// DTO để thêm đơn vị quy đổi cho nguyên liệu
    /// IsBaseUnit luôn = false — không nhận từ client
    /// </summary>
    public class AddIngredientUnitDto
    {
        [Required(ErrorMessage = "Tên đơn vị không được để trống")]
        [MaxLength(50, ErrorMessage = "Tên đơn vị tối đa 50 ký tự")]
        public string UnitName { get; set; } = string.Empty;

        [Range(0.001, double.MaxValue, ErrorMessage = "Tỷ lệ quy đổi phải > 0")]
        public decimal ConversionRate { get; set; }
    }
}
