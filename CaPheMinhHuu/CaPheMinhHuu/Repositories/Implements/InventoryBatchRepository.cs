using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

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
            return await _context.InventoryBatches.ToListAsync();
        }

        public async Task<InventoryBatch?> GetByIdAsync(int id)
        {
            return await _context.InventoryBatches.FindAsync(id);
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
    }
}