namespace CaPheMinhHuu.DTOs.Product
{
    public class ProductUpdateDto
    {
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public string? Description { get; set; }
        public int PreparationTime { get; set; } = 5;
        public string? ImageUrl { get; set; }
        public IFormFile? ImageFile { get; set; }
    }
}