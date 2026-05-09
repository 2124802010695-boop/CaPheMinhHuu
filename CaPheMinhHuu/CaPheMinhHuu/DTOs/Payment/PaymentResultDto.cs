namespace CaPheMinhHuu.DTOs.Payment
{
    public class PaymentResultDto
    {
        public bool IsSuccess { get; set; }
        public string OrderCode { get; set; } = null!;
        public string TransactionId { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Message { get; set; } = null!;
    }
}
