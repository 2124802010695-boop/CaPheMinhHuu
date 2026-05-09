using CaPheMinhHuu.DTOs.Customer;

namespace CaPheMinhHuu.Interfaces
{
    public interface ICustomerService
    {
        Task SendOtpAsync(string email);
        Task<CustomerAuthResponseDto> VerifyOtpAndLoginAsync(CustomerVerifyOtpDto dto);
        Task<CustomerProfileDto?> GetProfileAsync(int userId);
        Task<CustomerAuthResponseDto> GoogleLoginAsync(string idToken);
    }
}
