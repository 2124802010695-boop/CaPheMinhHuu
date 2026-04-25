namespace CaPheMinhHuu.DTOs.Table
{
    public class CreateTableDto
    {
        public int Number { get; set; }
        public int Seats { get; set; }
        public string Area { get; set; } = "Khu vực chung"; // Mặc định nếu không truyền
        public int? AreaId { get; set; }
    }
}
