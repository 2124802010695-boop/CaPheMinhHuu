using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.Models
{
    public class Category : BaseEntity
    {
        

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty; // VD: Cà phê, Trà sữa

        public string? Description { get; set; }

        // Relationship: Một danh mục có nhiều sản phẩm
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}