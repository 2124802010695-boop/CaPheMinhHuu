using System.ComponentModel.DataAnnotations;
namespace CaPheMinhHuu.DTOs.Auth
{
    public class StaffLoginRequest
    {
        [Required(ErrorMessage = "Mã nhân viên không được để trống")]
        [StringLength(20)]
        public string StaffCode { get; set; } = null!;
        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string Password { get; set; } = null!;
        public bool RememberMe { get; set; } = false;
    }
}