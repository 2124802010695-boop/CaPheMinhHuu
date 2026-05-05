using System.ComponentModel.DataAnnotations;

namespace CaPheMinhHuu.DTOs.Area
{
    public class AreaCreateDto
    {
        [Required(ErrorMessage = "Tên khu vực không được để trống")]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public int DisplayOrder { get; set; } = 0;
    }
}
