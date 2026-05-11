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

        public async Task<DashboardStatsDto> GetStatsAsync(int chartDays = 7)
        {
            chartDays = Math.Clamp(chartDays, 1, 30);
            var today        = DateTime.Today;
            var chartStart   = today.AddDays(-chartDays + 1);
            var startOfWeek  = today.AddDays(-(int)today.DayOfWeek + 1);
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var todayRevenue  = await _dashboardRepo.GetRevenueSumAsync(today, today);
            var todayOrders   = await _dashboardRepo.GetOrderCountAsync(today, today);
            var pendingOrders = await _dashboardRepo.GetPendingOrderCountAsync();
            var weekRevenue   = await _dashboardRepo.GetRevenueSumAsync(startOfWeek, today);
            var monthRevenue  = await _dashboardRepo.GetRevenueSumAsync(startOfMonth, today);
            var lowStock      = await _dashboardRepo.GetLowStockItemsAsync();
            var topProducts   = await _dashboardRepo.GetTopProductsAsync(startOfMonth, today);
            var revenueByDay  = await _dashboardRepo.GetRevenueByDayAsync(chartStart, today);
            var revenueByHour = await _dashboardRepo.GetRevenueByHourAsync(today);
            var staffSummary  = await _dashboardRepo.GetStaffShiftSummaryAsync(today.Month, today.Year);
            var cancelRate    = await _dashboardRepo.GetCancellationRateAsync(startOfMonth, today);
            var byPayment     = await _dashboardRepo.GetRevenueByPaymentMethodAsync(startOfMonth, today);
            var topToppings   = await _dashboardRepo.GetTopToppingsAsync(startOfMonth, today);

            _logger.LogInformation(
                "Dashboard stats — Revenue: {R}đ, Orders: {O}, Pending: {P}, LowStock: {L}",
                todayRevenue, todayOrders, pendingOrders, lowStock.Count);

            return new DashboardStatsDto
            {
                TodayRevenue           = todayRevenue,
                WeekRevenue            = weekRevenue,
                MonthRevenue           = monthRevenue,
                TodayOrders            = todayOrders,
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