using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            // Tìm chính xác username (không phân biệt hoa thường)
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<bool> IsUserExistsAsync(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username == username);
        }
        public async Task<User?> GetByIdAsync(int id)
            => await _context.Users.FindAsync(id);

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();
    }
}