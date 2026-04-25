namespace CaPheMinhHuu.DTOs.Shift
{
    public class ZReportDto
    {
        public int ShiftId { get; set; }
        public string CashierName { get; set; } = null!;
        public string AdminName { get; set; } = null!;
        public DateTime OpenTime { get; set; }
        public DateTime CloseTime { get; set; }

        // Tiền
        public decimal OpeningCash { get; set; }
        public decimal ClosingCash { get; set; }
        public decimal? Difference { get; set; } // ClosingCash - OpeningCash - TotalCashRevenue

        // Tổng kết
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }

        // Phân loại thanh toán
        public List<PaymentBreakdownItem> PaymentBreakdown { get; set; } = new();

        // Top sản phẩm bán chạy
        public List<TopProductItem> TopProducts { get; set; } = new();
    }
    public class PaymentBreakdownItem
    {
        public string PaymentMethod { get; set; } = null!;
        public int Count { get; set; }
        public decimal Amount { get; set; }
    }
    public class TopProductItem
    {
        public string ProductName { get; set; } = null!;
        public int QuantitySold { get; set; }
        public decimal Revenue { get; set; }
    }
}