namespace CaPheMinhHuu.DTOs.Ingredient
{
    /// <summary>
    /// DTO để hiển thị thông tin nguyên liệu
    /// Bao gồm: Master data + Tồn kho realtime + Units + Batches
    /// </summary>
    public class IngredientViewDto
    {
        // ========== MASTER DATA ==========
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? SKU { get; set; }
        public string BaseUnit { get; set; } = string.Empty;
        public int IngredientCategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal MinStock { get; set; }
        public decimal MaxStock { get; set; }
        public int DefaultShelfLifeDays { get; set; }

        // ========== TỒN KHO REALTIME ==========
        /// <summary>
        /// Tổng tồn kho hiện tại = SUM(InventoryBatch.CurrentQuantity)
        /// Tính realtime khi query
        /// </summary>
        public decimal CurrentStock { get; set; }

        /// <summary>
        /// Trạng thái tồn kho
        /// </summary>
        public string StockStatus { get; set; } = string.Empty; // "OK", "Low", "Out"

        // ========== ĐƠN VỊ QUY ĐỔI ==========
        public List<IngredientUnitViewDto> Units { get; set; } = new();

        // ========== LÔ HÀNG ==========
        /// <summary>
        /// Danh sách lô hàng (chỉ lô còn hàng, chưa xóa)
        /// </summary>
        public List<InventoryBatchViewDto> Batches { get; set; } = new();

        // ========== AUDIT ==========
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    /// <summary>
    /// DTO hiển thị đơn vị quy đổi
    /// </summary>
    public class IngredientUnitViewDto
    {
        public int Id { get; set; }
        public string UnitName { get; set; } = string.Empty;
        public decimal ConversionRate { get; set; }
        public bool IsBaseUnit { get; set; }
    }

    /// <summary>
    /// DTO hiển thị lô hàng
    /// </summary>
    public class InventoryBatchViewDto
    {
        public int Id { get; set; }
        public string BatchCode { get; set; } = string.Empty;
        public decimal CurrentQuantity { get; set; }
        public decimal InitialQuantity { get; set; }
        public decimal ImportPricePerBaseUnit { get; set; }
        public DateTime ImportDate { get; set; }
        public DateTime? ManufactureDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        
        /// <summary>
        /// Số ngày còn lại đến HSD
        /// </summary>
        public int? DaysUntilExpiry { get; set; }
        
        /// <summary>
        /// Trạng thái HSD: "Fresh", "NearExpiry", "Expired"
        /// </summary>
        public string ExpiryStatus { get; set; } = string.Empty;
    }
}