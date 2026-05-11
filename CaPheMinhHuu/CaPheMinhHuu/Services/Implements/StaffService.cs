
using CaPheMinhHuu.DTOs.Staff;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;


namespace CaPheMinhHuu.Services.Implements
{
    public class StaffService : IStaffService
    {
        private readonly IUserRepository _userRepository;

        public StaffService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public async Task<object> CreateStaffAsync(CreateStaffRequest request)
        {
            // 1. Kiểm tra Username đã tồn tại chưa
            var exists = await _userRepository.IsUserExistsAsync(request.Username);
            if (exists)
                throw new Exception("Username đã tồn tại trong hệ thống");
            // 2. Kiểm tra Role hợp lệ
            if (request.Role != "Cashier" && request.Role != "Kitchen")
                throw new Exception("Role phải là 'Cashier' hoặc 'Kitchen'");
            // 3. Tạo User mới VỚI MẬT KHẨU ĐÃ BĂM
            var newUser = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password), // ← TỰ ĐỘNG BĂM
                FullName = request.FullName,
                Phone = request.Phone,
                Email = request.Email,
                Role = request.Role,
                Salary = request.Salary,
                SalaryCoefficient = request.SalaryCoefficient,
                HourlyRate = request.HourlyRate,
                IsActive = true,
                IsFirstLogin = true  // Bắt đổi mật khẩu lần đầu
            };
            await _userRepository.AddAsync(newUser);
            // 4. Trả về thông tin (KHÔNG trả PasswordHash)
            return new
            {
                id = newUser.Id,
                username = newUser.Username,
                fullName = newUser.FullName,
                role = newUser.Role,
                isFirstLogin = newUser.IsFirstLogin,
                message = "Tạo nhân viên thành công"
            };
        }
        public async Task<List<object>> GetAllStaffAsync()
        {
            var users = await _userRepository.GetStaffListAsync();
            var staffList = users.Select(u => new
            {
                u.Id,
                u.Username,
                u.FullName,
                u.Phone,
                u.Email,
                u.Role,
                u.IsActive,
                u.Salary,
                u.SalaryCoefficient,
                u.HourlyRate,
                u.LastLoginAt,
                u.CreatedDate
            }).ToList();
            return staffList.Cast<object>().ToList();
        }
        public async Task<object> UpdateStaffAsync(int id, UpdateStaffRequest request)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                throw new Exception("Không tìm thấy nhân viên");
            if (user.Role == "Admin")
                throw new Exception("Không thể sửa thông tin Admin");
            if (request.Role != "Cashier" && request.Role != "Kitchen")
                throw new Exception("Role phải là 'Cashier' hoặc 'Kitchen'");
            user.FullName = request.FullName;
            user.Phone = request.Phone;
            user.Email = request.Email;
            user.Role = request.Role;
            user.Salary = request.Salary;
            user.SalaryCoefficient = request.SalaryCoefficient;
            user.HourlyRate = request.HourlyRate;
            await _userRepository.UpdateAsync(user);
            return new
            {
                id = user.Id,
                username = user.Username,
                fullName = user.FullName,
                role = user.Role,
                isActive = user.IsActive,
                message = "Cập nhật thành công"
            };
        }
        public async Task<object> ToggleActiveAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                throw new Exception("Không tìm thấy nhân viên");
            if (user.Role == "Admin")
                throw new Exception("Không thể vô hiệu hóa Admin");
            user.IsActive = !user.IsActive;
            if (user.IsActive)
            {
                user.LockedUntil = null;
                user.FailedLoginAttempts = 0;
            }
            await _userRepository.UpdateAsync(user);
            return new
            {
                id = user.Id,
                username = user.Username,
                isActive = user.IsActive,
                message = user.IsActive ? "Đã kích hoạt nhân viên" : "Đã vô hiệu hóa nhân viên"
            };
        }
        public async Task<object> ResetPasswordAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                throw new Exception("Không tìm thấy nhân viên");
            if (user.Role == "Admin")
                throw new Exception("Không thể reset mật khẩu Admin");
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.Username);
            user.IsFirstLogin = true;
            user.FailedLoginAttempts = 0;
            user.LockedUntil = null;
            await _userRepository.UpdateAsync(user);
            return new
            {
                id = user.Id,
                username = user.Username,
                message = $"Đã reset mật khẩu về mặc định ({user.Username}). Nhân viên sẽ phải đổi mật khẩu khi đăng nhập."
            };
        }
    }
}