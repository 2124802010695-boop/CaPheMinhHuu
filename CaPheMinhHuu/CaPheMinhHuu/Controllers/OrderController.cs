using CaPheMinhHuu.DTOs.Order;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
namespace CaPheMinhHuu.Controllers

{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Class-level: mọi action đều yêu cầu auth, tránh quên gắn khi thêm action mới
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }
        // POST: api/Order
        [Authorize(Roles = "Admin, Cashier")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderCreateDto dto)
        {
            
            {
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized("Không xác định được người dùng");
                int userId = int.Parse(userIdClaim);

                int? shiftId = null;
                var shiftIdClaim = User.FindFirst("shiftId")?.Value;
                if (!string.IsNullOrEmpty(shiftIdClaim) && int.TryParse(shiftIdClaim, out int parsedShiftId))
                    shiftId = parsedShiftId;

                var result = await _orderService.CreateOrderAsync(dto, userId, shiftId);
                return Ok(result);
            }
            
        }
        // GET: api/Order/5
        [Authorize(Roles = "Admin, Cashier, Kitchen")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }
        // GET: api/Order/today
        [Authorize(Roles = "Admin, Cashier, Kitchen")]
        [HttpGet("today")]
        public async Task<IActionResult> GetToday()
        {
            var orders = await _orderService.GetTodayOrdersAsync();
            return Ok(orders);
        }
        // PATCH: api/Order/5/status
        [Authorize(Roles = "Admin, Cashier, Kitchen")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            await _orderService.UpdateOrderStatusAsync(id, status);
            return Ok(new { message = "Cập nhật trạng thái thành công" });
        }
        // PATCH: api/Order/5/pay
        [Authorize(Roles = "Admin, Cashier")]
        [HttpPatch("{id}/pay")]
        public async Task<IActionResult> MarkAsPaid(int id)
        {
            await _orderService.MarkAsPaidAsync(id);
            return Ok(new { message = "Đơn hàng đã được đánh dấu thanh toán" });
        }
    }
}