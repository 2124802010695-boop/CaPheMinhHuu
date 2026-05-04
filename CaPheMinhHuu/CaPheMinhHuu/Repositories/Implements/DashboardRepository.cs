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
    }
}
