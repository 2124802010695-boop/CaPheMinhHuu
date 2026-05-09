using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Services.Implements
{
    public class OtpService : IOtpService
    {
        private readonly IOtpRepository _otpRepo;
        private readonly IEmailService _emailService;
        private readonly ILogger<OtpService> _logger;

        public OtpService(IOtpRepository otpRepo, IEmailService emailService, ILogger<OtpService> logger)
        {
            _otpRepo    = otpRepo;
            _emailService = emailService;
            _logger     = logger;
        }

        public async Task GenerateOtpAsync(string target, string purpose)
        {
            // Dọn OTP hết hạn trước
            await _otpRepo.DeleteExpiredAsync();

            // Tạo mã 6 số
            var code = new Random().Next(100000, 999999).ToString();

            var otp = new OtpCode
            {
                Target      = target,
                TargetType  = "Email",
                Purpose     = purpose,
                Code        = code,
                ExpiresAt   = DateTime.UtcNow.AddMinutes(5),
                IsUsed      = false,
                AttemptCount = 0
            };

            await _otpRepo.AddAsync(otp);
            await _emailService.SendOtpAsync(target, code, purpose);

            _logger.LogInformation("OTP generated for {Target} purpose={Purpose}", target, purpose);
        }

        public async Task<OtpVerifyResult> VerifyOtpAsync(string target, string purpose, string code)
        {
            var otp = await _otpRepo.GetActiveOtpAsync(target, purpose);

            if (otp == null)
                return OtpVerifyResult.InvalidCode;

            if (otp.IsUsed)
                return OtpVerifyResult.AlreadyUsed;

            if (DateTime.UtcNow > otp.ExpiresAt)
                return OtpVerifyResult.Expired;

            if (otp.AttemptCount >= 5)
                return OtpVerifyResult.MaxAttemptsReached;

            if (otp.Code != code)
            {
                otp.AttemptCount++;
                await _otpRepo.UpdateAsync(otp);
                return OtpVerifyResult.InvalidCode;
            }

            // Thành công
            otp.IsUsed = true;
            await _otpRepo.UpdateAsync(otp);

            _logger.LogInformation("OTP verified for {Target} purpose={Purpose}", target, purpose);
            return OtpVerifyResult.Success;
        }
    }
}
