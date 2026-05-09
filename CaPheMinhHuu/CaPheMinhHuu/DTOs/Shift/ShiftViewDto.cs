namespace CaPheMinhHuu.DTOs.Shift
{
    public class ShiftViewDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public DateTime OpenTime { get; set; }
        public DateTime? CloseTime { get; set; }
        public decimal OpeningCash { get; set; }
        public decimal? ClosingCash { get; set; }
        public decimal? Difference { get; set; }
        public int? TotalOrders { get; set; }
        public decimal? TotalRevenue { get; set; }
        public decimal CashRevenue { get; set; }
        public string Status { get; set; } = "Open";
        public int? AdminId { get; set; }
        public string? AdminName { get; set; }
        public string? RejectReason { get; set; }
    }
}