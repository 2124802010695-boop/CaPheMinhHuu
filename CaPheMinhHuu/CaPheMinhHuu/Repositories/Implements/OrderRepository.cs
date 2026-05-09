using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.Order;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
namespace CaPheMinhHuu.Repositories.Implements
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;
        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<Order> CreateAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }
        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Table)
                .FirstOrDefaultAsync(o => o.Id == id);
        }
        public async Task<List<Order>> GetAllAsync()
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Table)
                .OrderByDescending(o => o.CreatedDate)
                .ToListAsync();
        }
        public async Task<List<Order>> GetByDateAsync(DateTime date)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Table)
                .Where(o => o.OrderDate.Date == date.Date)
                .OrderByDescending(o => o.CreatedDate)
                .ToListAsync();
        }
        public async Task<IDbContextTransaction> BeginTransactionAsync()
    => await _context.Database.BeginTransactionAsync();
        public async Task UpdateStatusAsync(int id, string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order != null)
            {
                order.Status = status;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Order?> GetByOrderCodeAsync(string orderCode)
            => await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Table)
                .FirstOrDefaultAsync(o => o.OrderCode == orderCode && !o.IsDeleted);
    }
}