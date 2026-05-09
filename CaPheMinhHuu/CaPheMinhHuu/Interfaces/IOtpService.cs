namespace CaPheMinhHuu.Interfaces
{
    public enum OtpVerifyResult
    {
        Success,
        InvalidCode,
        Expired,
        MaxAttemptsReached,
        AlreadyUsed
    }

    public interface IOtpService
    {
        Task GenerateOtpAsync(string target, string purpose);
        Task<OtpVerifyResult> VerifyOtpAsync(string target, string purpose, string code);
    }
}
