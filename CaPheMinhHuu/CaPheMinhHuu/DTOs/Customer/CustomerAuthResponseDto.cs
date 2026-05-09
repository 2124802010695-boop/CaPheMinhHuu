namespace CaPheMinhHuu.DTOs.Customer
{
    public class CustomerAuthResponseDto
    {
        public string Token { get; set; } = null!;
        public string? RefreshToken { get; set; }
        public CustomerProfileDto User { get; set; } = null!;
        public bool IsNewUser { get; set; } = false;
    }
}
