using CaPheMinhHuu.DTOs.Order;
namespace CaPheMinhHuu.Interfaces
{
    public interface IOrderService
    {
        Task<OrderViewDto> CreateOrderAsync(OrderCreateDto dto, int userId, int? shiftId = null);
        Task<OrderViewDto?> GetOrderByIdAsync(int id);
        Task<List<OrderViewDto>> GetTodayOrdersAsync();
        Task UpdateOrderStatusAsync(int id, string status);
        Task<OrderViewDto> CreateGuestOrderAsync(GuestOrderCreateDto dto);
        Task<OrderViewDto?> GetByOrderCodeAsync(string orderCode);
    }
}