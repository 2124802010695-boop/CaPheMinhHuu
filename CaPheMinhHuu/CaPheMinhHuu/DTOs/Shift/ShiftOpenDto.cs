namespace CaPheMinhHuu.DTOs.Shift
{
    public class ShiftOpenDto
    {
        public decimal OpeningCash { get; set; }
        public string? ShiftType { get; set; } // "Cashier" | "Kitchen" — null thì default "Cashier"
    }
}