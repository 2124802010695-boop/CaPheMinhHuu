using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.Shift;
using CaPheMinhHuu.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Services.Implements
{
    public class SalaryService : ISalaryService
    {
        private readonly ApplicationDbContext _context;

        public SalaryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MonthlySalaryDto> GetMonthlySalaryAsync(int month, int year)
        {
            var staffList = await _context.Users
                .Where(u => !u.IsDeleted && (u.Role == "Cashier" || u.Role == "Kitchen") && u.IsActive)
                .ToListAsync();

            var shifts = await _context.Shifts
                .Where(s => !s.IsDeleted
                    && s.Status == "Closed"
                    && s.CloseTime.HasValue
                    && s.OpenTime.Month == month
                    && s.OpenTime.Year == year)
                .Include(s => s.User)
                .ToListAsync();

            var holidays = await _context.HolidayConfigs
                .Where(h => !h.Creator.IsDeleted && h.IsActive
                    && h.Date.Month == month
                    && h.Date.Year == year)
                .ToListAsync();

            var staffSalaries = new List<StaffSalaryDto>();

            foreach (var staff in staffList)
            {
                var staffShifts = shifts.Where(s => s.UserId == staff.Id).ToList();
                if (!staffShifts.Any()) continue;

                var hourlyRate = staff.HourlyRate ?? 0;
                var shiftDetails = new List<ShiftSalaryDetailDto>();

                foreach (var shift in staffShifts)
                {
                    if (!shift.CloseTime.HasValue) continue;

                    var hours = (shift.CloseTime.Value - shift.OpenTime).TotalHours;
                    if (hours <= 0) continue;

                    // Kiểm tra ngày lễ
                    var holiday = holidays.FirstOrDefault(h => h.Date.Date == shift.OpenTime.Date);
                    var multiplier = holiday?.SalaryMultiplier ?? 1.0m;
                    var salary = (decimal)hours * hourlyRate * multiplier;

                    shiftDetails.Add(new ShiftSalaryDetailDto
                    {
                        ShiftId = shift.Id,
                        ShiftType = shift.ShiftType,
                        OpenTime = shift.OpenTime,
                        CloseTime = shift.CloseTime.Value,
                        Hours = Math.Round(hours, 2),
                        HourlyRate = hourlyRate,
                        Multiplier = multiplier,
                        HolidayName = holiday?.Name,
                        Salary = Math.Round(salary, 0)
                    });
                }

                if (!shiftDetails.Any()) continue;

                staffSalaries.Add(new StaffSalaryDto
                {
                    UserId = staff.Id,
                    FullName = staff.FullName,
                    Role = staff.Role,
                    HourlyRate = hourlyRate,
                    TotalShifts = shiftDetails.Count,
                    TotalHours = Math.Round(shiftDetails.Sum(s => s.Hours), 2),
                    TotalSalary = shiftDetails.Sum(s => s.Salary),
                    Shifts = shiftDetails.OrderBy(s => s.OpenTime).ToList()
                });
            }

            return new MonthlySalaryDto
            {
                Month = month,
                Year = year,
                TotalPayout = staffSalaries.Sum(s => s.TotalSalary),
                Staffs = staffSalaries.OrderBy(s => s.FullName).ToList()
            };
        }

        public async Task<StaffSalaryDto?> GetStaffSalaryAsync(int userId, int month, int year)
        {
            var result = await GetMonthlySalaryAsync(month, year);
            return result.Staffs.FirstOrDefault(s => s.UserId == userId);
        }
    }
}
