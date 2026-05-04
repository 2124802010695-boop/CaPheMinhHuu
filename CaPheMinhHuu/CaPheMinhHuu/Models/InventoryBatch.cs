using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Index(nameof(BatchCode), IsUnique = true)]
public class InventoryBatch : BaseEntity
{
    [Timestamp]                                                    
    public byte[] RowVersion { get; set; } = null!;
    public int IngredientId { get; set; }
    [ForeignKey("IngredientId")]
    public Ingredient? Ingredient { get; set; }

    public int? LocationId { get; set; }

    [Required]
    [MaxLength(50)]
    public string BatchCode { get; set; } = string.Empty;

    [Precision(18, 3)]
    public decimal CurrentQuantity { get; set; }

    [Precision(18, 3)]
    public decimal InitialQuantity { get; set; }

    [Precision(18, 2)]
    public decimal ImportPricePerBaseUnit { get; set; }

    public DateTime ImportDate { get; set; }
    public DateTime? ManufactureDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CreatedBy { get; set; }


}