using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.Ingredient
{
    /// <summary>
    /// DTO để tạo nguyên liệu mới - FULL OPTION
    /// Bao gồm: Master data + Đơn vị quy đổi + Lô hàng đầu tiên
    /// </summary>
    public class IngredientCreateDto
    {
        // ========== MASTER DATA ==========
        [Required(ErrorMessage = "Tên nguyên liệu không được để trống")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? SKU { get; set; }

        [Required(ErrorMessage = "Đơn vị cơ bản không được để trống")]
        [MaxLength(20)]
        public string BaseUnit { get; set; } = string.Empty; // g, ml, cái

        [Required(ErrorMessage = "Vui lòng chọn nhóm nguyên liệu")]
        public int IngredientCategoryId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Tồn tối thiểu phải >= 0")]
        public decimal MinStock { get; set; } = 0;

        [Range(0, double.MaxValue, ErrorMessage = "Tồn tối đa phải >= 0")]
        public decimal MaxStock { get; set; } = 0;

        public int DefaultShelfLifeDays { get; set; } = 180; // Mặc định 6 tháng

        // ========== ĐơN VỊ QUY ĐỔI (Optional) ==========
        /// <summary>
        /// Danh sách đơn vị quy đổi
        /// VD: [{ UnitName: "hộp", ConversionRate: 500 }, { UnitName: "bao", ConversionRate: 5000 }]
        /// </summary>
        public List<IngredientUnitCreateDto>? Units { get; set; }

        // ========== LÔ HÀNG ĐẦU TIÊN (Optional) ==========
        /// <summary>
        /// Thông tin lô hàng đầu tiên (nếu nhập luôn khi tạo)
        /// </summary>
        public InventoryBatchCreateDto? InitialBatch { get; set; }
    }

    /// <summary>
    /// DTO để tạo đơn vị quy đổi
    /// </summary>
    public class IngredientUnitCreateDto
    {
        [Required]
        [MaxLength(50)]
        public string UnitName { get; set; } = string.Empty; // hộp, bao, thùng

        [Range(0.001, double.MaxValue, ErrorMessage = "Tỷ lệ quy đổi phải > 0")]
        public decimal ConversionRate { get; set; } // 1 hộp = 500g

        public bool IsBaseUnit { get; set; } = false;
    }

    /// <summary>
    /// DTO để tạo lô hàng
    /// </summary>
    public class InventoryBatchCreateDto
    {
        [MaxLength(50)]
        public string? BatchCode { get; set; } // Nếu null, tự động tạo

        [Range(0.001, double.MaxValue, ErrorMessage = "Số lượng phải > 0")]
        public decimal Quantity { get; set; } // Số lượng nhập (theo BaseUnit)

        [Range(0, double.MaxValue, ErrorMessage = "Giá nhập phải >= 0")]
        public decimal ImportPricePerBaseUnit { get; set; } // Giá/đơn vị cơ bản

        public DateTime ImportDate { get; set; } = DateTime.Now;

        public DateTime? ManufactureDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public int? LocationId { get; set; } // Vị trí lưu trữ (nếu có)

        // ========== PURCHASE UNIT (optional) ==========
        /// <summary>
        /// ID đơn vị nhập kho (VD: id của "thùng", "bao")
        /// Nếu có → hệ thống tự tính CurrentQuantity = PurchaseQuantity × ConversionRate
        /// Nếu null → dùng Quantity trực tiếp theo BaseUnit
        /// </summary>
        public int? PurchaseUnitId { get; set; }

        /// <summary>
        /// Số lượng theo đơn vị nhập (VD: 2 thùng)
        /// Bắt buộc nếu PurchaseUnitId có giá trị
        /// </summary>
        [Range(0.001, double.MaxValue, ErrorMessage = "Số lượng nhập phải > 0")]
        public decimal? PurchaseQuantity { get; set; }
    }
}