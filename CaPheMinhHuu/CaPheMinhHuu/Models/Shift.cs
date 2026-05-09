using System.ComponentModel.DataAnnotations.Schema;
namespace CaPheMinhHuu.Models
{
    public class Shift : BaseEntity
    {
        public int UserId { get; set; }       // Cashier
        public int? AdminId { get; set; }     // Admin xác nhận quỹ (null khi PendingOpen)
        public DateTime OpenTime { get; set; }
        public DateTime? CloseTime { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal OpeningCash { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal? ClosingCash { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal? Difference { get; set; }
        public int? TotalOrders { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal? TotalRevenue { get; set; }
        // PendingOpen, Open, Closed, Rejected
        public string Status { get; set; } = "PendingOpen";
        public string? RejectReason { get; set; }
        // Navigation
        public User? User { get; set; }
        [ForeignKey("AdminId")]
        public User? Admin { get; set; }

        public bool IsLocked { get; set; } = false;
    }
}