using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.Dashboard;
using CaPheMinhHuu.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Services.Implements
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(ApplicationDbContext context, ILogger<DashboardService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<DashboardStatsDto> GetStatsAsync(int chartDays = 7)
        {
            // Giới hạn chartDays hợp lệ
            if (chartDays < 1) chartDays = 7;
            if (chartDays > 30) chartDays = 30;

            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            // === Doanh thu hôm nay ===
            var todayRevenue = await _context.Orders
                .Where(o => o.OrderDate.Date == today && o.Status != "Cancelled")
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            // === Số đơn hôm nay ===
            var todayOrders = await _context.Orders
                .CountAsync(o => o.OrderDate.Date == today && o.Status != "Cancelled");

            // === Đơn đang pending (real-time) ===
            var pendingOrders = await _context.Orders
                .CountAsync(o => o.Status == "Pending");

            // === Doanh thu tuần ===
            var weekRevenue = await _context.Orders
                .Where(o => o.OrderDate.Date >= startOfWeek && o.OrderDate.Date <= today && o.Status != "Cancelled")
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            // === Doanh thu tháng ===
            var monthRevenue = await _context.Orders
                .Where(o => o.OrderDate.Date >= startOfMonth && o.OrderDate.Date <= today && o.Status != "Cancelled")
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            // === Kho thấp — count + chi tiết ===
            var lowStockItems = await _context.Ingredients
                .Where(i => !i.IsDeleted)
                .Select(i => new
                {
                    i.Id,
                    i.Name,
                    i.SKU,
                    i.BaseUnit,
                    i.MinStock,
                    CurrentStock = i.Batches
                        .Where(b => !b.IsDeleted && b.CurrentQuantity > 0)
                        .Sum(b => b.CurrentQuantity)
                })
                .Where(x => x.CurrentStock <= x.MinStock)
                .Select(x => new LowStockItemDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    SKU = x.SKU ?? "",
                    BaseUnit = x.BaseUnit,
                    CurrentStock = x.CurrentStock,
                    MinStock = x.MinStock
                })
                .ToListAsync();

            // === Top 5 sản phẩm trong tháng ===
            var topProducts = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.Order.OrderDate.Date >= startOfMonth
                          && oi.Order.OrderDate.Date <= today
                          && oi.Order.Status != "Cancelled")
                .GroupBy(oi => oi.Product.Name)
                .Select(g => new TopProductDto
                {
                    ProductName = g.Key,
                    Quantity = g.Sum(x => x.Quantity),
                    Revenue = g.Sum(x => x.PriceAtOrder * x.Quantity)
                })
                .OrderByDescending(x => x.Quantity)
                .Take(5)
                .ToListAsync();

            // === Doanh thu N ngày gần nhất (switch 7/30) ===
            var chartStartDate = today.AddDays(-(chartDays - 1));

            var revenueByDay = await _context.Orders
                .Where(o => o.OrderDate.Date >= chartStartDate
                         && o.OrderDate.Date <= today
                         && o.Status != "Cancelled")
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new RevenueByDayDto
                {
                    Date = g.Key,
                    Revenue = g.Sum(x => x.TotalAmount)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            _logger.LogInformation("Dashboard loaded — Revenue: {Revenue}đ, Orders: {Count}, Pending: {Pending}, LowStock: {Low}",
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