using CaPheMinhHuu.DTOs.Order;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore.Storage;
namespace CaPheMinhHuu.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order> CreateAsync(Order order);
        Task<Order?> GetByIdAsync(int id);
        Task<List<Order>> GetAllAsync();
        Task<List<Order>> GetByDateAsync(DateTime date);
        Task UpdateStatusAsync(int id, string status);
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<Order?> GetByOrderCodeAsync(string orderCode);
        Task<bool> HasActiveOrdersForTableAsync(int tableId, int excludeOrderId);
    }
}