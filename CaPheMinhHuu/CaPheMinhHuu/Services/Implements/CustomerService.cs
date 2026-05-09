using CaPheMinhHuu.DTOs.Customer;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Services.Implements
{
    public class CustomerService : ICustomerService
    {
        private readonly IUserRepository _userRepo;
        private readonly IOtpService _otpService;
        private readonly IJwtService _jwtService;
        private readonly IGoogleAuthService _googleAuthService;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(
            IUserRepository userRepo,
            IOtpService otpService,
            IJwtService jwtService,
            IGoogleAuthService googleAuthService,
            ILogger<CustomerService> logger)
        {
            _userRepo           = userRepo;
            _otpService         = otpService;
            _jwtService         = jwtService;
            _googleAuthService  = googleAuthService;
            _logger             = logger;
        }

        public async Task SendOtpAsync(string email)
        {
            await _otpService.GenerateOtpAsync(email, "CustomerLogin");
        }

        public async Task<CustomerAuthResponseDto> VerifyOtpAndLoginAsync(CustomerVerifyOtpDto dto)
        {
            var result = await _otpService.VerifyOtpAsync(dto.Email, "CustomerLogin", dto.Code);

            if (result != OtpVerifyResult.Success)
                throw new InvalidOperationException(result.ToString());

            // Tìm user theo email
            var user = await _userRepo.GetByEmailAsync(dto.Email);
            bool isNewUser = false;

            if (user == null && dto.WantRegister)
            {
                // Tạo tài khoản mới
                user = new User
                {
                    Username         = dto.Email,
                    Email            = dto.Email,
                    FullName         = dto.Email.Split('@')[0],
                    Role             = "Customer",
                    AuthProvider     = "OTP",
                    IsEmailVerified  = true,
                    IsActive         = true,
                    IsFirstLogin     = false,
                    PasswordHash     = null
                };
                await _userRepo.AddAsync(user);
                isNewUser = true;
                _logger.LogInformation("New customer registered: {Email}", dto.Email);
            }
            else if (user == null)
            {
                // Guest — không tạo tài khoản
                throw new InvalidOperationException("GuestOnly");
            }

            var token = _jwtService.GenerateAccessToken(user);

            return new CustomerAuthResponseDto
            {
                Token     = token,
                IsNewUser = isNewUser,
                User      = MapToProfileDto(user)
            };
        }

        public async Task<CustomerProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            return user == null ? null : MapToProfileDto(user);
        }

        public async Task<CustomerAuthResponseDto> GoogleLoginAsync(string idToken)
        {
            var payload = await _googleAuthService.ValidateAsync(idToken);

            var user = await _userRepo.GetByGoogleIdAsync(payload.GoogleId);
            bool isNewUser = false;

            if (user == null)
            {
                user = await _userRepo.GetByEmailAsync(payload.Email);
                if (user == null)
                {
                    user = new User
                    {
                        Username        = payload.Email,
                        Email           = payload.Email,
                        FullName        = payload.Name,
                        Avatar          = payload.Picture,
                        GoogleId        = payload.GoogleId,
                        Role            = "Customer",
                        AuthProvider    = "Google",
                        IsEmailVerified = true,
                        IsActive        = true,
                        IsFirstLogin    = false,
                        PasswordHash    = null
                    };
                    await _userRepo.AddAsync(user);
                    isNewUser = true;
                }
                else
                {
                    user.GoogleId    = payload.GoogleId;
                    user.AuthProvider = "Google";
                    await _userRepo.UpdateAsync(user);
                }
            }

            var token = _jwtService.GenerateAccessToken(user);

            return new CustomerAuthResponseDto
            {
                Token     = token,
                IsNewUser = isNewUser,
                User      = MapToProfileDto(user)
            };
        }

        private static CustomerProfileDto MapToProfileDto(User user) => new()
        {
            Id            = user.Id,
            Email         = user.Email ?? "",
            FullName      = user.FullName,
            Phone         = user.Phone,
            Avatar        = user.Avatar,
            LoyaltyPoints = user.LoyaltyPoints,
            DateOfBirth   = user.DateOfBirth
        };
    }
}
