using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/payment")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IOrderService _orderService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            IPaymentService paymentService,
            IOrderService orderService,
            IConfiguration configuration,
            ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _orderService   = orderService;
            _configuration  = configuration;
            _logger         = logger;
        }

        // POST /api/payment/vnpay/create-url
        [HttpPost("vnpay/create-url")]
        [AllowAnonymous]
        public async Task<IActionResult> CreatePaymentUrl([FromBody] CaPheMinhHuu.DTOs.Payment.CreatePaymentDto dto)
        {
            var order = await _orderService.GetByOrderCodeAsync(dto.OrderCode);
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var url = await _paymentService.CreateVnPayUrlAsync(
                order.Id, order.TotalAmount, order.OrderCode!, ipAddress);

            return Ok(new { paymentUrl = url });
        }

        // GET /api/payment/vnpay/callback
        [HttpGet("vnpay/callback")]
        [AllowAnonymous]
        public async Task<IActionResult> VnPayCallback()
        {
            var result    = await _paymentService.ProcessCallbackAsync(Request.Query);
            var returnUrl = _configuration["VnPay:ReturnUrl"] ?? "http://localhost:5173/payment/callback";

            if (result.IsSuccess)
            {
                // Update order status → Completed
                var order = await _orderService.GetByOrderCodeAsync(result.OrderCode);
                if (order != null)
                    await _orderService.UpdateOrderStatusAsync(order.Id, "Completed");

                return Redirect($"{returnUrl}?success=true&orderCode={result.OrderCode}&amount={result.Amount}");
            }

            return Redirect($"{returnUrl}?success=false&message={Uri.EscapeDataString(result.Message)}");
        }
    }
}
