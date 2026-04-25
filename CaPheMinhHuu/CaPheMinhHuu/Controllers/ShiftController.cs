using CaPheMinhHuu.DTOs.Shift;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using CaPheMinhHuu.Hubs;
namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShiftController : ControllerBase
    {
        private readonly IShiftService _shiftService;
        private readonly IHubContext<ShiftHub> _shiftHub;
        public ShiftController(IShiftService shiftService, IHubContext<ShiftHub> shiftHub)
        {
            _shiftService = shiftService;
            _shiftHub = shiftHub;
        }
        private int GetUserId()
        {
            var claim = User.FindFirst("id")?.Value;
            return int.Parse(claim!);
        }
        // ===================== CASHIER =====================
        [Authorize(Roles = "Cashier")]
        [HttpPost("request-open")]
        public async Task<IActionResult> RequestOpenShift([FromBody] ShiftOpenDto dto)
        {
            try
            {
                var result = await _shiftService.RequestOpenShiftAsync(GetUserId(), dto);
                await _shiftHub.Clients.Group("Admin").SendAsync("ShiftPendingApproval", new
                {
                    shiftId = result.Id,
                    cashierName = result.UserName,
                    openingCash = result.OpeningCash,
                    message = $"{result.UserName} yêu cầu mở ca (tiền đầu ca: {result.OpeningCash:N0}đ)"
                });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [Authorize(Roles = "Cashier")]
        [HttpPost("close/{shiftId}")]
        public async Task<IActionResult> CloseShift(int shiftId, [FromBody] ShiftCloseDto dto)
        {
            try
            {
                var result = await _shiftService.CloseShiftAsync(shiftId, GetUserId(), dto);
                // Thông báo Admin có Z-Report mới cần hậu kiểm
                await _shiftHub.Clients.Group("Admin").SendAsync("ShiftClosed", new
                {
                    shiftId = result.Id,
                    cashierName = result.UserName,
                    message = $"{result.UserName} đã đóng ca. Z-Report sẵn sàng hậu kiểm."
                });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [Authorize(Roles = "Cashier")]
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentShift()
        {
            var shift = await _shiftService.GetCurrentShiftAsync(GetUserId());
            if (shift == null)
                return Ok(new { message = "Chưa có ca", shift = (object?)null });
            return Ok(shift);
        }
        [Authorize(Roles = "Cashier")]
        [HttpGet("z-report/{shiftId}")]
        public async Task<IActionResult> GetZReport(int shiftId)
        {
            try
            {
                var report = await _shiftService.GetZReportAsync(shiftId, GetUserId());
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        // ===================== ADMIN =====================
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/pending")]
        public async Task<IActionResult> GetPendingShifts()
        {
            var shifts = await _shiftService.GetPendingShiftsAsync();
            return Ok(shifts);
        }
        [Authorize(Roles = "Admin")]
        [HttpPost("admin/approve/{shiftId}")]
        public async Task<IActionResult> ApproveShift(int shiftId)
        {
            try
            {
                var result = await _shiftService.ApproveShiftAsync(shiftId, GetUserId());
                await _shiftHub.Clients.Group($"User_{result.UserId}").SendAsync("ShiftApproved", new
                {
                    shiftId = result.Id,
                    adminName = result.AdminName,
                    message = $"Ca đã được {result.AdminName} xác nhận quỹ"
                });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [Authorize(Roles = "Admin")]
        [HttpPost("admin/reject/{shiftId}")]
        public async Task<IActionResult> RejectShift(int shiftId, [FromBody] ShiftRejectDto? dto)
        {
            try
            {
                var result = await _shiftService.RejectShiftAsync(shiftId, GetUserId(), dto?.Reason);
                await _shiftHub.Clients.Group($"User_{result.UserId}").SendAsync("ShiftRejected", new
                {
                    shiftId = result.Id,
                    reason = result.RejectReason,
                    message = $"Ca bị từ chối: {result.RejectReason ?? "Không rõ lý do"}"
                });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> AdminGetAllShifts([FromQuery] string? status = null)
        {
            var shifts = await _shiftService.GetAllShiftsAsync(status);
            return Ok(shifts);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/z-report/{shiftId}")]
        public async Task<IActionResult> AdminGetZReport(int shiftId)
        {
            try
            {
                var report = await _shiftService.AdminGetZReportAsync(shiftId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}