namespace CaPheMinhHuu.Models
{
    public class Area : BaseEntity
    {
        public string Name { get; set; } = null!;        // "Tầng 1", "Sân vườn", "VIP"
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;       // Bật/tắt khu vực theo mùa/sự kiện
        public int DisplayOrder { get; set; } = 0;       // Thứ tự hiển thị Tab: 0 → Tầng 1, 1 → Sân vườn...

        // Navigation
        public ICollection<Table> Tables { get; set; } = new List<Table>();
    }
}