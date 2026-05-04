using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IShiftRepository
    {
        Task<Shift> CreateAsync(Shift shift);
        Task<Shift?> GetByIdAsync(int id);
        Task<Shift?> GetByIdWithDetailsAsync(int id);
        Task<Shift?> GetOpenShiftByUserAsync(int userId);
        Task<List<Shift>> GetPendingShiftsAsync();
        Task<List<Shift>> GetAllAsync(string? status = null);
        Task UpdateAsync(Shift shift);
        Task LoadUserAsync(Shift shift);
        Task LoadAdminAsync(Shift shift);
        Task<List<Order>> GetOrdersInShiftAsync(int userId, DateTime openTime, DateTime closeTime);
    }
}
