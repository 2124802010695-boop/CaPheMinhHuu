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

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] int chartDays = 7)
        {
            var stats = await _dashboardService.GetStatsAsync(chartDays);
            return Ok(stats);
        }

        [HttpGet("stats/range")]
        public async Task<IActionResult> GetRangeStats(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to)
        {
            if (from > to) return BadRequest("from phải nhỏ hơn hoặc bằng to");
            var stats = await _dashboardService.GetRangeStatsAsync(from, to);
            return Ok(stats);
        }

        // D3 — WACC toàn bộ ingredients
        [HttpGet("ingredient-wacc")]
        public async Task<IActionResult> GetIngredientWacc()
        {
            var result = await _dashboardService.GetIngredientWaccAsync();
            return Ok(result);
        }

        // D3 — WACC 1 ingredient cụ thể
        [HttpGet("ingredient-wacc/{ingredientId}")]
        public async Task<IActionResult> GetIngredientWaccById(int ingredientId)
        {
            var result = await _dashboardService.GetIngredientWaccAsync(ingredientId);
            if (!result.Any()) return NotFound($"Không tìm thấy nguyên liệu ID {ingredientId}");
            return Ok(result.First());
        }

        // D4 — Variance report
        [HttpGet("ingredient-variance")]
        public async Task<IActionResult> GetIngredientVariance(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to)
        {
            if (from > to) return BadRequest("from phải nhỏ hơn hoặc bằng to");
            var result = await _dashboardService.GetIngredientVarianceAsync(from, to);
            return Ok(result);
        }
    }
}
