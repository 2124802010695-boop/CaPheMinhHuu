using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.Shift;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;
namespace CaPheMinhHuu.Services.Implements
{
    public class ShiftService : IShiftService
    {
        private readonly IShiftRepository _shiftRepository;
        private readonly ILogger<ShiftService> _logger;
        public ShiftService(IShiftRepository shiftRepository, ILogger<ShiftService> logger)
        {
            _shiftRepository = shiftRepository;
            _logger = logger;
        }
        // ===================== CASHIER =====================
        public async Task<ShiftViewDto> RequestOpenShiftAsync(int cashierId, ShiftOpenDto dto)
        {
            var existing = await _shiftRepository.GetOpenShiftByUserAsync(cashierId);
            if (existing != null)
                throw new InvalidOperationException("Bạn đang có ca chưa đóng hoặc đang chờ duyệt");
            var shift = new Shift
            {
                UserId = cashierId,
                OpenTime = DateTime.Now,
                OpeningCash = dto.OpeningCash,
                Status = "PendingOpen",
                ShiftType = dto.ShiftType ?? "Cashier"
            };
            await _shiftRepository.CreateAsync(shift);
            await _shiftRepository.LoadUserAsync(shift);
            _logger.LogInformation("Ca #{ShiftId} yêu cầu mở — Cashier {CashierId}", shift.Id, cashierId);
            return MapToViewDto(shift);
        }
        public async Task<ShiftViewDto> CloseShiftAsync(int shiftId, int cashierId, ShiftCloseDto dto)
        {
            var shift = await _shiftRepository.GetByIdWithDetailsAsync(shiftId);

            if (shift == null || shift.UserId != cashierId || shift.Status != "Open")
                throw new InvalidOperationException("Không tìm thấy ca đang mở");

            var closeTime = DateTime.Now;

            var ordersInShift = await _shiftRepository
                .GetOrdersInShiftAsync(shift.OpenTime, closeTime);

            var hasActiveOrders = ordersInShift.Any(o => 
                o.Status == "Pending" || o.Status == "Preparing");
            if (hasActiveOrders)
                throw new InvalidOperationException(
                    "Còn đơn hàng chưa hoàn thành (Đang chờ hoặc Đang pha chế). Vui lòng xử lý hết đơn trước khi đóng ca.");

            var completedOrders = ordersInShift.Where(o => o.Status == "Completed").ToList();

            shift.CloseTime = closeTime;
            shift.ClosingCash = dto.ClosingCash;
            shift.TotalOrders = completedOrders.Count;
            shift.TotalRevenue = completedOrders.Sum(o => o.TotalAmount);

            var cashRevenue = completedOrders
                .Where(o => o.PaymentMethod == "Cash")
                .Sum(o => o.TotalAmount);

            shift.Difference = dto.ClosingCash - (shift.OpeningCash + cashRevenue);
            shift.Status = "Closed";

            await _shiftRepository.UpdateAsync(shift);

            return MapToViewDto(shift, cashRevenue);
        }
        public async Task<ShiftViewDto?> GetCurrentShiftAsync(int userId)
        {
            var shift = await _shiftRepository.GetOpenShiftByUserAsync(userId);
            if (shift == null) return null;

            var ordersInShift = await _shiftRepository
                .GetOrdersInShiftAsync(shift.OpenTime, DateTime.Now);
            var completedOrders = ordersInShift.Where(o => o.Status == "Completed").ToList();
            var cashRevenue = completedOrders
                .Where(o => o.PaymentMethod == "Cash")
                .Sum(o => o.TotalAmount);

            return MapToViewDto(shift, cashRevenue);
        }
        public async Task<ZReportDto> GetZReportAsync(int shiftId, int userId)
        {
            var shift = await _shiftRepository.GetByIdWithDetailsAsync(shiftId);

            if (shift == null || shift.UserId != userId)
                throw new InvalidOperationException("Không tìm thấy ca");

            var report = await BuildZReport(shift);

            report.Difference = null; // BLIND

            return report;
        }
        // ===================== ADMIN =====================
        public async Task<ShiftViewDto> ApproveShiftAsync(int shiftId, int adminId)
        {
            var shift = await _shiftRepository.GetByIdAsync(shiftId);

            if (shift == null)
                throw new InvalidOperationException("Không tìm thấy ca chờ duyệt");

            shift.AdminId = adminId;
            shift.Status = "Open";

            await _shiftRepository.UpdateAsync(shift);

            await _shiftRepository.LoadAdminAsync(shift);

            return MapToViewDto(shift);
        }
        public async Task<ShiftViewDto> RejectShiftAsync(int shiftId, int adminId, string? reason)
        {
            var shift = await _shiftRepository.GetByIdAsync(shiftId);

            if (shift == null)
                throw new InvalidOperationException("Không tìm thấy ca chờ duyệt");

            shift.AdminId = adminId;
            shift.RejectReason = reason;
            shift.Status = "Rejected";

            await _shiftRepository.UpdateAsync(shift);

            return MapToViewDto(shift);
        }
        public async Task<List<ShiftViewDto>> GetPendingShiftsAsync()
        {
            var shifts = await _shiftRepository.GetPendingShiftsAsync();

            return shifts.Select(s => MapToViewDto(s)).ToList();
        }
        public async Task<List<ShiftViewDto>> GetAllShiftsAsync(string? status = null)
        {
            var shifts = await _shiftRepository.GetAllAsync(status);

            return shifts.Select(s => MapToViewDto(s)).ToList();
        }
        public async Task<ZReportDto> AdminGetZReportAsync(int shiftId)
        {
            var shift = await _shiftRepository.GetByIdWithDetailsAsync(shiftId);

            if (shift == null)
                throw new InvalidOperationException("Không tìm thấy ca");

            return await BuildZReport(shift);
        }
        public async Task<ShiftViewDto> AdminForceCloseShiftAsync(int shiftId, int adminId)
        {
            var shift = await _shiftRepository.GetByIdWithDetailsAsync(shiftId);

            if (shift == null || shift.Status != "Open")
                throw new InvalidOperationException("Không tìm thấy ca đang mở");

            var closeTime = DateTime.Now;
            var ordersInShift = await _shiftRepository
                .GetOrdersInShiftAsync(shift.OpenTime, closeTime);
            var completedOrders = ordersInShift.Where(o => o.Status == "Completed").ToList();

            shift.CloseTime = closeTime;
            shift.ClosingCash = 0;
            shift.AdminId = adminId;
            shift.TotalOrders = completedOrders.Count;
            shift.TotalRevenue = completedOrders.Sum(o => o.TotalAmount);
            shift.Difference = null; // Admin force close — không tính chênh lệch
            shift.Status = "Closed";

            await _shiftRepository.UpdateAsync(shift);

            _logger.LogWarning("Admin #{AdminId} force close ca #{ShiftId}", adminId, shiftId);

            return MapToViewDto(shift);
        }

