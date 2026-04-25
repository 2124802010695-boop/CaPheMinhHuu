using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CaPheMinhHuu.Models
{
    public class Product : BaseEntity
    {
        

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public string? Unit { get; set; } // ĐVT: Ly, Chai, Dĩa

        public string? ImageUrl { get; set; } // Link ảnh món ăn

        // QUAN TRỌNG CHO KDS & BAR:
        public int PreparationTime { get; set; } = 5; // Thời gian pha chế (phút)

        public bool IsActive { get; set; } = true; // Còn bán hay ngừng bán

        // Foreign Key: Thuộc nhóm nào
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }
        public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
    }
}