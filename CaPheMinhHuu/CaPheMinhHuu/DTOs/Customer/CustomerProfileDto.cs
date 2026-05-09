namespace CaPheMinhHuu.DTOs.Customer
{
    public class CustomerProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Avatar { get; set; }
        public int LoyaltyPoints { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}
