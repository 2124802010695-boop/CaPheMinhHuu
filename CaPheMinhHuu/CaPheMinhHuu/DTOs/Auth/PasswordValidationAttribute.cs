using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
namespace CaPheMinhHuu.Validators
{
    public class PasswordValidationAttribute : ValidationAttribute
    {
        public int MinLength { get; set; } = 8;
        protected override ValidationResult? IsValid(object? value, ValidationContext context)
        {
            if (value is not string password) return ValidationResult.Success;
            if (password.Length < MinLength)
                return new ValidationResult($"Mật khẩu phải có ít nhất {MinLength} ký tự");
            if (!Regex.IsMatch(password, @"[A-Z]"))
                return new ValidationResult("Mật khẩu phải có ít nhất 1 chữ in hoa");
            if (!Regex.IsMatch(password, @"[a-z]"))
                return new ValidationResult("Mật khẩu phải có ít nhất 1 chữ thường");
            if (!Regex.IsMatch(password, @"[0-9]"))
                return new ValidationResult("Mật khẩu phải có ít nhất 1 chữ số");
            if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]"))
                return new ValidationResult("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
            return ValidationResult.Success;
        }
    }
}