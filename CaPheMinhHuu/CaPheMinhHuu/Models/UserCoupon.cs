using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    public class UserCoupon : BaseEntity
    {
        public int UserId { get; set; }
        public int CouponId { get; set; }
        public bool IsUsed { get; set; } = false;
        public DateTime? UsedAt { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [ForeignKey("CouponId")]
        public Coupon Coupon { get; set; } = null!;
    }
}
