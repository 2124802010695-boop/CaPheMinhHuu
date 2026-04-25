using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.Ingredient
{
    /// <summary>
    /// DTO để tạo lô hàng mới (Alias cho InventoryBatchCreateDto)
    /// </summary>
    public class BatchCreateDto : InventoryBatchCreateDto
    {
        // Kế thừa tất cả properties từ InventoryBatchCreateDto
    }

    /// <summary>
    /// DTO để cập nhật thông tin lô hàng
    /// </summary>
    public class BatchUpdateDto
    {
        [MaxLength(50)]
        public string? BatchCode { get; set; }

        [Range(0.001, double.MaxValue, ErrorMessage = "Số lượng phải > 0")]
        public decimal? Quantity { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá nhập phải >= 0")]
        public decimal? ImportPricePerBaseUnit { get; set; }

        public DateTime? ImportDate { get; set; }

        public DateTime? ManufactureDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public int? LocationId { get; set; }
    }
}
