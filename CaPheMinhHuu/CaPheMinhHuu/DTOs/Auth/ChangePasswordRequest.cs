using CaPheMinhHuu.Validators;
using System.ComponentModel.DataAnnotations;
namespace CaPheMinhHuu.DTOs.Auth
{
    public class ChangePasswordRequest
    {
        [Required] public string StaffCode { get; set; } = null!;
        [Required] public string OldPassword { get; set; } = null!;
        [Required]
        [PasswordValidation(MinLength = 8)]
        public string NewPassword { get; set; } = null!;
    }
}