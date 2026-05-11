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
                .Where(o => o.OrderDate.Date >= from && o.OrderDate.Date <= to && o.Status != "Cancelled" && o.IsPaid)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        public async Task<int> GetOrderCountAsync(DateTime from, DateTime to)
            => await _context.Orders
                .CountAsync(o => o.OrderDate.Date >= from && o.OrderDate.Date <= to && o.Status != "Cancelled" && o.IsPaid);

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
                .Where(o => o.OrderDate.Date >= from && o.OrderDate.Date <= to && o.Status != "Cancelled" && o.IsPaid)
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new RevenueByDayDto
                {
                    Date             = g.Key,
                    Revenue          = g.Sum(x => x.TotalAmount),
                    OrderCount       = g.Count(),
                    TableOrderCount  = g.Count(x => x.TableId != null),
                    TakeAwayCount    = g.Count(x => x.TableId == null),
                })
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

        public async Task<List<RevenueByPaymentMethodDto>> GetRevenueByPaymentMethodAsync(DateTime from, DateTime to)
            => await _context.Orders
                .Where(o => o.OrderDate.Date >= from && o.OrderDate.Date <= to && o.IsPaid)
                .GroupBy(o => o.PaymentMethod)
                .Select(g => new RevenueByPaymentMethodDto
                {
                    PaymentMethod = g.Key,
                    Revenue       = g.Sum(x => x.TotalAmount),
                    OrderCount    = g.Count(),
                })
                .OrderByDescending(x => x.Revenue)
                .ToListAsync();

        public async Task<List<TopToppingDto>> GetTopToppingsAsync(DateTime from, DateTime to, int take = 5)
            => await _context.OrderItemToppings
                .Where(t => t.OrderItem!.Order!.OrderDate.Date >= from
                         && t.OrderItem!.Order!.OrderDate.Date <= to
                         && t.OrderItem!.Order!.IsPaid)
                .GroupBy(t => new { t.ToppingId, t.ToppingName })
                .Select(g => new TopToppingDto
                {
                    ToppingId   = g.Key.ToppingId,
                    ToppingName = g.Key.ToppingName,
                    Quantity    = g.Sum(x => x.Quantity),
                    Revenue     = g.Sum(x => x.LineTotal),
                })
                .OrderByDescending(g => g.Quantity)
                .Take(take)
                .ToListAsync();

        // D3 — WACC per ingredient
        // Include tất cả batch !IsDeleted (kể cả expired — chờ nghiệp vụ Dispose)
        public async Task<List<IngredientWaccDto>> GetIngredientWaccAsync(int? ingredientId = null)
        {
            var ingredientQuery = _context.Ingredients
                .Where(i => !i.IsDeleted);

            if (ingredientId.HasValue)
                ingredientQuery = ingredientQuery.Where(i => i.Id == ingredientId.Value);

            var ingredients = await ingredientQuery
                .Select(i => new
                {
                    i.Id,
                    i.Name,
                    i.BaseUnit,
                    Batches = i.Batches.Where(b => !b.IsDeleted)
                })
                .ToListAsync();

            var now = DateTime.UtcNow;
            return ingredients.Select(i =>
            {
                var batches       = i.Batches.ToList();
                var totalQty      = batches.Sum(b => b.CurrentQuantity);
                var weightedSum   = batches.Sum(b => b.CurrentQuantity * b.ImportPricePerBaseUnit);
                var wacc          = totalQty > 0 ? Math.Round(weightedSum / totalQty, 4) : 0;
                var inventoryVal  = Math.Round(wacc * totalQty, 2);
                var expiredCount  = batches.Count(b => b.ExpiryDate.HasValue && b.ExpiryDate.Value < now);

                return new IngredientWaccDto
                {
                    IngredientId        = i.Id,
                    IngredientName      = i.Name,
                    BaseUnit            = i.BaseUnit,
                    WACC                = wacc,
                    TotalStock          = totalQty,
                    TotalInventoryValue = inventoryVal,
                    BatchCount          = batches.Count,
                    ExpiredBatchCount   = expiredCount,
                    OldestBatchDate     = batches.Any() ? batches.Min(b => b.ImportDate) : null,
                    NewestBatchDate     = batches.Any() ? batches.Max(b => b.ImportDate) : null
                };
            }).OrderBy(x => x.IngredientName).ToList();
        }

        // D4 — Ingredient variance report
        public async Task<List<IngredientVarianceDto>> GetIngredientVarianceAsync(DateTime from, DateTime to)
        {
            // Lấy usage logs trong khoảng thời gian
            var logs = await _context.IngredientUsageLogs
                .Where(l => l.OrderDate.Date >= from.Date
                         && l.OrderDate.Date <= to.Date
                         && !l.IsDeleted)
                .GroupBy(l => new { l.IngredientId, l.IngredientName, l.BaseUnit })
                .Select(g => new
                {
                    g.Key.IngredientId,
                    g.Key.IngredientName,
                    g.Key.BaseUnit,
                    TheoreticalTotal  = g.Sum(x => x.TheoreticalQty),
                    ActualTotal       = g.Sum(x => x.DeductedQty),
                    TotalCost         = g.Sum(x => x.TotalCost),
                    HistoricalAvgCost = g.Average(x => x.CostPerBaseUnit),
                    MovementCount     = g.Count()
                })
                .ToListAsync();

            if (!logs.Any()) return new List<IngredientVarianceDto>();

            // Lấy WACC hiện tại cho từng ingredient có trong logs
            var ingredientIds = logs.Select(l => l.IngredientId).Distinct().ToList();
            var currentBatches = await _context.InventoryBatches
                .Where(b => ingredientIds.Contains(b.IngredientId) && !b.IsDeleted)
                .ToListAsync();

            return logs.Select(l =>
            {
                var varianceTotal = l.ActualTotal - l.TheoreticalTotal;
                var variancePct   = l.TheoreticalTotal > 0
                    ? Math.Round(varianceTotal / l.TheoreticalTotal * 100, 2)
                    : 0;

                // Tính CurrentWACC từ batch hiện tại
                var batches     = currentBatches.Where(b => b.IngredientId == l.IngredientId).ToList();
                var totalQty    = batches.Sum(b => b.CurrentQuantity);
                var weightedSum = batches.Sum(b => b.CurrentQuantity * b.ImportPricePerBaseUnit);
                var currentWacc = totalQty > 0 ? Math.Round(weightedSum / totalQty, 4) : 0;

                return new IngredientVarianceDto
                {
                    IngredientId      = l.IngredientId,
                    IngredientName    = l.IngredientName,
                    BaseUnit          = l.BaseUnit,
                    TheoreticalTotal  = l.TheoreticalTotal,
                    ActualTotal       = l.ActualTotal,
                    VarianceTotal     = varianceTotal,
                    VariancePct       = variancePct,
                    TotalCost         = Math.Round(l.TotalCost, 2),
                    HistoricalAvgCost = Math.Round(l.HistoricalAvgCost, 4),
                    CurrentWACC       = currentWacc,
                    MovementCount     = l.MovementCount
                };
            }).OrderBy(x => x.IngredientName).ToList();
        }
    }
}
