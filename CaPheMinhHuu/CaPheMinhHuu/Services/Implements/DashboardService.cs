using CaPheMinhHuu.DTOs.Dashboard;
using CaPheMinhHuu.Interfaces;

namespace CaPheMinhHuu.Services.Implements
{
    public class DashboardService : IDashboardService
    {
        private readonly ILogger<DashboardService> _logger;
        private readonly IDashboardRepository _dashboardRepo;

        public DashboardService(IDashboardRepository dashboardRepo, ILogger<DashboardService> logger)
        {
            _dashboardRepo = dashboardRepo;
            _logger = logger;
        }

        public async Task<DashboardStatsDto> GetStatsAsync(string period = "today", int chartDays = 7)
        {
            var today = DateTime.Today;
            DateTime from, to, prevFrom, prevTo;

            to = today.AddDays(1).AddTicks(-1);
            switch (period.ToLower())
            {
                case "7days":
                    from     = today.AddDays(-6);
                    prevFrom = from.AddDays(-7);
                    prevTo   = from.AddTicks(-1);
                    break;
                case "30days":
                    from     = today.AddDays(-29);
                    prevFrom = from.AddDays(-30);
                    prevTo   = from.AddTicks(-1);
                    break;
                default: // today
                    from     = today;
                    prevFrom = today.AddDays(-1);
                    prevTo   = today.AddTicks(-1);
                    break;
            }

            // --- Existing repo calls (dates updated to use from/to) ---
            var currentRevenue  = await _dashboardRepo.GetRevenueSumAsync(from, to);
            var totalOrders     = await _dashboardRepo.GetOrderCountAsync(from, to);
            var pendingOrders   = await _dashboardRepo.GetPendingOrderCountAsync();
            var lowStock        = await _dashboardRepo.GetLowStockItemsAsync();
            var topProducts     = await _dashboardRepo.GetTopProductsAsync(from, to, 10);
            var revenueByDay    = await _dashboardRepo.GetRevenueByDayAsync(from, to);
            var revenueByHour   = await _dashboardRepo.GetRevenueByHourAsync(today);
            var cancelRate      = await _dashboardRepo.GetCancellationRateAsync(from, to);
            var byPayment       = await _dashboardRepo.GetRevenueByPaymentMethodAsync(from, to);
            var topToppings     = await _dashboardRepo.GetTopToppingsAsync(from, to);

            // Staff summary: month-level for today, range for 7/30days
            var staffSummary = period.ToLower() == "today"
                ? await _dashboardRepo.GetStaffShiftSummaryAsync(today.Month, today.Year)
                : await _dashboardRepo.GetStaffShiftSummaryByRangeAsync(from, to);

            // --- New repo calls ---
            var statusBreakdown   = await _dashboardRepo.GetOrderCountByStatusAsync(from, to);
            var revenueByCategory = await _dashboardRepo.GetRevenueByCategoryAsync(from, to);
            var newCustomers      = await _dashboardRepo.GetNewCustomerCountAsync(from, to);
            var couponUsed        = await _dashboardRepo.GetCouponUsedCountAsync(from, to);
            var avgProcessing     = await _dashboardRepo.GetAvgOrderProcessingMinutesAsync(from, to);
            var prevRevenue       = await _dashboardRepo.GetRevenueSumAsync(prevFrom, prevTo);

            // Delta % vs previous period
            var delta = prevRevenue == 0 ? 0m
                : Math.Round((currentRevenue - prevRevenue) / prevRevenue * 100, 1);

            // Week/Month still useful as context (keep for backward compat)
            var startOfWeek  = today.AddDays(-(int)today.DayOfWeek + 1);
            var startOfMonth = new DateTime(today.Year, today.Month, 1);
            var weekRevenue  = await _dashboardRepo.GetRevenueSumAsync(startOfWeek, to);
            var monthRevenue = await _dashboardRepo.GetRevenueSumAsync(startOfMonth, to);

            _logger.LogInformation(
                "Dashboard stats [{Period}] — Revenue: {R}đ, Orders: {O}, Pending: {P}, LowStock: {L}, Delta: {D}%",
                period, currentRevenue, totalOrders, pendingOrders, lowStock.Count, delta);

            return new DashboardStatsDto
            {
                // Existing fields (backward compat)
                TodayRevenue           = currentRevenue,
                WeekRevenue            = weekRevenue,
                MonthRevenue           = monthRevenue,
                TodayOrders            = totalOrders,
                PendingOrders          = pendingOrders,
                LowStockCount          = lowStock.Count,
                LowStockItems          = lowStock,
                TopProducts            = topProducts,
                RevenueByDay           = revenueByDay,
                RevenueByHour          = revenueByHour,
                StaffShiftSummary      = staffSummary,
                CancellationRate       = cancelRate,
                RevenueByPaymentMethod = byPayment,
                TopToppings            = topToppings,

                // New fields
                PreviousPeriodRevenue  = prevRevenue,
                RevenueDeltaPercent    = delta,
                AvgProcessingMinutes   = avgProcessing,
                NewCustomerCount       = newCustomers,
                CouponUsedCount        = couponUsed,
                PreparingOrders        = statusBreakdown.GetValueOrDefault("Preparing"),
                ReadyOrders            = statusBreakdown.GetValueOrDefault("Ready"),
                ServedOrders           = statusBreakdown.GetValueOrDefault("Served"),
                CompletedOrders        = statusBreakdown.GetValueOrDefault("Completed"),
                CancelledOrders        = statusBreakdown.GetValueOrDefault("Cancelled"),
                RevenueByCategory      = revenueByCategory,
                EstimatedSalaryTotal   = 0, // TODO: cần thêm HourlyRate vào StaffShiftSummaryDto
            };
        }

