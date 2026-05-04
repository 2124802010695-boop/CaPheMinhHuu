namespace CaPheMinhHuu.Models
{
    public class Reservation : BaseEntity
    {
        public int TableId { get; set; }
        public string CustomerName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? Email { get; set; }
        public int GuestCount { get; set; }
        public DateTime ReservationTime { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, Completed
        public string? Note { get; set; }
        // Navigation
        public Table? Table { get; set; }
    }
}
