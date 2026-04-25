using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class IngredientUnit : BaseEntity
{
    
    

    public int IngredientId { get; set; }
    [ForeignKey("IngredientId")]
    public Ingredient? Ingredient { get; set; }

    [Required]
    [MaxLength(50)]
    public string UnitName { get; set; } = string.Empty;

    [Precision(18, 3)]
    public decimal ConversionRate { get; set; }

    public bool IsBaseUnit { get; set; } = false;
}