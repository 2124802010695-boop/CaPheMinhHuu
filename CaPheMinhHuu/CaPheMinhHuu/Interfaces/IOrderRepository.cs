using CaPheMinhHuu.Models;
namespace CaPheMinhHuu.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order> CreateAsync(Order order);
        Task<Order?> GetByIdAsync(int id);
        Task<List<Order>> GetAllAsync();
        Task<List<Order>> GetByDateAsync(DateTime date);
        Task UpdateStatusAsync(int id, string status);
    }
}