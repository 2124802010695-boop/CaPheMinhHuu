using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class OtpRepository : IOtpRepository
    {
        private readonly ApplicationDbContext _context;

        public OtpRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<OtpCode?> GetActiveOtpAsync(string target, string purpose)
            => await _context.OtpCodes
                .Where(o => o.Target == target
                         && o.Purpose == purpose
                         && !o.IsUsed
                         && !o.IsDeleted)
                .OrderByDescending(o => o.CreatedDate)
                .FirstOrDefaultAsync();

        public async Task AddAsync(OtpCode otp)
        {
            await _context.OtpCodes.AddAsync(otp);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(OtpCode otp)
        {
            _context.OtpCodes.Update(otp);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteExpiredAsync()
        {
            var expired = await _context.OtpCodes
                .Where(o => o.ExpiresAt < DateTime.UtcNow && !o.IsDeleted)
                .ToListAsync();
            foreach (var o in expired)
                o.IsDeleted = true;
            await _context.SaveChangesAsync();
        }
    }
}
