
using CaPheMinhHuu.DTOs.Auth;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models; // Đảm bảo có dòng này

using Microsoft.Extensions.Logging;


namespace CaPheMinhHuu.Services.Implements
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;

        private readonly IRefreshTokenRepository _refreshTokenRepo;
        private readonly ILoginHistoryRepository _loginHistoryRepo;
        private readonly ILogger<AuthService> _logger;
        private readonly IJwtService _jwtService;
        private readonly IShiftRepository _shiftRepository;

        public AuthService(IUserRepository userRepository, IRefreshTokenRepository refreshTokenRepo, ILoginHistoryRepository loginHistoryRepo, ILogger<AuthService> logger, IJwtService jwtService, IShiftRepository shiftRepository)
        {
            _userRepository = userRepository;
            _refreshTokenRepo = refreshTokenRepo;
            _loginHistoryRepo = loginHistoryRepo;
            _logger = logger;
            _jwtService = jwtService;
            _shiftRepository = shiftRepository;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            // 1. Tìm user
            var user = await _userRepository.GetUserByUsernameAsync(request.Username);

            // 2. Kiểm tra tồn tại
            if (user == null) return null;

            // 3. Kiểm tra password bằng BCrypt
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) return null;

            // 4. Tạo token
            var token = _jwtService.GenerateAccessToken(user);
            var ipAddress = ""; // Sẽ được truyền từ Controller sau
            var refreshToken = GenerateRefreshToken(user.Id, ipAddress);
            await _refreshTokenRepo.AddAsync(refreshToken);

            return new LoginResponse
            {
                RefreshToken = refreshToken.Token,
                Success = true,
                Token = token,
                User = new UserInfo
                {
                    Id = user.Id,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role,
                    Avatar = user.Avatar
                }
            };
        }



        public async Task<LoginResponse?> AdminLoginAsync(AdminLoginRequest request)
        {
            // 1. Tìm user theo Username
            var user = await _userRepository.GetUserByUsernameAsync(request.Username);

            if (user == null)
                return null;

            // 2. Kiểm tra Role = Admin
            if (user.Role != "Admin")
                return null;

            // 3. Kiểm tra IsActive
            if (!user.IsActive)
                return null;

            // 4. Kiểm tra LockedUntil
            if (user.LockedUntil.HasValue && user.LockedUntil > DateTime.Now)
                return null;

            // 5. Verify password bằng BCrypt
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                // Tăng FailedLoginAttempts
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.IsActive = false;
                    user.LockedUntil = DateTime.Now.AddMinutes(15);
                    _logger.LogWarning("Admin LOCKED: {Username}, attempts: {Count}", user.Username, user.FailedLoginAttempts);
                }
                else
                {
                    _logger.LogWarning("Admin login FAIL: {Username}, attempts: {Count}", user.Username, user.FailedLoginAttempts);
                }
                await _userRepository.UpdateAsync(user);
                return null;
            }

            // 6. Reset FailedLoginAttempts
            user.FailedLoginAttempts = 0;
            user.LastLoginAt = DateTime.Now;
            await _userRepository.SaveChangesAsync();
            _logger.LogInformation("Admin login OK: {Username}", user.Username);

            // 7. Tạo JWT Token
            var token = _jwtService.GenerateAccessToken(user);
            var ipAddress = ""; // Sẽ được truyền từ Controller sau
            var refreshToken = GenerateRefreshToken(user.Id, ipAddress);
            await _refreshTokenRepo.AddAsync(refreshToken);
            // 8. Return response
            return new LoginResponse
            {
                RefreshToken = refreshToken.Token,
                Success = true,
                Token = token,
                User = new UserInfo
                {
                    Id = user.Id,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role,
                    Avatar = user.Avatar
                }
            };
        }
        public async Task<LoginResponse?> StaffLoginAsync(StaffLoginRequest request)
        {
            // 1. Tìm user theo Username (StaffCode chính là Username)
            var user = await _userRepository.GetUserByUsernameAsync(request.StaffCode);
            if (user == null) return null;
            // 2. Kiểm tra Role phải là Cashier hoặc Kitchen
            if (user.Role != "Cashier" && user.Role != "Kitchen")
                return null;
            // 3. Kiểm tra IsActive
            if (!user.IsActive) return null;
            // 4. Kiểm tra LockedUntil
            if (user.LockedUntil.HasValue && user.LockedUntil > DateTime.Now)
                return null;
            // 5. Verify password bằng BCrypt
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.IsActive = false;
                    user.LockedUntil = DateTime.Now.AddMinutes(15);
                    _logger.LogWarning("Staff LOCKED: {StaffCode}, attempts: {Count}", request.StaffCode, user.FailedLoginAttempts);
                }
                else
                {
                    _logger.LogWarning("Staff login FAIL: {StaffCode}, attempts: {Count}", request.StaffCode, user.FailedLoginAttempts);
                }
                await _userRepository.SaveChangesAsync();
                return null;
            }
            // 6. Reset FailedLoginAttempts
            user.FailedLoginAttempts = 0;
            user.LastLoginAt = DateTime.Now;
            await _userRepository.SaveChangesAsync();
            _logger.LogInformation("Staff login OK: {StaffCode}, Role: {Role}", request.StaffCode, user.Role);
            // 7. Tạo JWT Token — gắn ShiftId nếu có ca đang mở
            int? currentShiftId = null;
            if (user.Role == "Cashier" || user.Role == "Kitchen")
            {
                var openShift = await _shiftRepository.GetOpenShiftByUserAsync(user.Id);
                if (openShift != null)
                    currentShiftId = openShift.Id;
            }
            var token = _jwtService.GenerateAccessToken(user, currentShiftId);
            var ipAddress = ""; // Sẽ được truyền từ Controller sau
            var refreshToken = GenerateRefreshToken(user.Id, ipAddress);
            await _refreshTokenRepo.AddAsync(refreshToken);
            // 8. Return response
            return new LoginResponse
            {
                RefreshToken = refreshToken.Token,
                Success = true,
                Token = token,
                IsFirstLogin = user.IsFirstLogin,
                User = new UserInfo
                {
                    Id = user.Id,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role,
                    Phone = user.Phone,
                    Avatar = user.Avatar
                }
            };
        }
        public async Task<bool> ChangePasswordAsync(string staffCode, string oldPassword, string newPassword)
        {
            var user = await _userRepository.GetUserByUsernameAsync(staffCode);
            if (user == null) return false;
            // Verify mật khẩu cũ
            if (!BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash))
                return false;
            // Băm mật khẩu mới
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.IsFirstLogin = false; // Đã đổi mật khẩu lần đầu
            await _userRepository.SaveChangesAsync();
            _logger.LogInformation("Password changed: {StaffCode}", staffCode);
            return true;
        }
        public async Task<bool> RecordLoginHistoryAsync(int userId, string portal, string status, string? ipAddress, string? userAgent, string? failReason = null)
        {
            var loginHistory = new LoginHistory
            {
                UserId = userId,
                Portal = portal,
                LoginTime = DateTime.Now,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Status = status,
                FailReason = failReason
            };
            await _loginHistoryRepo.AddAsync(loginHistory);
            return true;
        }
        // ===== REFRESH TOKEN METHODS =====
