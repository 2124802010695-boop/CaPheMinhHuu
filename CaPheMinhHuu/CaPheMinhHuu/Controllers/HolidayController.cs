using CaPheMinhHuu.Data;
using CaPheMinhHuu.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class HolidayController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HolidayController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetAdminId()
        {
            var claim = _httpContextAccessor.HttpContext?.User.FindFirst("id")?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        // GET: api/Holiday
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.HolidayConfigs
                .OrderByDescending(h => h.Date)
                .Select(h => new {
                    h.Id, h.Date, h.Name, h.SalaryMultiplier, h.IsActive, h.CreatedAt
                })
                .ToListAsync();
            return Ok(list);
        }

        // POST: api/Holiday
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] HolidayCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Tên ngày lễ không được để trống" });
            if (dto.SalaryMultiplier < 1)
                return BadRequest(new { message = "Hệ số phải >= 1" });

            var existing = await _context.HolidayConfigs
                .FirstOrDefaultAsync(h => h.Date.Date == dto.Date.Date);
            if (existing != null)
                return BadRequest(new { message = "Ngày này đã có cấu hình" });

            var holiday = new HolidayConfig
            {
                Date = dto.Date.ToLocalTime().Date,
                Name = dto.Name.Trim(),
                SalaryMultiplier = dto.SalaryMultiplier,
                IsActive = true,
                CreatedBy = GetAdminId(),
                CreatedAt = DateTime.Now
            };
            _context.HolidayConfigs.Add(holiday);
            await _context.SaveChangesAsync();
            return Ok(new { holiday.Id, holiday.Date, holiday.Name, holiday.SalaryMultiplier, holiday.IsActive });
        }

        // PATCH: api/Holiday/{id}/toggle
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> Toggle(int id)
        {
            var holiday = await _context.HolidayConfigs.FindAsync(id);
            if (holiday == null) return NotFound(new { message = "Không tìm thấy" });
            holiday.IsActive = !holiday.IsActive;
            await _context.SaveChangesAsync();
            return Ok(new { holiday.Id, holiday.IsActive });
        }

        // DELETE: api/Holiday/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var holiday = await _context.HolidayConfigs.FindAsync(id);
            if (holiday == null) return NotFound(new { message = "Không tìm thấy" });
            _context.HolidayConfigs.Remove(holiday);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa" });
        }
    }

    public class HolidayCreateDto
    {
        public DateTime Date { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal SalaryMultiplier { get; set; } = 2.0m;
    }
}
