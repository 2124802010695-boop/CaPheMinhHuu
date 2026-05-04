namespace CaPheMinhHuu.Interfaces
{
    public interface IOtpService
    {
        Task<string> GenerateOtpAsync(string target, string targetType, string purpose);
        Task<bool> VerifyOtpAsync(string target, string code, string purpose);
        Task CleanExpiredOtpsAsync(); // Dọn OTP hết hạn
    }
}
