using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.Shift;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;
namespace CaPheMinhHuu.Services.Implements
{
    public class ShiftService : IShiftService
    {
        private readonly ApplicationDbContext _context;
        public ShiftService(ApplicationDbContext context)
        {
            _context = context;
        }
        // ===================== CASHIER =====================
        public async Task<ShiftViewDto> RequestOpenShiftAsync(int cashierId, ShiftOpenDto dto)
        {
            var existing = await _context.Shifts
                .FirstOrDefaultAsync(s => s.UserId == cashierId
                    && (s.Status == "Open" || s.Status == "PendingOpen"));
            if (existing != null)
                throw new InvalidOperationException("Bạn đang có ca chưa đóng hoặc đang chờ duyệt");
            var shift = new Shift
            {
                UserId = cashierId,
                OpenTime = DateTime.Now,
                OpeningCash = dto.OpeningCash,
                Status = "PendingOpen"
            };
            _context.Shifts.Add(shift);
            await _context.SaveChangesAsync();
            await _context.Entry(shift).Reference(s => s.User).LoadAsync();
            return MapToViewDto(shift);
        }
        public async Task<ShiftViewDto> CloseShiftAsync(int shiftId, int cashierId, ShiftCloseDto dto)
        {
            var shift = await _context.Shifts
                .Include(s => s.User)
                .Include(s => s.Admin)
                .FirstOrDefaultAsync(s => s.Id == shiftId
                    && s.UserId == cashierId && s.Status == "Open");
            if (shift == null)
                throw new InvalidOperationException("Không tìm thấy ca đang mở");
            var closeTime = DateTime.Now;
            var ordersInShift = await _context.Orders
                .Where(o => o.UserId == cashierId
                         && o.OrderDate >= shift.OpenTime
                         && o.OrderDate <= closeTime)
                .ToListAsync();
            shift.CloseTime = closeTime;
            shift.ClosingCash = dto.ClosingCash;
            shift.TotalOrders = ordersInShift.Count;
            shift.TotalRevenue = ordersInShift.Sum(o => o.TotalAmount);
            // Tính Difference nhưng Cashier sẽ KHÔNG thấy (Blind Close)
            var cashRevenue = ordersInShift
                .Where(o => o.PaymentMethod == "Cash")
                .Sum(o => o.TotalAmount);
            shift.Difference = dto.ClosingCash - (shift.OpeningCash + cashRevenue);
            shift.Status = "Closed";
            await _context.SaveChangesAsync();
            return MapToViewDto(shift);
        }
        public async Task<ShiftViewDto?> GetCurrentShiftAsync(int userId)
        {
            var shift = await _context.Shifts
                .Include(s => s.User).Include(s => s.Admin)
                .FirstOrDefaultAsync(s => s.UserId == userId
                    && (s.Status == "Open" || s.Status == "PendingOpen"));
            return shift == null ? null : MapToViewDto(shift);
        }
        public async Task<ZReportDto> GetZReportAsync(int shiftId, int userId)
        {
            // Cashier xem Z-Report ca mình — BLIND: không hiện Difference
            var shift = await _context.Shifts
                .Include(s => s.User).Include(s => s.Admin)
                .FirstOrDefaultAsync(s => s.Id == shiftId && s.UserId == userId);
            if (shift == null)
                throw new InvalidOperationException("Không tìm thấy ca");
            var report = await BuildZReport(shift);
            report.Difference = null;  // ← BLIND CLOSE: ẩn chênh lệch
            return report;
        }
        // ===================== ADMIN =====================
        public async Task<ShiftViewDto> ApproveShiftAsync(int shiftId, int adminId)
        {
            var shift = await _context.Shifts
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == shiftId && s.Status == "PendingOpen");
            if (shift == null)
                throw new InvalidOperationException("Không tìm thấy ca chờ duyệt");
            shift.AdminId = adminId;
            shift.Status = "Open";
            await _context.SaveChangesAsync();
            await _context.Entry(shift).Reference(s => s.Admin).LoadAsync();
            return MapToViewDto(shift);
        }
        public async Task<ShiftViewDto> RejectShiftAsync(int shiftId, int adminId, string? reason)
        {
            var shift = await _context.Shifts
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == shiftId && s.Status == "PendingOpen");
            if (shift == null)
                throw new InvalidOperationException("Không tìm thấy ca chờ duyệt");
            shift.AdminId = adminId;
            shift.RejectReason = reason;
            shift.Status = "Rejected";
            await _context.SaveChangesAsync();
            return MapToViewDto(shift);
        }
        public async Task<List<ShiftViewDto>> GetPendingShiftsAsync()
        {
            var shifts = await _context.Shifts
                .Include(s => s.User)
                .Where(s => s.Status == "PendingOpen")
                .OrderByDescending(s => s.OpenTime)
                .ToListAsync();
            return shifts.Select(MapToViewDto).ToList();
        }
        public async Task<List<ShiftViewDto>> GetAllShiftsAsync(string? status = null)
        {
            var query = _context.Shifts
                .Include(s => s.User).Include(s => s.Admin).AsQueryable();
            if (!string.IsNullOrEmpty(status))
                query = query.Where(s => s.Status == status);
            var shifts = await query.OrderByDescending(s => s.OpenTime).ToListAsync();
            return shifts.Select(MapToViewDto).ToList();
        }
        public async Task<ZReportDto> AdminGetZReportAsync(int shiftId)
        {
            var shift = await _context.Shifts
                .Include(s => s.User).Include(s => s.Admin)
                .FirstOrDefaultAsync(s => s.Id == shiftId);
            if (shift == null)
                throw new InvalidOperationException("Không tìm thấy ca");
            return await BuildZReport(shift);  // Admin thấy ĐẦY ĐỦ kể cả Difference
        }
        // ===================== HELPERS =====================
        private async Task<ZReportDto> BuildZReport(Shift shift)
        {
            var closeTime = shift.CloseTime ?? DateTime.Now;
            var ordersInShift = await _context.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == shift.UserId
                         && o.OrderDate >= shift.OpenTime
                         && o.OrderDate <= closeTime)
                .ToListAsync();
            var paymentBreakdown = ordersInShift
                .GroupBy(o => o.PaymentMethod)
                .Select(g => new PaymentBreakdownItem
                {
                    PaymentMethod = g.Key,
                    Count = g.Count(),
                    Amount = g.Sum(o => o.TotalAmount)
                }).ToList();
            var topProducts = ordersInShift
                .SelectMany(o => o.OrderItems)
                .GroupBy(oi => oi.Product.Name)
                .Select(g => new TopProductItem
                {
                    ProductName = g.Key,
                    QuantitySold = g.Sum(oi => oi.Quantity),
                    Revenue = g.Sum(oi => oi.PriceAtOrder * oi.Quantity)
                })
                .OrderByDescending(p => p.QuantitySold)
                .Take(10).ToList();
            return new ZReportDto
            {
                ShiftId = shift.Id,
                CashierName = shift.User?.FullName ?? "N/A",
                AdminName = shift.Admin?.FullName ?? "N/A",
                OpenTime = shift.OpenTime,
                CloseTime = closeTime,
                OpeningCash = shift.OpeningCash,
                ClosingCash = shift.ClosingCash ?? 0,
                Difference = shift.Difference,  // Có giá trị, Cashier sẽ bị set null ở trên
                TotalOrders = ordersInShift.Count,
                TotalRevenue = ordersInShift.Sum(o => o.TotalAmount),
                PaymentBreakdown = paymentBreakdown,
                TopProducts = topProducts
            };
        }
        private ShiftViewDto MapToViewDto(Shift shift)
        {
            return new ShiftViewDto
            {
                Id = shift.Id,
                UserId = shift.UserId,
                UserName = shift.User?.FullName,
                AdminId = shift.AdminId,
                AdminName = shift.Admin?.FullName,
                OpenTime = shift.OpenTime,
                CloseTime = shift.CloseTime,
                OpeningCash = shift.OpeningCash,
                ClosingCash = shift.ClosingCash,
                Difference = shift.Difference,
                TotalOrders = shift.TotalOrders,
                TotalRevenue = shift.TotalRevenue,
                Status = shift.Status,
                RejectReason = shift.RejectReason
            };
        }
    }
}