namespace CaPheMinhHuu.Models
{
    /// <summary>
    /// BOM Version — snapshot toàn bộ công thức tại một thời điểm.
    /// Immutable sau khi đóng (IsCurrent = false).
    /// Tạo tự động khi Add/Delete ingredient trong Recipe.
    /// </summary>
    public class RecipeVersion : BaseEntity
    {
        public int ProductId { get; set; }
        public Product? Product { get; set; }

        public int VersionNumber { get; set; }

        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }   // null = đang active

        public bool IsCurrent { get; set; } = true;

        public string? ChangedBy { get; set; }       // username admin
        public string? ChangeReason { get; set; }    // lý do thay đổi

        public ICollection<RecipeVersionLine> Lines { get; set; } = new List<RecipeVersionLine>();
    }
}
