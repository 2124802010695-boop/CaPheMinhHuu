namespace CaPheMinhHuu.DTOs.Dashboard
{
    public class RevenueByCategoryDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }
}
