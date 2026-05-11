using CaPheMinhHuu.DTOs.Shift;
namespace CaPheMinhHuu.Interfaces
{
    public interface IShiftService
    {
        // === CASHIER ===
        Task<ShiftViewDto> RequestOpenShiftAsync(int cashierId, ShiftOpenDto dto);
        Task<ShiftViewDto> CloseShiftAsync(int shiftId, int cashierId, ShiftCloseDto dto);
        Task<ShiftViewDto?> GetCurrentShiftAsync(int userId);
        Task<ZReportDto> GetZReportAsync(int shiftId, int userId);
        // === ADMIN ===
        Task<ShiftViewDto> ApproveShiftAsync(int shiftId, int adminId);
        Task<ShiftViewDto> RejectShiftAsync(int shiftId, int adminId, string? reason);
        Task<ShiftViewDto> AdminForceCloseShiftAsync(int shiftId, int adminId);
        // ===================== KITCHEN =====================
        Task<ShiftViewDto> KitchenCloseShiftAsync(int shiftId, int kitchenId);
        Task<List<ShiftViewDto>> GetPendingShiftsAsync();
        Task<List<ShiftViewDto>> GetAllShiftsAsync(string? status = null);
        Task<ZReportDto> AdminGetZReportAsync(int shiftId);
    }
}