using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Repositories.Implements
{
    public class RecipeRepository : IRecipeRepository
    {
        private readonly ApplicationDbContext _context;

        public RecipeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Recipe>> GetByProductIdAsync(int productId)
        {
            return await _context.Recipes
                .Include(r => r.Ingredient) // Join bảng để lấy tên và đơn vị
                .Where(r => r.ProductId == productId && !r.IsDeleted)
                .ToListAsync();
        }

        public async Task AddAsync(Recipe recipe)
        {
            await _context.Recipes.AddAsync(recipe);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _context.Recipes.FindAsync(id);
            if (item == null) return false;

            item.IsDeleted = true;
            _context.Recipes.Update(item);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int productId, int ingredientId)
        {
            return await _context.Recipes.AnyAsync(r => r.ProductId == productId && r.IngredientId == ingredientId && !r.IsDeleted);
        }
    }
}