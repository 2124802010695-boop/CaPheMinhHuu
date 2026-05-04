namespace CaPheMinhHuu.Models
{
    public class Coupon : BaseEntity
    {
        public string Code { get; set; } = null!;           // VD: "WELCOME10", "SUMMER2026"
        public string Description { get; set; } = "";
        public string DiscountType { get; set; } = "Percent"; // Percent, Fixed
        public decimal DiscountValue { get; set; }            // 10 (=10%) hoặc 20000 (=20k)
        public decimal? MinOrderAmount { get; set; }          // Đơn tối thiểu
        public decimal? MaxDiscountAmount { get; set; }       // Giảm tối đa (cho %)
        public int MaxUsage { get; set; } = 100;              // Tổng số lần dùng
        public int UsedCount { get; set; } = 0;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
