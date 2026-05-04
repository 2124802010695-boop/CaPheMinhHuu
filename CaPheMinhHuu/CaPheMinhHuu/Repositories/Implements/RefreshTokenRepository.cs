using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly ApplicationDbContext _context;
        public RefreshTokenRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(RefreshToken token)
        {
            _context.RefreshTokens.Add(token);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken?> GetActiveByTokenAsync(string token)
            => await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == token);

        public async Task<RefreshToken?> GetByTokenAsync(string token)
            => await _context.RefreshTokens
                .FirstOrDefaultAsync(r => r.Token == token);

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();
    }
}
