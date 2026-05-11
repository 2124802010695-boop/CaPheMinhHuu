using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class UserCouponRepository : IUserCouponRepository
    {
        private readonly ApplicationDbContext _context;

        public UserCouponRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserCoupon>> GetAllAsync()
            => await _context.UserCoupons.Include(uc => uc.Coupon).ToListAsync();

        public async Task<UserCoupon> GetByIdAsync(int id)
            => await _context.UserCoupons.Include(uc => uc.Coupon)
                .FirstOrDefaultAsync(uc => uc.Id == id)
                ?? throw new KeyNotFoundException($"UserCoupon {id} not found");

        public async Task AddAsync(UserCoupon entity)
        {
            await _context.UserCoupons.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(UserCoupon entity)
        {
            _context.UserCoupons.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(UserCoupon entity)
        {
            entity.IsDeleted = true;
            _context.UserCoupons.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<UserCoupon>> GetByUserIdAsync(int userId)
            => await _context.UserCoupons
                .Include(uc => uc.Coupon)
                .Where(uc => uc.UserId == userId)
                .ToListAsync();

        public async Task<UserCoupon?> GetActiveByUserIdAsync(int userId)
            => await _context.UserCoupons
                .Include(uc => uc.Coupon)
                .Where(uc => uc.UserId == userId && !uc.IsUsed)
                .FirstOrDefaultAsync();
    }
}
