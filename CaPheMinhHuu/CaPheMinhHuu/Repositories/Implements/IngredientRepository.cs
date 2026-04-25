using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class IngredientRepository : IIngredientRepository
    {
        private readonly ApplicationDbContext _context;
        public IngredientRepository(ApplicationDbContext context) { _context = context; }

        public async Task<IEnumerable<Ingredient>> GetAllAsync()
        {
            return await _context.Ingredients
                .Where(i => !i.IsDeleted)
                .Include(i => i.IngredientCategory)
                .Include(i => i.Units)                                  // MỚI
                .Include(i => i.Batches.Where(b => !b.IsDeleted))       // MỚI: Filtered Include
                .ToListAsync();
        }

        public async Task<Ingredient?> GetByIdAsync(int id)
        {
            return await _context.Ingredients
                .Include(i => i.IngredientCategory)
                .Include(i => i.Units)                                  // MỚI
                .Include(i => i.Batches.Where(b => !b.IsDeleted))       // MỚI: Filtered Include
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<Ingredient> AddAsync(Ingredient ingredient)
        {
            _context.Ingredients.Add(ingredient);
            await _context.SaveChangesAsync();
            return ingredient;
        }

        public async Task<Ingredient> UpdateAsync(Ingredient ingredient)
        {
            _context.Ingredients.Update(ingredient);
            await _context.SaveChangesAsync();
            return ingredient;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _context.Ingredients.FindAsync(id);
            if (item == null) return false;
            item.IsDeleted = true;
            _context.Ingredients.Update(item);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsBySKU(string sku)
        {
            return await _context.Ingredients.AnyAsync(i => i.SKU == sku);
        }
    }
}