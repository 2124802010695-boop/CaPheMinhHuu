using CaPheMinhHuu.DTOs.Auth;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [EnableRateLimiting("LoginLimit")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);

            if (response == null)
            {
                return Unauthorized(new { message = "Sai tên đăng nhập hoặc mật khẩu" });
            }

            return Ok(response);
        }
        [HttpGet("check-token")]
        [Authorize] // Yêu cầu phải có token mới vào được
        public IActionResult CheckToken()
        {
            var user = HttpContext.User;

            // Lấy tất cả các thông tin (claims) mà Server đọc được từ Token
            var claims = user.Claims.Select(c => new { c.Type, c.Value }).ToList();

            // Kiểm tra xem Server có nhận ra Role không
            var isInRoleAdmin = user.IsInRole("Admin");

            return Ok(new
            {
                Message = "Giải mã Token thành công",
                IsAdmin = isInRoleAdmin, // Quan trọng: True hay False?
                AllClaims = claims
            });
        }
        [HttpPost("admin/login")]
        [EnableRateLimiting("LoginLimit")]
        public async Task<IActionResult> AdminLogin([FromBody] AdminLoginRequest request)
        {
            var response = await _authService.AdminLoginAsync(request);
            if (response == null)
            {
                return Unauthorized(new { message = "Sai tên đăng nhập hoặc mật khẩu" });
            }
            // Ghi login history
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
            await _authService.RecordLoginHistoryAsync(response.User.Id, "Admin", "Success", ipAddress, userAgent);
            return Ok(response);
        }
        [HttpPost("staff/login")]
        [EnableRateLimiting("LoginLimit")]
        public async Task<IActionResult> StaffLogin([FromBody] StaffLoginRequest request)
        {
            var response = await _authService.StaffLoginAsync(request);
            if (response == null)
            {
                return Unauthorized(new { message = "Sai mã nhân viên hoặc mật khẩu" });
            }
            // Ghi login history
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
            await _authService.RecordLoginHistoryAsync(response.User.Id, "Staff", "Success", ipAddress, userAgent);
            return Ok(response);
        }
        
        // POST: api/Auth/refresh-token
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var response = await _authService.RefreshTokenAsync(request.RefreshToken, ipAddress);

            if (response == null)
                return Unauthorized(new { message = "Refresh Token không hợp lệ hoặc đã hết hạn" });

            return Ok(response);
        }
        // POST: api/Auth/revoke-token (Logout)
        [HttpPost("revoke-token")]
        [Authorize]
        public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequest request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.RevokeTokenAsync(request.RefreshToken, ipAddress);

            if (!result)
                return BadRequest(new { message = "Token không tồn tại hoặc đã bị thu hồi" });

            return Ok(new { message = "Đã đăng xuất thành công" });
        }
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var result = await _authService.ChangePasswordAsync(request.StaffCode, request.OldPassword, request.NewPassword);
            if (!result)
                return BadRequest(new { message = "Mật khẩu cũ không đúng hoặc tài khoản không tồn tại" });
            return Ok(new { message = "Đổi mật khẩu thành công" });
        }
    }
}