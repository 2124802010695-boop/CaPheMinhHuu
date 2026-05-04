using CaPheMinhHuu.DTOs.Email;
namespace CaPheMinhHuu.Interfaces

{


    public interface IEmailService
    {

        Task SendOtpAsync(string toEmail, string otpCode, string purpose);


        Task SendOrderConfirmationAsync(string toEmail, OrderEmailDto orderData);


        Task SendPaymentReceiptAsync(string toEmail, string orderCode, string transactionId, decimal amount);
    }
}
