using CaPheMinhHuu.Models;

public class Area : BaseEntity
{
    public string Name { get; set; } = null!; // "Tầng 1", "Tầng 2"
    public string? Description { get; set; }

    // Navigation
    public ICollection<Table> Tables { get; set; } = new List<Table>();
}