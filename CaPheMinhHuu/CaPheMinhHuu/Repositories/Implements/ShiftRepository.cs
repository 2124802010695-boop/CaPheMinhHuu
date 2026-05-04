using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class ShiftRepository : IShiftRepository
    {
        private readonly ApplicationDbContext _context;

        public ShiftRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Shift> CreateAsync(Shift shift)
        {
            _context.Shifts.Add(shift);
            await _context.SaveChangesAsync();
            return shift;
        }

        public async Task<Shift?> GetByIdAsync(int id)
        {
            return await _context.Shifts.FindAsync(id);
        }

        public async Task<Shift?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Shifts
                .Include(s => s.User)
                .Include(s => s.Admin)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Shift?> GetOpenShiftByUserAsync(int userId)
        {
            return await _context.Shifts
                .FirstOrDefaultAsync(s => s.UserId == userId
                    && (s.Status == "Open" || s.Status == "PendingOpen"));
        }

        public async Task<List<Shift>> GetPendingShiftsAsync()
        {
            return await _context.Shifts
                .Include(s => s.User)
                .Where(s => s.Status == "PendingOpen")
                .OrderByDescending(s => s.OpenTime)
                .ToListAsync();
        }

        public async Task<List<Shift>> GetAllAsync(string? status = null)
        {
            var query = _context.Shifts
                .Include(s => s.User)
                .Include(s => s.Admin)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(s => s.Status == status);

            return await query.OrderByDescending(s => s.OpenTime).ToListAsync();
        }

        public async Task UpdateAsync(Shift shift)
        {
            _context.Shifts.Update(shift);
            await _context.SaveChangesAsync();
        }

        public async Task LoadUserAsync(Shift shift)
        {
            await _context.Entry(shift).Reference(s => s.User).LoadAsync();
        }

        public async Task LoadAdminAsync(Shift shift)
        {
            await _context.Entry(shift).Reference(s => s.Admin).LoadAsync();
        }

        public async Task<List<Order>> GetOrdersInShiftAsync(int userId, DateTime openTime, DateTime closeTime)
        {
            return await _context.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId
                         && o.OrderDate >= openTime
                         && o.OrderDate <= closeTime)
                .ToListAsync();
        }
    }
}
