namespace CaPheMinhHuu.DTOs.Payment
{
    public class SepayWebhookDto
    {
        public string? Gateway { get; set; }
        public string? TransactionDate { get; set; }
        public string? AccountNumber { get; set; }
        public string? Content { get; set; }
        public decimal TransferAmount { get; set; }
        public string? ReferenceCode { get; set; }
        public string? Description { get; set; }
    }
}
