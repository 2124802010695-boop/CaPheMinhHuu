namespace CaPheMinhHuu.DTOs.Table
{
    public class TableResponseDto
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public int? AreaId { get; set; }
        public string? AreaName { get; set; }
        public int? AreaDisplayOrder { get; set; }
        public bool? AreaIsActive { get; set; }
        public int Seats { get; set; }
        public string Status { get; set; } = null!;
        public string? QRCode { get; set; }
        public int? CurrentOrderId { get; set; }
    }
}