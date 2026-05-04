using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        // GET: api/Dashboard/stats?chartDays=7
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] int chartDays = 7)
        {
            var stats = await _dashboardService.GetStatsAsync(chartDays);
            return Ok(stats);
        }
    }
}
