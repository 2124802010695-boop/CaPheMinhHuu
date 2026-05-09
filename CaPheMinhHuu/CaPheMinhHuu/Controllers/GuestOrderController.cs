using CaPheMinhHuu.DTOs.Order;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/guest")]
    [ApiController]
    public class GuestOrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<GuestOrderController> _logger;

        public GuestOrderController(IOrderService orderService, ILogger<GuestOrderController> logger)
        {
            _orderService = orderService;
            _logger       = logger;
        }

        // POST /api/guest/order
        [HttpPost("order")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateGuestOrder([FromBody] GuestOrderCreateDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest(new { message = "Đơn hàng phải có ít nhất 1 sản phẩm" });

            var result = await _orderService.CreateGuestOrderAsync(dto);
            return Ok(result);
        }

        // GET /api/guest/order/{orderCode}
        [HttpGet("order/{orderCode}")]
        [AllowAnonymous]
        public async Task<IActionResult> TrackOrder(string orderCode)
        {
            var order = await _orderService.GetByOrderCodeAsync(orderCode);
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });
            return Ok(order);
        }
    }
}