        public async Task<RangeDashboardStatsDto> GetRangeStatsAsync(DateTime from, DateTime to)
        {
            var totalRevenue = await _dashboardRepo.GetRevenueSumAsync(from, to);
            var totalOrders  = await _dashboardRepo.GetOrderCountAsync(from, to);
            var cancelRate   = await _dashboardRepo.GetCancellationRateAsync(from, to);
            var revenueByDay = await _dashboardRepo.GetRevenueByDayAsync(from, to);
            var topProducts  = await _dashboardRepo.GetTopProductsAsync(from, to);
            var byPayment    = await _dashboardRepo.GetRevenueByPaymentMethodAsync(from, to);
            var topToppings  = await _dashboardRepo.GetTopToppingsAsync(from, to);

            _logger.LogInformation(
                "Range stats [{F} → {T}] — Revenue: {R}đ, Orders: {O}",
                from.ToString("yyyy-MM-dd"), to.ToString("yyyy-MM-dd"), totalRevenue, totalOrders);

            return new RangeDashboardStatsDto
            {
                From                   = from,
                To                     = to,
                TotalRevenue           = totalRevenue,
                TotalOrders            = totalOrders,
                CancellationRate       = cancelRate,
                RevenueByDay           = revenueByDay,
                TopProducts            = topProducts,
                RevenueByPaymentMethod = byPayment,
                TopToppings            = topToppings,
            };
        }

        // D3 — WACC per ingredient
        public async Task<List<IngredientWaccDto>> GetIngredientWaccAsync(int? ingredientId = null)
        {
            var result = await _dashboardRepo.GetIngredientWaccAsync(ingredientId);
            _logger.LogInformation("WACC query — {Count} ingredients returned", result.Count);
            return result;
        }

        // D4 — Ingredient variance report
        public async Task<List<IngredientVarianceDto>> GetIngredientVarianceAsync(DateTime from, DateTime to)
        {
            var result = await _dashboardRepo.GetIngredientVarianceAsync(from, to);
            _logger.LogInformation(
                "Variance report [{F} → {T}] — {Count} ingredients",
                from.ToString("yyyy-MM-dd"), to.ToString("yyyy-MM-dd"), result.Count);
            return result;
        }
    }
}