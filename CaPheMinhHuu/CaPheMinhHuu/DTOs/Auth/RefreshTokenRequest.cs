using System.ComponentModel.DataAnnotations;
namespace CaPheMinhHuu.DTOs.Auth
{
    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = null!;
    }
}