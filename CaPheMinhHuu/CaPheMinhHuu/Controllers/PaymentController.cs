using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Hubs;
using Microsoft.AspNetCore.SignalR;
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
        private readonly IHubContext<AppHub> _hubContext;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            IPaymentService paymentService,
            IOrderService orderService,
            IConfiguration configuration,
            IHubContext<AppHub> hubContext,
            ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _orderService   = orderService;
            _configuration  = configuration;
            _hubContext     = hubContext;
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
        // GET /api/payment/vietqr-config
        [HttpGet("vietqr-config")]
        [AllowAnonymous]
        public IActionResult GetVietQRConfig()
        {
            var config = _configuration.GetSection("VietQR:Customer");
            return Ok(new
            {
                bankId      = config["BankId"],
                accountNo   = config["AccountNo"],
                accountName = config["AccountName"]
            });
        }

        // POST /api/payment/sepay-webhook
        [HttpPost("sepay-webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> SepayWebhook([FromBody] CaPheMinhHuu.DTOs.Payment.SepayWebhookDto dto)
        {
            try
            {
                // Verify API Key từ header
                var apiKey = Request.Headers["Authorization"].ToString().Replace("Apikey ", "");
                var expectedKey = _configuration["VietQR:Customer:SepayApiKey"];
                if (!string.IsNullOrEmpty(expectedKey) && apiKey != expectedKey)
                {
                    _logger.LogWarning("SePay webhook: invalid API key");
                    return Unauthorized();
                }

                // Parse orderCode từ nội dung chuyển khoản
                // SePay gửi: transferContent = "CAFEMINHHUU ORDER123"
                var content = dto.Content?.ToUpper() ?? "";
                _logger.LogInformation("SePay webhook received: {Content}", content);

                // Tìm orderCode trong nội dung (format: ORD-XXXXXXXX)
                var words     = content.Split(' ');
                string? orderCode = words.FirstOrDefault(w => w.StartsWith("ORD-"));

                if (orderCode == null)
                {
                    _logger.LogInformation("SePay webhook: no orderCode found in content");
                    return Ok(new { message = "No orderCode found" });
                }

                var order = await _orderService.GetByOrderCodeAsync(orderCode);
                if (order == null)
                {
                    _logger.LogWarning("SePay webhook: order {OrderCode} not found", orderCode);
                    return Ok(new { message = "Order not found" });
                }

                await _orderService.UpdateOrderStatusAsync(order.Id, "Paid");
                await _hubContext.Clients.Group($"Order_{orderCode}")
                    .SendAsync("OrderStatusUpdated", orderCode, "Paid");
                _logger.LogInformation("SePay webhook: order {OrderCode} marked as Paid", orderCode);

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SePay webhook error");
                return Ok(new { success = false });
            }
        }
    }
}
