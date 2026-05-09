namespace CaPheMinhHuu.DTOs.Product
{
    public class ProductViewDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public string? ImageUrl { get; set; }
        public int PreparationTime { get; set; }
        public string CategoryName { get; set; } = string.Empty; // Tên danh mục (thay vì ID)
        public int? CategoryId { get; set; }   // ID danh mục — dùng cho filter POS
        public string? Description { get; set; }
        public bool IsActive { get; set; }     // Còn bán hay hết — dùng cho badge "Hết hàng"
    }
}