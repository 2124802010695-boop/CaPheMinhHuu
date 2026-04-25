    using CaPheMinhHuu.DTOs.Recipe;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Bảo mật
    public class RecipeController : ControllerBase
    {
        private readonly IRecipeService _service;

        public RecipeController(IRecipeService service)
        {
            _service = service;
        }

        // GET: api/Recipe/product/5 (Lấy công thức của món ID 5)
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var result = await _service.GetByProductIdAsync(productId);
            return Ok(result);
        }

        // POST: api/Recipe (Thêm nguyên liệu vào món)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RecipeCreateDto dto)
        {
            try
            {
                var result = await _service.AddIngredientToProductAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); // Trả về lỗi nếu trùng nguyên liệu
            }
        }

        // DELETE: api/Recipe/10 (Xóa dòng công thức ID 10)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.RemoveIngredientFromProductAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Xóa thành công" });
        }
    }
}