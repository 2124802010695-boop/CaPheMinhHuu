namespace CaPheMinhHuu.DTOs.Table
{
    public class UpdateTableDto
    {
        public int Number { get; set; }
        public int Seats { get; set; }
        public string Status { get; set; } = null!; // Empty, Occupied, Reserved
        public int? AreaId { get; set; }
    }
}
