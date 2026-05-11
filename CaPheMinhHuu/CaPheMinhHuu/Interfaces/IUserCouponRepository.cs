using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IUserCouponRepository : IRepository<UserCoupon>
    {
        Task<IEnumerable<UserCoupon>> GetByUserIdAsync(int userId);
        Task<UserCoupon?> GetActiveByUserIdAsync(int userId);
    }
}
