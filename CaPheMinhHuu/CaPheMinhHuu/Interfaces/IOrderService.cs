using CaPheMinhHuu.DTOs.Order;
namespace CaPheMinhHuu.Interfaces
{
    public interface IOrderService
    {
        Task<OrderViewDto> CreateOrderAsync(OrderCreateDto dto, int userId);
        Task<OrderViewDto?> GetOrderByIdAsync(int id);
        Task<List<OrderViewDto>> GetTodayOrdersAsync();
        Task UpdateOrderStatusAsync(int id, string status);
    }
}