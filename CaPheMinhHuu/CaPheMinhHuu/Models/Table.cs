namespace CaPheMinhHuu.Models
{
    public class Table : BaseEntity
    {
        public int Number { get; set; }
        public string Area { get; set; } = null!; // Tầng 1, Sân vườn, Tầng 2
        public int Seats { get; set; }
        public string Status { get; set; } = "Empty"; // Empty, Occupied, Reserved
        public string? QRCode { get; set; }
        public int? CurrentOrderId { get; set; }

        // Navigation
        public Order? CurrentOrder { get; set; }
        public int? AreaId { get; set; } // THÊM DÒNG NÀY

        // Navigation
       
    }
}