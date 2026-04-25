namespace CaPheMinhHuu.Models
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }  //
        // Mọi bảng đều cần CreatedDate và UpdatedDate
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }

        // Soft Delete (Xóa mềm): Không xóa thật, chỉ đánh dấu là đã xóa
        public bool IsDeleted { get; set; } = false;
    }
}