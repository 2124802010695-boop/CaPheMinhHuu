using CaPheMinhHuu.DTOs.Staff;
namespace CaPheMinhHuu.Interfaces
{
    public interface IStaffService
    {
        Task<object> CreateStaffAsync(CreateStaffRequest request);
        Task<List<object>> GetAllStaffAsync();
        Task<object> UpdateStaffAsync(int id, UpdateStaffRequest request);
        Task<object> ToggleActiveAsync(int id);
        Task<object> ResetPasswordAsync(int id);
    }
}