namespace CaPheMinhHuu.DTOs.Table
{
    public class UpdateTableDto
    {
        public int Number { get; set; }
        public int Seats { get; set; }
        public string? Status { get; set; } // Empty, Occupied, Reserved — nullable: chỉ update nếu client gửi
        public int? AreaId { get; set; }
    }
}
