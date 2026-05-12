using CaPheMinhHuu.DTOs.Dashboard;
namespace CaPheMinhHuu.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetStatsAsync(string period = "today", int chartDays = 7);
        Task<RangeDashboardStatsDto> GetRangeStatsAsync(DateTime from, DateTime to);

        // D3 — WACC per ingredient
        Task<List<IngredientWaccDto>> GetIngredientWaccAsync(int? ingredientId = null);

        // D4 — Variance report
        Task<List<IngredientVarianceDto>> GetIngredientVarianceAsync(DateTime from, DateTime to);
    }
}
