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
    }
}
