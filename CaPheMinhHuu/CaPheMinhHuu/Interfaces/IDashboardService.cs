using CaPheMinhHuu.DTOs.Dashboard;

namespace CaPheMinhHuu.Interfaces
{
    public interface IDashboardService
    {
        /// <summary>
        /// Lấy thống kê dashboard.
        /// </summary>
        /// <param name="chartDays">Số ngày hiển thị biểu đồ (mặc định 7, tối đa 30)</param>
        Task<DashboardStatsDto> GetStatsAsync(int chartDays = 7);
    }
}
