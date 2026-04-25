using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Ingredient : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty; // Khởi tạo mặc định để tránh null

    [MaxLength(50)]
    public string? SKU { get; set; }

    [Required]
    [MaxLength(20)]
    public string BaseUnit { get; set; } = string.Empty;

    public int IngredientCategoryId { get; set; }
    [ForeignKey("IngredientCategoryId")]
    public IngredientCategory? IngredientCategory { get; set; }

    [Precision(18, 3)]
    public decimal MinStock { get; set; } = 0;

    [Precision(18, 3)]
    public decimal MaxStock { get; set; } = 0;

    public int DefaultShelfLifeDays { get; set; } = 0;

   

    // Khởi tạo List rỗng để tránh null
    public ICollection<IngredientUnit> Units { get; set; } = new List<IngredientUnit>();
    public ICollection<InventoryBatch> Batches { get; set; } = new List<InventoryBatch>();
}