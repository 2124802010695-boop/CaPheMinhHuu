namespace CaPheMinhHuu.Interfaces
{
    public class GoogleUserPayload
    {
        public string GoogleId { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Picture { get; set; }
    }

    public interface IGoogleAuthService
    {
        Task<GoogleUserPayload> ValidateAsync(string idToken);
    }
}
