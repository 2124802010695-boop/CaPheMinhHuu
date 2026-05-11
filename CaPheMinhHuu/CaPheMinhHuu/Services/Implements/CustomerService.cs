using CaPheMinhHuu.DTOs.Customer;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using CaPheMinhHuu.Data;
namespace CaPheMinhHuu.Services.Implements
{
    public class CustomerService : ICustomerService
    {
        private readonly IUserRepository _userRepo;
        private readonly IOtpService _otpService;
        private readonly IJwtService _jwtService;
        private readonly IGoogleAuthService _googleAuthService;
        private readonly IUserCouponRepository _userCouponRepo;
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(
            IUserRepository userRepo,
            IOtpService otpService,
            IJwtService jwtService,
            IGoogleAuthService googleAuthService,
            IUserCouponRepository userCouponRepo,
            IEmailService emailService,
            ApplicationDbContext context,
            ILogger<CustomerService> logger)
        {
            _userRepo          = userRepo;
            _otpService        = otpService;
            _jwtService        = jwtService;
            _googleAuthService = googleAuthService;
            _userCouponRepo    = userCouponRepo;
            _emailService      = emailService;
            _context           = context;
            _logger            = logger;
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

            var user = await _userRepo.GetByEmailAsync(dto.Email);
            bool isNewUser = false;
            string? voucherCode = null;

            if (user == null && dto.WantRegister)
            {
                // Tạo tài khoản Customer mới
                user = new User
                {
                    Username        = dto.Email,
                    Email           = dto.Email,
                    FullName        = dto.Email.Split('@')[0],
                    Role            = "Customer",
                    AuthProvider    = "OTP",
                    IsEmailVerified = true,
                    IsActive        = true,
                    IsFirstLogin    = false,
                    PasswordHash    = null
                };
                await _userRepo.AddAsync(user);
                isNewUser = true;

                // Tạo voucher welcome 50%
                voucherCode = $"WELCOME{user.Id}";
                var coupon = new Coupon
                {
                    Code             = voucherCode,
                    Description      = "Chào mừng khách hàng mới — Giảm 50% đơn đầu tiên",
                    DiscountType     = "Percent",
                    DiscountValue    = 50,
                    MaxDiscountAmount = 50000,
                    MinOrderAmount   = 0,
                    MaxUsage         = 1,
                    UsedCount        = 0,
                    StartDate        = DateTime.UtcNow,
                    EndDate          = DateTime.UtcNow.AddDays(30),
                    IsActive         = true
                };
                // Lưu Coupon qua DbContext trực tiếp — CustomerService là ngoại lệ inject DbContext
                await _context.Coupons.AddAsync(coupon);
                await _context.SaveChangesAsync();
                await _userCouponRepo.AddAsync(new UserCoupon
                {
                    UserId   = user.Id,
                    CouponId = coupon.Id,
                    IsUsed   = false
                });

                // Gửi email chào mừng kèm voucher
                await _emailService.SendWelcomeVoucherAsync(user.Email!, user.FullName, voucherCode);
                _logger.LogInformation("New customer registered: {Email}, voucher: {Code}", dto.Email, voucherCode);
            }
            else if (user == null)
            {
                // Guest — xác thực email xong, trả IsGuest = true
                var guestToken = _jwtService.GenerateGuestToken(dto.Email);
                return new CustomerAuthResponseDto
                {
                    Token   = guestToken,
                    IsGuest = true,
                    User    = new CustomerProfileDto
                    {
                        Email    = dto.Email,
                        FullName = "Khách"
                    }
                };
            }

            var token = _jwtService.GenerateAccessToken(user);
            return new CustomerAuthResponseDto
            {
                Token      = token,
                IsNewUser  = isNewUser,
                VoucherCode = voucherCode,
                User       = MapToProfileDto(user)
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
