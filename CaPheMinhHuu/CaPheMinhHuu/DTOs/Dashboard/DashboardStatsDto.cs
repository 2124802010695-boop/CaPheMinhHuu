namespace CaPheMinhHuu.DTOs.Dashboard
{
    // DTO chính — trả về cho API /api/Dashboard/stats
    public class DashboardStatsDto
    {
        // === Revenue ===
        public decimal TodayRevenue { get; set; }
        public decimal WeekRevenue { get; set; }
        public decimal MonthRevenue { get; set; }

        // === Orders ===
        public int TodayOrders { get; set; }
        public int PendingOrders { get; set; }  // Đơn đang chờ xử lý (real-time)

        // === Inventory ===
        public int LowStockCount { get; set; }
        public List<LowStockItemDto> LowStockItems { get; set; } = new();  // Chi tiết NL thiếu

        // === Analytics ===
        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<RevenueByDayDto> RevenueByDay { get; set; } = new();
    }

    // Top sản phẩm bán chạy
    public class TopProductDto
    {
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal Revenue { get; set; }
    }

    // Doanh thu theo ngày (cho biểu đồ)
    public class RevenueByDayDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
    }

    // Chi tiết nguyên liệu tồn kho thấp
    public class LowStockItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string SKU { get; set; } = null!;
        public decimal CurrentStock { get; set; }
        public decimal MinStock { get; set; }
        public string BaseUnit { get; set; } = null!;
    }
}
