using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class IngredientUnitRepository : IIngredientUnitRepository
    {
        private readonly ApplicationDbContext _context;

        public IngredientUnitRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<IngredientUnit>> GetAllAsync()
        {
            return await _context.IngredientUnits
                .Where(u => !u.IsDeleted)
                .ToListAsync();
        }

        public async Task<IngredientUnit?> GetByIdAsync(int id)
        {
            return await _context.IngredientUnits.FindAsync(id);
        }

        public async Task<IngredientUnit> AddAsync(IngredientUnit unit)
        {
            _context.IngredientUnits.Add(unit);
            await _context.SaveChangesAsync();
            return unit;
        }

        public async Task<IngredientUnit> UpdateAsync(IngredientUnit unit)
        {
            _context.IngredientUnits.Update(unit);
            await _context.SaveChangesAsync();
            return unit;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var unit = await _context.IngredientUnits.FindAsync(id);
            if (unit == null) return false;

            unit.IsDeleted = true;
            unit.UpdatedDate = DateTime.UtcNow;
            _context.IngredientUnits.Update(unit);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<IngredientUnit>> GetByIngredientIdAsync(int ingredientId)
        {
            return await _context.IngredientUnits
                .Where(u => u.IngredientId == ingredientId && !u.IsDeleted)
                .ToListAsync();
        }
    }
}