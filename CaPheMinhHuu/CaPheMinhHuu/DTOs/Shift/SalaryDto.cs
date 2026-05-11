namespace CaPheMinhHuu.DTOs.Shift
{
    /// <summary>
    /// Tổng lương 1 nhân viên trong tháng
    /// </summary>
    public class StaffSalaryDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
        public int TotalShifts { get; set; }
        public double TotalHours { get; set; }
        public decimal TotalSalary { get; set; }
        public List<ShiftSalaryDetailDto> Shifts { get; set; } = new();
    }

    /// <summary>
    /// Chi tiết lương từng ca
    /// </summary>
    public class ShiftSalaryDetailDto
    {
        public int ShiftId { get; set; }
        public string ShiftType { get; set; } = string.Empty;
        public DateTime OpenTime { get; set; }
        public DateTime CloseTime { get; set; }
        public double Hours { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal Multiplier { get; set; }
        public string? HolidayName { get; set; }
        public decimal Salary { get; set; }
    }

    /// <summary>
    /// Response bảng lương toàn bộ tháng
    /// </summary>
    public class MonthlySalaryDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal TotalPayout { get; set; }
        public List<StaffSalaryDto> Staffs { get; set; } = new();
    }
}