        // ===================== KITCHEN =====================
        public async Task<ShiftViewDto> KitchenCloseShiftAsync(int shiftId, int kitchenId)
        {
            var shift = await _shiftRepository.GetByIdWithDetailsAsync(shiftId);

            if (shift == null || shift.UserId != kitchenId || shift.Status != "Open" || shift.ShiftType != "Kitchen")
                throw new InvalidOperationException("Không tìm thấy ca bếp đang mở");

            shift.CloseTime = DateTime.Now;
            shift.Status = "Closed";
            // Kitchen không có tiền quỹ, không cần tính doanh thu
            shift.ClosingCash = null;
            shift.TotalOrders = null;
            shift.TotalRevenue = null;
            shift.Difference = null;

            await _shiftRepository.UpdateAsync(shift);

            _logger.LogInformation("Kitchen #{KitchenId} đóng ca #{ShiftId}", kitchenId, shiftId);

            return MapToViewDto(shift);
        }
        // ===================== HELPERS =====================
        private async Task<ZReportDto> BuildZReport(Shift shift)
        {
            var closeTime = shift.CloseTime ?? DateTime.Now;

            var ordersInShift = await _shiftRepository
                .GetOrdersInShiftAsync(shift.OpenTime, closeTime);
            var completedOrders = ordersInShift.Where(o => o.Status == "Completed").ToList();

            var paymentBreakdown = completedOrders
                .GroupBy(o => o.PaymentMethod)
                .Select(g => new PaymentBreakdownItem
                {
                    PaymentMethod = g.Key,
                    Count = g.Count(),
                    Amount = g.Sum(o => o.TotalAmount)
                }).ToList();

            var topProducts = completedOrders
                .SelectMany(o => o.OrderItems)
                .GroupBy(oi => oi.Product.Name)
                .Select(g => new TopProductItem
                {
                    ProductName = g.Key,
                    QuantitySold = g.Sum(oi => oi.Quantity),
                    Revenue = g.Sum(oi => oi.PriceAtOrder * oi.Quantity)
                })
                .OrderByDescending(p => p.QuantitySold)
                .Take(10)
                .ToList();

            return new ZReportDto
            {
                ShiftId = shift.Id,
                CashierName = shift.User?.FullName ?? "N/A",
                AdminName = shift.Admin?.FullName ?? "N/A",
                OpenTime = shift.OpenTime,
                CloseTime = closeTime,
                OpeningCash = shift.OpeningCash,
                ClosingCash = shift.ClosingCash ?? 0,
                Difference = shift.Difference,
                TotalOrders = completedOrders.Count,
                TotalRevenue = completedOrders.Sum(o => o.TotalAmount),
                PaymentBreakdown = paymentBreakdown,
                TopProducts = topProducts
            };
        }
        private ShiftViewDto MapToViewDto(Shift shift, decimal cashRevenue = 0)
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
                CashRevenue = cashRevenue,
                Status = shift.Status,
                ShiftType = shift.ShiftType,
                RejectReason = shift.RejectReason
            };
        }
    }
}