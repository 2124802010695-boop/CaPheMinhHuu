using System.ComponentModel.DataAnnotations;
namespace CaPheMinhHuu.DTOs.Auth
{
    public class AdminLoginRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        [StringLength(50)]
        public string Username { get; set; } = null!;
        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [StringLength(100)]
        public string Password { get; set; } = null!;
        public bool RememberMe { get; set; } = false;
    }
}