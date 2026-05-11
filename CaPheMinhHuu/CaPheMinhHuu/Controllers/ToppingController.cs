using CaPheMinhHuu.DTOs.Topping;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ToppingController : ControllerBase
    {
        private readonly IToppingService _toppingService;

        public ToppingController(IToppingService toppingService)
        {
            _toppingService = toppingService;
        }

        // GET: api/Topping — Public (POS + Customer chọn topping)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var toppings = await _toppingService.GetAllAsync(includeInactive: false);
            return Ok(toppings);
        }

        // GET: api/Topping/admin/all — Admin xem tất cả kể cả inactive
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAdmin()
        {
            var toppings = await _toppingService.GetAllAsync(includeInactive: true);
            return Ok(toppings);
        }

        // GET: api/Topping/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var topping = await _toppingService.GetByIdAsync(id);
            if (topping == null) return NotFound();
            return Ok(topping);
        }

        // POST: api/Topping
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] ToppingCreateDto dto)
        {
            try
            {
                var result = await _toppingService.CreateAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/Topping/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] ToppingUpdateDto dto)
        {
            try
            {
                var result = await _toppingService.UpdateAsync(id, dto);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Topping/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _toppingService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Xóa topping thành công" });
        }

        // PATCH: api/Topping/5/toggle
        [HttpPatch("{id}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Toggle(int id)
        {
            var result = await _toppingService.ToggleActiveAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Cập nhật trạng thái thành công" });
        }
    }
}
