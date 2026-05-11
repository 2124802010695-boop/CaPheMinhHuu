using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SalaryController : ControllerBase
    {
        private readonly ISalaryService _salaryService;

        public SalaryController(ISalaryService salaryService)
        {
            _salaryService = salaryService;
        }

        // GET: api/Salary?month=5&year=2026
        [HttpGet]
        public async Task<IActionResult> GetMonthlySalary(
            [FromQuery] int month = 0,
            [FromQuery] int year = 0)
        {
            if (month == 0) month = DateTime.Now.Month;
            if (year == 0) year = DateTime.Now.Year;

            if (month < 1 || month > 12)
                return BadRequest(new { message = "Tháng không hợp lệ (1-12)" });
            if (year < 2020 || year > 2100)
                return BadRequest(new { message = "Năm không hợp lệ" });

            var result = await _salaryService.GetMonthlySalaryAsync(month, year);
            return Ok(result);
        }

        // GET: api/Salary/{userId}?month=5&year=2026
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetStaffSalary(
            int userId,
            [FromQuery] int month = 0,
            [FromQuery] int year = 0)
        {
            if (month == 0) month = DateTime.Now.Month;
            if (year == 0) year = DateTime.Now.Year;

            var result = await _salaryService.GetStaffSalaryAsync(userId, month, year);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu lương" });

            return Ok(result);
        }
    }
}
