using CaPheMinhHuu.DTOs.Dashboard;

namespace CaPheMinhHuu.Interfaces
{
    public interface IDashboardRepository
    {
        // Tổng doanh thu trong khoảng ngày (bỏ qua Cancelled)
        Task<decimal> GetRevenueSumAsync(DateTime from, DateTime to);

        // Số đơn hàng trong khoảng ngày (bỏ qua Cancelled)
        Task<int> GetOrderCountAsync(DateTime from, DateTime to);

        // Số đơn đang Pending (real-time)
        Task<int> GetPendingOrderCountAsync();

        // Nguyên liệu tồn kho thấp hơn MinStock
        Task<List<LowStockItemDto>> GetLowStockItemsAsync();

        // Top 5 sản phẩm bán chạy trong tháng
        Task<List<TopProductDto>> GetTopProductsAsync(DateTime from, DateTime to, int take = 5);

        // Doanh thu theo ngày (cho biểu đồ N ngày)
        Task<List<RevenueByDayDto>> GetRevenueByDayAsync(DateTime from, DateTime to);

        

        
        Task<List<RevenueByHourDto>> GetRevenueByHourAsync(DateTime date);

      
        Task<List<StaffShiftSummaryDto>> GetStaffShiftSummaryAsync(int month, int year);

      
        Task<double> GetAvgOrderProcessingMinutesAsync(DateTime from, DateTime to);

        
        Task<decimal> GetCancellationRateAsync(DateTime from, DateTime to);
        Task<List<RevenueByPaymentMethodDto>> GetRevenueByPaymentMethodAsync(DateTime from, DateTime to);
        Task<List<TopToppingDto>> GetTopToppingsAsync(DateTime from, DateTime to, int take = 5);

        // D3 — WACC per ingredient
        Task<List<IngredientWaccDto>> GetIngredientWaccAsync(int? ingredientId = null);

        // D4 — Variance report
        Task<List<IngredientVarianceDto>> GetIngredientVarianceAsync(DateTime from, DateTime to);

        // D5 — Order count by status breakdown
        Task<Dictionary<string, int>> GetOrderCountByStatusAsync(DateTime from, DateTime to);

        // D6 — Revenue by category
        Task<List<RevenueByCategoryDto>> GetRevenueByCategoryAsync(DateTime from, DateTime to);

        // D7 — New customer count in period
        Task<int> GetNewCustomerCountAsync(DateTime from, DateTime to);

        // D8 — Coupon usage count in period
        Task<int> GetCouponUsedCountAsync(DateTime from, DateTime to);

        // D9 — Staff shift summary by date range (thay thế month/year version)
        Task<List<StaffShiftSummaryDto>> GetStaffShiftSummaryByRangeAsync(DateTime from, DateTime to);
    }
}
