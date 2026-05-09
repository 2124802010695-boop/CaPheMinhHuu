namespace CaPheMinhHuu.DTOs.Customer
{
    public class CustomerVerifyOtpDto
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; } = null!;
        public bool WantRegister { get; set; } = false;
    }
}
