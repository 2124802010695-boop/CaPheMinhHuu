
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
            if (chartDays < 1) chartDays = 7;
            if (chartDays > 30) chartDays = 30;
            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var startOfMonth = new DateTime(today.Year, today.Month, 1);
            var chartStart = today.AddDays(-(chartDays - 1));
            var todayRevenue = await _dashboardRepo.GetRevenueSumAsync(today, today);
            var todayOrders = await _dashboardRepo.GetOrderCountAsync(today, today);
            var pendingOrders = await _dashboardRepo.GetPendingOrderCountAsync();
            var weekRevenue = await _dashboardRepo.GetRevenueSumAsync(startOfWeek, today);
            var monthRevenue = await _dashboardRepo.GetRevenueSumAsync(startOfMonth, today);
            var lowStockItems = await _dashboardRepo.GetLowStockItemsAsync();
            var topProducts = await _dashboardRepo.GetTopProductsAsync(startOfMonth, today);
            var revenueByDay = await _dashboardRepo.GetRevenueByDayAsync(chartStart, today);
            _logger.LogInformation("Dashboard — Revenue: {R}đ, Orders: {O}, Pending: {P}, LowStock: {L}",
                todayRevenue, todayOrders, pendingOrders, lowStockItems.Count);
            return new DashboardStatsDto
            {
                TodayRevenue = todayRevenue,
                TodayOrders = todayOrders,
                PendingOrders = pendingOrders,
                WeekRevenue = weekRevenue,
                MonthRevenue = monthRevenue,
                LowStockCount = lowStockItems.Count,
                LowStockItems = lowStockItems,
                TopProducts = topProducts,
                RevenueByDay = revenueByDay
            };
        }
    }
}