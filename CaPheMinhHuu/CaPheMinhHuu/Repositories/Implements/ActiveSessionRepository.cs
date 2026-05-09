using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class ActiveSessionRepository : IActiveSessionRepository
    {
        private readonly ApplicationDbContext _context;

        public ActiveSessionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(ActiveSession session)
        {
            _context.ActiveSessions.Add(session);
            await _context.SaveChangesAsync();
        }

        public async Task<ActiveSession?> GetByTabIdAsync(string tabId)
            => await _context.ActiveSessions
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.TabId == tabId);

        public async Task<IEnumerable<ActiveSession>> GetActiveByUserIdAsync(int userId)
            => await _context.ActiveSessions
                .Where(a => a.UserId == userId && a.IsActive)
                .ToListAsync();

        public async Task<IEnumerable<ActiveSession>> GetActiveByTabIdAsync(string tabId)
            => await _context.ActiveSessions
                .Where(a => a.TabId == tabId && a.IsActive)
                .ToListAsync();

        public async Task<IEnumerable<ActiveSession>> GetAllActiveAsync()
            => await _context.ActiveSessions
                .Include(a => a.User)
                .Where(a => a.IsActive)
                .OrderByDescending(a => a.LoginAt)
                .ToListAsync();

        public async Task UpdateAsync(ActiveSession session)
        {
            _context.ActiveSessions.Update(session);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();
    }
}
