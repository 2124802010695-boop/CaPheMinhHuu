using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class InventoryBatchRepository : IInventoryBatchRepository
    {
        private readonly ApplicationDbContext _context;

        public InventoryBatchRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<InventoryBatch>> GetAllAsync()
        {
            return await _context.InventoryBatches
                .Where(b => !b.IsDeleted)
                .ToListAsync();
        }

        public async Task<InventoryBatch?> GetByIdAsync(int id)
        {
            return await _context.InventoryBatches
                .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);
        }

        public async Task<InventoryBatch> AddAsync(InventoryBatch batch)
        {
            _context.InventoryBatches.Add(batch);
            await _context.SaveChangesAsync();
            return batch;
        }

        public async Task<InventoryBatch> UpdateAsync(InventoryBatch batch)
        {
            _context.InventoryBatches.Update(batch);
            await _context.SaveChangesAsync();
            return batch;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var batch = await _context.InventoryBatches.FindAsync(id);
            if (batch == null) return false;

            batch.IsDeleted = true;
            _context.InventoryBatches.Update(batch);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<InventoryBatch>> GetByIngredientIdAsync(int ingredientId)
        {
            return await _context.InventoryBatches
                .Where(b => b.IngredientId == ingredientId && !b.IsDeleted)
                .OrderBy(b => b.ExpiryDate) // FIFO
                .ToListAsync();
        }
        public async Task<List<InventoryBatch>> GetAvailableFIFOAsync(int ingredientId)
        {
            return await _context.InventoryBatches
                .Where(b => b.IngredientId == ingredientId
                         && !b.IsDeleted
                         && b.CurrentQuantity > 0
                         && (b.ExpiryDate == null || b.ExpiryDate > DateTime.Now))
                .OrderBy(b => b.ExpiryDate)      // Hết hạn sớm nhất → dùng trước
                .ThenBy(b => b.ImportDate)       // Nhập trước → dùng trước nếu cùng hạn
                .ToListAsync();
        }
        public async Task<decimal> GetTotalStockAsync(int ingredientId)
        {
            return await _context.InventoryBatches
                .Where(b => b.IngredientId == ingredientId
                         && !b.IsDeleted
                         && b.CurrentQuantity > 0)
                .SumAsync(b => b.CurrentQuantity);
        }
        public async Task<IDbContextTransaction> BeginTransactionAsync()
                        => await _context.Database.BeginTransactionAsync();
        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();
        }
    }