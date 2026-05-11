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

        // Unit Management
        Task<IngredientUnitViewDto> AddUnitAsync(int ingredientId, AddIngredientUnitDto dto);
        Task<bool> DeleteUnitAsync(int ingredientId, int unitId);
        // Batch Management
        Task<InventoryBatchViewDto?> AddBatchAsync(int ingredientId, BatchCreateDto dto);
        Task<IEnumerable<InventoryBatchViewDto>?> GetBatchesAsync(int ingredientId);
        Task<InventoryBatchViewDto?> UpdateBatchAsync(int ingredientId, int batchId, BatchUpdateDto dto);
        Task<bool> DeleteBatchAsync(int ingredientId, int batchId);
        Task<InventoryBatchViewDto?> DisposeBatchAsync(int ingredientId, int batchId);

        // SKU Generation
        Task<string> GenerateSKUAsync(string ingredientName);
        // Stock Operations
        Task<bool> DeductStockFIFOAsync(int ingredientId, decimal quantityNeeded);
        Task<StockCheckResult> CheckStockForOrderAsync(List<OrderItemDto> items);
        Task DeductStockForOrderAsync(List<OrderItem> items, string orderCode, DateTime orderDate);
        Task RestoreStockForOrderAsync(List<OrderItem> items);

        // Topping stock operations
        Task DeductStockForToppingsAsync(List<OrderItemToppingDto> toppings);
        Task RestoreStockForToppingsAsync(List<CaPheMinhHuu.Models.OrderItemTopping> toppings);
    }
}