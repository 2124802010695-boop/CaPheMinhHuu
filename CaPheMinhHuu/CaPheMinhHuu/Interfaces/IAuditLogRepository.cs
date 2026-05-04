using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IAuditLogRepository
    {
        // Ghi 1 bản ghi audit log (POST/PUT/DELETE actions)
        Task AddAsync(AuditLog log);
    }
}
