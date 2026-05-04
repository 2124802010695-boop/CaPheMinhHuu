using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;
namespace CaPheMinhHuu.Repositories.Implements
{
    public class TableRepository : ITableRepository
    {
        private readonly ApplicationDbContext _context;
        public TableRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task UpdateStatusAsync(int tableId, string status)
        {
            var table = await _context.Tables
                .FirstOrDefaultAsync(t => t.Id == tableId && !t.IsDeleted);
            if (table == null) return; // Bàn không tồn tại → bỏ qua, không throw
            table.Status = status;
            await _context.SaveChangesAsync();
        }
        public async Task<IEnumerable<Table>> GetAllAsync()
        {
            return await _context.Tables
                .Where(t => !t.IsDeleted)
                .ToListAsync();
        }
        public async Task<IEnumerable<Table>> GetAllWithAreaAsync()
        {
            return await _context.Tables
                .Include(t => t.AreaNavigation)
                .Where(t => !t.IsDeleted)
                .OrderBy(t => t.AreaNavigation != null ? t.AreaNavigation.DisplayOrder : 999)
                .ThenBy(t => t.Number)
                .ToListAsync();
        }
        public async Task<Table?> GetByIdAsync(int id)
        {
            return await _context.Tables
                .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
        }
        public async Task<Table> CreateAsync(Table table)
        {
            await _context.Tables.AddAsync(table);
            await _context.SaveChangesAsync();
            return table;
        }
        public async Task UpdateAsync(Table table)
        {
            _context.Tables.Update(table);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(int id)
        {
            var table = await GetByIdAsync(id);
            if (table == null) throw new Exception("Table not found");
            table.IsDeleted = true;
            await _context.SaveChangesAsync();
        }
    }
}
