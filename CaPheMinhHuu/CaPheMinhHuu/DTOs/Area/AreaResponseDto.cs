namespace CaPheMinhHuu.DTOs.Area
{
    public class AreaResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public int TableCount { get; set; }
    }
}
