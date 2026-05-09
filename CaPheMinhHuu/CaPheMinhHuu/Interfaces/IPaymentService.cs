using CaPheMinhHuu.DTOs.Payment;
using Microsoft.AspNetCore.Http;

namespace CaPheMinhHuu.Interfaces
{
    public interface IPaymentService
    {
        Task<string> CreateVnPayUrlAsync(int orderId, decimal amount, string orderCode, string ipAddress);
        Task<PaymentResultDto> ProcessCallbackAsync(IQueryCollection query);
    }
}