// Helper: Tạo Refresh Token mới
private RefreshToken GenerateRefreshToken(int userId, string? ipAddress)
        {
            return new RefreshToken
            {
                Token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64)),
                UserId = userId,
                ExpiresAt = DateTime.UtcNow.AddDays(7),  // Refresh Token sống 7 ngày
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = ipAddress
            };
        }
        // Public: Refresh Token → Trả về Access Token mới + Refresh Token mới 
        public async Task<LoginResponse?> RefreshTokenAsync(string refreshToken, string? ipAddress)
        {
            // 1. Tìm Refresh Token trong DB
            var existingToken = await _refreshTokenRepo.GetActiveByTokenAsync(refreshToken);
            if (existingToken == null) return null;
            // 2. Kiểm tra token còn active không
            if (!existingToken.IsActive) return null;
            // 3. Thu hồi token cũ
            existingToken.RevokedAt = DateTime.UtcNow;
            existingToken.RevokedByIp = ipAddress;
            // 4. Tạo Refresh Token mới (Rotation)
            var newRefreshToken = GenerateRefreshToken(existingToken.UserId, ipAddress);
            existingToken.ReplacedByToken = newRefreshToken.Token;
            await _refreshTokenRepo.AddAsync(newRefreshToken);
            // 5. Tạo Access Token mới
            var newAccessToken = _jwtService.GenerateAccessToken(existingToken.User);
            await _refreshTokenRepo.SaveChangesAsync();
            // 6. Trả response
            return new LoginResponse
            {
                Success = true,
                Token = newAccessToken,
                RefreshToken = newRefreshToken.Token,
                User = new UserInfo
                {
                    Id = existingToken.User.Id,
                    Username = existingToken.User.Username,
                    FullName = existingToken.User.FullName,
                    Role = existingToken.User.Role,
                    Avatar = existingToken.User.Avatar
                }
            };
        }
        // Public: Thu hồi Refresh Token (Logout)
        public async Task<bool> RevokeTokenAsync(string refreshToken, string? ipAddress)
        {
            var existingToken = await _refreshTokenRepo.GetByTokenAsync(refreshToken);
            if (existingToken == null || !existingToken.IsActive) return false;
            existingToken.RevokedAt = DateTime.UtcNow;
            existingToken.RevokedByIp = ipAddress;
            await _refreshTokenRepo.SaveChangesAsync();
            _logger.LogInformation("Token revoked — UserId: {UserId}, IP: {IP}", existingToken.UserId, ipAddress);
            return true;
        }
    }
}