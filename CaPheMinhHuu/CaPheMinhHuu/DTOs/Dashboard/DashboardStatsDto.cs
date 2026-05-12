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

        // === Hourly & Operations ===
        public List<RevenueByHourDto> RevenueByHour { get; set; } = new();
        public List<StaffShiftSummaryDto> StaffShiftSummary { get; set; } = new();
        public List<RevenueByPaymentMethodDto> RevenueByPaymentMethod { get; set; } = new();
        public List<TopToppingDto> TopToppings { get; set; } = new();
        public decimal CancellationRate { get; set; }

        // === Period Comparison ===
        public decimal PreviousPeriodRevenue { get; set; }
        public decimal RevenueDeltaPercent { get; set; }

        // === Processing & Operations ===
        public double AvgProcessingMinutes { get; set; }

        // === Customer ===
        public int NewCustomerCount { get; set; }
        public int CouponUsedCount { get; set; }

        // === Order Status Breakdown ===
        public int PreparingOrders { get; set; }
        public int ReadyOrders { get; set; }
        public int ServedOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }

        // === Salary & Category ===
        public decimal EstimatedSalaryTotal { get; set; }
        public List<RevenueByCategoryDto> RevenueByCategory { get; set; } = new();
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
        
        public int OrderCount { get; set; }
        public int TableOrderCount { get; set; }          
        public int TakeAwayCount { get; set; }
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
    public class RevenueByHourDto
    {
        public int Hour { get; set; }
        public string HourLabel { get; set; } = null!;  // ← THÊM
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
        public int TableOrderCount { get; set; }         // ← THÊM
        public int TakeAwayCount { get; set; }
    }
    public class StaffShiftSummaryDto
    {
        public int UserId { get; set; }
        public string StaffCode { get; set; } = null!;     
        public string FullName { get; set; } = null!;
        public string? Avatar { get; set; }                
        public string Role { get; set; } = null!;          
        public int TotalShifts { get; set; }
        public decimal TotalHours { get; set; }           
        public decimal TotalRevenue { get; set; }
        public DateTime? LastShiftDate { get; set; }
    }

    public class RevenueByPaymentMethodDto
    {
        public string PaymentMethod { get; set; } = null!;
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class TopToppingDto
    {
        public int ToppingId { get; set; }
        public string ToppingName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal Revenue { get; set; }
    }

    public class RangeDashboardStatsDto
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal CancellationRate { get; set; }
        public List<RevenueByDayDto> RevenueByDay { get; set; } = new();
        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<RevenueByPaymentMethodDto> RevenueByPaymentMethod { get; set; } = new();
        public List<TopToppingDto> TopToppings { get; set; } = new();
    }

    // D3 — WACC per ingredient
    public class IngredientWaccDto
    {
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = null!;
        public string BaseUnit { get; set; } = null!;

        // WACC = Σ(CurrentQty × ImportPrice) / Σ(CurrentQty)
        // Include tất cả batch trừ IsDeleted (kể cả expired — chờ Dispose)
        public decimal WACC { get; set; }                   // round 4 decimals

        public decimal TotalStock { get; set; }              // Σ(CurrentQty) của tất cả batch !IsDeleted
        public decimal TotalInventoryValue { get; set; }     // round 2 decimals = WACC × TotalStock
        public int BatchCount { get; set; }                  // số batch !IsDeleted
        public int ExpiredBatchCount { get; set; }           // số batch đã quá hạn (để admin tracking)
        public DateTime? OldestBatchDate { get; set; }       // FIFO indicator
        public DateTime? NewestBatchDate { get; set; }
    }

    // D4 — Ingredient variance report
    public class IngredientVarianceDto
    {
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = null!;
        public string BaseUnit { get; set; } = null!;

        // Từ IngredientUsageLog trong khoảng thời gian
        public decimal TheoreticalTotal { get; set; }        // SUM(TheoreticalQty)
        public decimal ActualTotal { get; set; }             // SUM(DeductedQty)
        public decimal VarianceTotal { get; set; }           // ActualTotal - TheoreticalTotal
        public decimal VariancePct { get; set; }             // % so với theoretical, 0 nếu TheoreticalTotal = 0

        // Cost
        public decimal TotalCost { get; set; }               // SUM(TotalCost) từ UsageLog — round 2 decimals
        public decimal HistoricalAvgCost { get; set; }       // AVG(CostPerBaseUnit) từ log trong period — round 4 decimals
        public decimal CurrentWACC { get; set; }             // WACC hiện tại từ batch — round 4 decimals

        public int MovementCount { get; set; }               // số batch movements trong period
    }
}
