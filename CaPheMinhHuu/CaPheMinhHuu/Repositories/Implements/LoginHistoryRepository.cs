using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class LoginHistoryRepository : ILoginHistoryRepository
    {
        private readonly ApplicationDbContext _context;
        public LoginHistoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(LoginHistory history)
        {
            _context.LoginHistory.Add(history);
            await _context.SaveChangesAsync();
        }
    }
}
