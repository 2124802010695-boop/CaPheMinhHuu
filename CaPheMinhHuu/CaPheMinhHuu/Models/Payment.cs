namespace CaPheMinhHuu.Models
{
    public class Payment : BaseEntity
    {
        public int OrderId { get; set; }
        public string Method { get; set; } = "Cash";        // Cash, VNPAY, Transfer
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Pending";     // Pending, Success, Failed, Refunded
        public string? TransactionId { get; set; }           // Mã giao dịch VNPAY
        public string? BankCode { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? CallbackData { get; set; }            // JSON raw từ VNPAY
                                                             // Navigation
        public Order? Order { get; set; }
    }
}
