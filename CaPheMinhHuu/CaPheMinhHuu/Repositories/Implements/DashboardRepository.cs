using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.Dashboard;
using CaPheMinhHuu.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly ApplicationDbContext _context;
        public DashboardRepository(ApplicationDbContext context) { _context = context; }

        public async Task<decimal> GetRevenueSumAsync(DateTime from, DateTime to)
            => await _context.Orders
                .Where(o => o.OrderDate.Date >= from && o.OrderDate.Date <= to && o.Status != "Cancelled")
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        public async Task<int> GetOrderCountAsync(DateTime from, DateTime to)
            => await _context.Orders
                .CountAsync(o => o.OrderDate.Date >= from && o.OrderDate.Date <= to && o.Status != "Cancelled");

        public async Task<int> GetPendingOrderCountAsync()
            => await _context.Orders.CountAsync(o => o.Status == "Pending");

        public async Task<List<LowStockItemDto>> GetLowStockItemsAsync()
            => await _context.Ingredients
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

        public async Task<List<TopProductDto>> GetTopProductsAsync(DateTime from, DateTime to, int take = 5)
            => await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.Order.OrderDate.Date >= from
                          && oi.Order.OrderDate.Date <= to
                          && oi.Order.Status != "Cancelled")
                .GroupBy(oi => oi.Product.Name)
                .Select(g => new TopProductDto
                {
                    ProductName = g.Key,
                    Quantity = g.Sum(x => x.Quantity),
                    Revenue = g.Sum(x => x.PriceAtOrder * x.Quantity)
                })
                .OrderByDescending(x => x.Quantity)
                .Take(take)
                .ToListAsync();

        public async Task<List<RevenueByDayDto>> GetRevenueByDayAsync(DateTime from, DateTime to)
            => await _context.Orders
                .Where(o => o.OrderDate.Date >= from && o.OrderDate.Date <= to && o.Status != "Cancelled")
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new RevenueByDayDto { Date = g.Key, Revenue = g.Sum(x => x.TotalAmount) })
                .OrderBy(x => x.Date)
                .ToListAsync();
        public async Task<List<RevenueByHourDto>> GetRevenueByHourAsync(DateTime date)
    => await _context.Orders
        .Where(o => o.OrderDate.Date == date.Date && o.Status != "Cancelled")
        .GroupBy(o => o.OrderDate.Hour)
        .Select(g => new RevenueByHourDto
        {
            Hour = g.Key,
            HourLabel = $"{g.Key:D2}:00",
            Revenue = g.Sum(x => x.TotalAmount),
            OrderCount = g.Count(),
            TableOrderCount = g.Count(x => x.TableId != null),
            TakeAwayCount = g.Count(x => x.TableId == null)
        })
        .OrderBy(x => x.Hour)
        .ToListAsync();

        public async Task<List<StaffShiftSummaryDto>> GetStaffShiftSummaryAsync(int month, int year)
        {
            var shifts = await _context.Shifts
                .Include(s => s.User)
                .Where(s => s.OpenTime.Month == month
                         && s.OpenTime.Year == year
                         && s.Status == "Closed"
                         && !s.IsDeleted
                         && s.User != null)
                .ToListAsync();

            return shifts
                .GroupBy(s => s.UserId)
                .Select(g =>
                {
                    var first = g.First();
                    return new StaffShiftSummaryDto
                    {
                        UserId        = g.Key,
                        StaffCode     = first.User!.Username,
                        FullName      = first.User!.FullName,
                        Avatar        = first.User!.Avatar,
                        Role          = first.User!.Role,
                        TotalShifts   = g.Count(),
                        TotalHours    = g.Sum(s => s.CloseTime.HasValue
                            ? (decimal)(s.CloseTime.Value - s.OpenTime).TotalHours
                            : 0),
                        TotalRevenue  = g.Sum(s => s.TotalRevenue ?? 0),
                        LastShiftDate = g.Max(s => s.OpenTime)
                    };
                })
                .ToList();
        }

        public async Task<double> GetAvgOrderProcessingMinutesAsync(DateTime from, DateTime to)
        {
            var orders = await _context.Orders
                .Where(o => o.OrderDate.Date >= from
                         && o.OrderDate.Date <= to
                         && o.Status == "Completed"
                         && !o.IsDeleted)
                .Select(o => new { o.OrderDate, o.UpdatedDate })
                .ToListAsync();

            if (!orders.Any()) return 0;

            return orders
                .Where(o => o.UpdatedDate.HasValue)
                .Average(o => (o.UpdatedDate!.Value - o.OrderDate).TotalMinutes);
        }

        public async Task<decimal> GetCancellationRateAsync(DateTime from, DateTime to)
        {
            var total = await _context.Orders
                .CountAsync(o => o.OrderDate.Date >= from && o.OrderDate.Date <= to);

            if (total == 0) return 0;

            var cancelled = await _context.Orders
                .CountAsync(o => o.OrderDate.Date >= from
                              && o.OrderDate.Date <= to
                              && o.Status == "Cancelled");

            return Math.Round((decimal)cancelled / total * 100, 2);
        }
    }
}
