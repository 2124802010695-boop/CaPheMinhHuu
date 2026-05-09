using CaPheMinhHuu.DTOs.Customer;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/customer")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ILogger<CustomerController> _logger;

        public CustomerController(ICustomerService customerService, ILogger<CustomerController> logger)
        {
            _customerService = customerService;
            _logger          = logger;
        }

        private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);

        // POST /api/customer/send-otp
        [HttpPost("send-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> SendOtp([FromBody] CustomerSendOtpDto dto)
        {
            await _customerService.SendOtpAsync(dto.Email);
            return Ok(new { message = "Mã OTP đã được gửi đến email của bạn" });
        }

        // POST /api/customer/verify-otp
        [HttpPost("verify-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyOtp([FromBody] CustomerVerifyOtpDto dto)
        {
            try
            {
                var result = await _customerService.VerifyOtpAndLoginAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message == "GuestOnly")
            {
                return Ok(new { isGuest = true, message = "Xác thực thành công" });
            }
        }

        // POST /api/customer/google-login
        [HttpPost("google-login")]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            var result = await _customerService.GoogleLoginAsync(dto.IdToken);
            return Ok(result);
        }

        // GET /api/customer/profile
        [HttpGet("profile")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetProfile()
        {
            var profile = await _customerService.GetProfileAsync(GetUserId());
            if (profile == null) return NotFound();
            return Ok(profile);
        }
    }
}
