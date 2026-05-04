using CaPheMinhHuu.DTOs.Ingredient;
using CaPheMinhHuu.DTOs.Order;
using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Interfaces
{
    public interface IIngredientService
    {
        Task<IEnumerable<IngredientViewDto>> GetAllAsync();
        Task<IngredientViewDto?> GetByIdAsync(int id);
        Task<IngredientViewDto> CreateAsync(IngredientCreateDto dto);
        Task<IngredientViewDto?> UpdateAsync(int id, IngredientUpdateDto dto);
        Task<bool> DeleteAsync(int id);

        // Batch Management
        Task<InventoryBatchViewDto?> AddBatchAsync(int ingredientId, BatchCreateDto dto);
        Task<IEnumerable<InventoryBatchViewDto>?> GetBatchesAsync(int ingredientId);
        Task<InventoryBatchViewDto?> UpdateBatchAsync(int ingredientId, int batchId, BatchUpdateDto dto);
        Task<bool> DeleteBatchAsync(int ingredientId, int batchId);

        // SKU Generation
        Task<string> GenerateSKUAsync(string ingredientName);
        // Stock Operations
        Task<bool> DeductStockFIFOAsync(int ingredientId, decimal quantityNeeded);
        Task<StockCheckResult> CheckStockForOrderAsync(List<OrderItemDto> items);
        Task DeductStockForOrderAsync(List<OrderItemDto> items);
        Task RestoreStockForOrderAsync(List<OrderItem> items);
    }
}