using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface ILoginHistoryRepository
    {
        Task AddAsync(LoginHistory history);
    }

}
