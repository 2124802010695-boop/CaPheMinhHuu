using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace CaPheMinhHuu.Interfaces
{
    public interface IInventoryBatchRepository
    {
        Task<IEnumerable<InventoryBatch>> GetAllAsync();
        Task<InventoryBatch?> GetByIdAsync(int id);
        Task<InventoryBatch> AddAsync(InventoryBatch batch);
        Task<InventoryBatch> UpdateAsync(InventoryBatch batch);
        Task<bool> DeleteAsync(int id);
        Task<List<InventoryBatch>> GetAvailableFIFOAsync(int ingredientId);
        Task<decimal> GetTotalStockAsync(int ingredientId);
        Task<IDbContextTransaction> BeginTransactionAsync();

        // Custom method: Lấy tất cả lô hàng của 1 nguyên liệu
        Task<IEnumerable<InventoryBatch>> GetByIngredientIdAsync(int ingredientId);
        Task SaveChangesAsync();
    }
}