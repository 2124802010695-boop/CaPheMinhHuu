using CaPheMinhHuu.DTOs.IngredientCategory; // Cần namespace này cho DTO
using CaPheMinhHuu.Interfaces; // Cần namespace này cho Interface Service
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class IngredientCategoryController : ControllerBase
    {
        // 1. Chỉ khai báo Service, KHÔNG khai báo DbContext
        private readonly IIngredientCategoryService _service;

        // 2. Inject Service vào Constructor
        public IngredientCategoryController(IIngredientCategoryService service)
        {
            _service = service;
        }

        // 3. GET: api/IngredientCategory
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // 4. GET: api/IngredientCategory/{id} (Thêm cái này cho đủ bộ)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            return Ok(result);
        }

        // 5. POST: api/IngredientCategory
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] IngredientCategoryCreateDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        // 6. PUT: api/IngredientCategory/{id} (Bổ sung Update)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] IngredientCategoryUpdateDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }

        // 7. DELETE: api/IngredientCategory/{id} (Bổ sung Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}