using CaPheMinhHuu.DTOs.Ingredient;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Chỉ Admin được quản lý kho
    public class IngredientController : ControllerBase
    {
        private readonly IIngredientService _service;

        public IngredientController(IIngredientService service)
        {
            _service = service;
        }

        // GET: api/Ingredient (Xem tồn kho)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/Ingredient/5 (Xem chi tiết 1 nguyên liệu)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound("Không tìm thấy nguyên liệu");
            return Ok(result);
        }

        // POST: api/Ingredient (Nhập hàng mới)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] IngredientCreateDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        // PUT: api/Ingredient/5 (Cập nhật thông tin nguyên liệu)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] IngredientUpdateDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            if (result == null) return NotFound("Không tìm thấy nguyên liệu");
            return Ok(result);
        }

        // DELETE: api/Ingredient/5 (Xóa nguyên liệu)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound("Không tìm thấy nguyên liệu");
            return Ok(new { message = "Xóa thành công" });
        }

        // ===== UNIT MANAGEMENT =====

        // POST: api/Ingredient/5/units (Thêm đơn vị quy đổi)
        [HttpPost("{ingredientId}/units")]
        public async Task<IActionResult> AddUnit(int ingredientId, [FromBody] AddIngredientUnitDto dto)
        {
            try
            {
                var result = await _service.AddUnitAsync(ingredientId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Ingredient/5/units/3 (Xóa đơn vị quy đổi)
        [HttpDelete("{ingredientId}/units/{unitId}")]
        public async Task<IActionResult> DeleteUnit(int ingredientId, int unitId)
        {
            try
            {
                var result = await _service.DeleteUnitAsync(ingredientId, unitId);
                if (!result) return NotFound(new { message = "Không tìm thấy đơn vị quy đổi" });
                return Ok(new { message = "Xóa đơn vị thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ===== BATCH MANAGEMENT =====

        // POST: api/Ingredient/5/batch (Thêm lô hàng mới)
        [HttpPost("{ingredientId}/batch")]
        public async Task<IActionResult> AddBatch(int ingredientId, [FromBody] BatchCreateDto dto)
        {
            var result = await _service.AddBatchAsync(ingredientId, dto);
            if (result == null) return NotFound("Không tìm thấy nguyên liệu");
            return Ok(result);
        }

        // GET: api/Ingredient/5/batches (Lấy tất cả lô hàng)
        [HttpGet("{ingredientId}/batches")]
        public async Task<IActionResult> GetBatches(int ingredientId)
        {
            var result = await _service.GetBatchesAsync(ingredientId);
            if (result == null) return NotFound("Không tìm thấy nguyên liệu");
            return Ok(result);
        }

        // PUT: api/Ingredient/5/batch/3 (Cập nhật lô hàng)
        [HttpPut("{ingredientId}/batch/{batchId}")]
        public async Task<IActionResult> UpdateBatch(int ingredientId, int batchId, [FromBody] BatchUpdateDto dto)
        {
            var result = await _service.UpdateBatchAsync(ingredientId, batchId, dto);
            if (result == null) return NotFound("Không tìm thấy lô hàng");
            return Ok(result);
        }

        // PUT: api/Ingredient/5/batch/3/dispose (Xuất hủy lô hàng hết hạn)
        [HttpPut("{ingredientId}/batch/{batchId}/dispose")]
        public async Task<IActionResult> DisposeBatch(int ingredientId, int batchId)
        {
            try
            {
                var result = await _service.DisposeBatchAsync(ingredientId, batchId);
                if (result == null) return NotFound(new { message = "Không tìm thấy lô hàng" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Ingredient/5/batch/3 (Xóa lô hàng)
        [HttpDelete("{ingredientId}/batch/{batchId}")]
        public async Task<IActionResult> DeleteBatch(int ingredientId, int batchId)
        {
            var result = await _service.DeleteBatchAsync(ingredientId, batchId);
            if (!result) return NotFound("Không tìm thấy lô hàng");
            return Ok(new { message = "Xóa lô hàng thành công" });
        }

        // ===== SKU GENERATION =====

        // POST: api/Ingredient/generate-sku (Tạo mã SKU tự động)
        [HttpPost("generate-sku")]
        public async Task<IActionResult> GenerateSKU([FromBody] GenerateSKURequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Tên nguyên liệu không được để trống");
            }

            
            {
                var sku = await _service.GenerateSKUAsync(request.Name);
                return Ok(new { sku });
            }
            
        }
    }

    public class GenerateSKURequest
    {
        public string Name { get; set; } = string.Empty;
    }
}