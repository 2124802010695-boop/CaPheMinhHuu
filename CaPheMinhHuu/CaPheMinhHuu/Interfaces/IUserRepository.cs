using CaPheMinhHuu.Data;
using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IUserRepository
    {
        // Tìm User bằng username (dùng cho Login)
        Task<User?> GetUserByUsernameAsync(string username);

        // Kiểm tra user tồn tại (dùng cho Validate)
        Task<bool> IsUserExistsAsync(string username);
    }
}