using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IInventoryBatchRepository
    {
        Task<IEnumerable<InventoryBatch>> GetAllAsync();
        Task<InventoryBatch?> GetByIdAsync(int id);
        Task<InventoryBatch> AddAsync(InventoryBatch batch);
        Task<InventoryBatch> UpdateAsync(InventoryBatch batch);
        Task<bool> DeleteAsync(int id);

        // Custom method: Lấy tất cả lô hàng của 1 nguyên liệu
        Task<IEnumerable<InventoryBatch>> GetByIngredientIdAsync(int ingredientId);
    }
}