using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class IngredientCategoryRepository : IIngredientCategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public IngredientCategoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<IngredientCategory>> GetAllAsync()
        {
            return await _context.IngredientCategories.ToListAsync();
        }

        public async Task<IngredientCategory?> GetByIdAsync(int id)
        {
            return await _context.IngredientCategories.FindAsync(id);
        }

        public async Task<IngredientCategory> AddAsync(IngredientCategory category)
        {
            _context.IngredientCategories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<IngredientCategory> UpdateAsync(IngredientCategory category)
        {
            _context.IngredientCategories.Update(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _context.IngredientCategories.FindAsync(id);
            if (category == null) return false;

            _context.IngredientCategories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}