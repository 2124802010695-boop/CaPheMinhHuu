namespace CaPheMinhHuu.Models
{
    public class Table : BaseEntity
    {
        public int Number { get; set; }
        public int Seats { get; set; }
        public string Status { get; set; } = "Empty"; // Empty, Occupied, Reserved
        public string? QRCode { get; set; }
        public int? AreaId { get; set; }

        // Navigation
        public Area? AreaNavigation { get; set; }
    }
}
