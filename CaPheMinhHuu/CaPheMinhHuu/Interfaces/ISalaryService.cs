using CaPheMinhHuu.DTOs.Shift;

namespace CaPheMinhHuu.Interfaces
{
    public interface ISalaryService
    {
        /// <summary>
        /// Tính bảng lương toàn bộ nhân viên trong tháng
        /// </summary>
        Task<MonthlySalaryDto> GetMonthlySalaryAsync(int month, int year);

        /// <summary>
        /// Tính lương 1 nhân viên trong tháng
        /// </summary>
        Task<StaffSalaryDto?> GetStaffSalaryAsync(int userId, int month, int year);
    }
}
