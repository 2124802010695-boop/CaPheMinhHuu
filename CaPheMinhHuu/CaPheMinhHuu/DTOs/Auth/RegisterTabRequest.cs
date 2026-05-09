namespace CaPheMinhHuu.DTOs.Auth
{
    public class RegisterTabRequest
    {
        public string TabId { get; set; } = null!;
    }

    public class RevokeTabRequest
    {
        public string TabId { get; set; } = null!;
        public string? Reason { get; set; }
    }
}
