using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace CaPheMinhHuu.Models
{
    [Table("AuditLogs")]
    public class AuditLog
    {
        [Key] public int Id { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string? UserId { get; set; }           // Ai thực hiện
        public string? Username { get; set; }          // Username người thực hiện
        public string Action { get; set; } = null!;    // POST, PUT, DELETE
        public string Endpoint { get; set; } = null!;  // /api/Product/5
        public string? IpAddress { get; set; }         // IP nguồn
        public int StatusCode { get; set; }            // 200, 400, 401...
        public string? RequestBody { get; set; }       // Body gửi lên (tóm tắt)
        public string? UserAgent { get; set; }         // Trình duyệt/thiết bị
    }
}