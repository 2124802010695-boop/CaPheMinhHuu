using CaPheMinhHuu.DTOs.ProductSize;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/Product/{productId}/sizes")]
    [ApiController]
    [Authorize]
    public class ProductSizeController : ControllerBase
    {
        private readonly IProductSizeService _productSizeService;

        public ProductSizeController(IProductSizeService productSizeService)
        {
            _productSizeService = productSizeService;
        }

        // GET: api/Product/5/sizes
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var sizes = await _productSizeService.GetByProductIdAsync(productId);
            return Ok(sizes);
        }

        // POST: api/Product/5/sizes
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(int productId, [FromBody] ProductSizeCreateDto dto)
        {
            try
            {
                var result = await _productSizeService.CreateAsync(productId, dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/Product/5/sizes/2
        [HttpPut("{sizeId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int productId, int sizeId, [FromBody] ProductSizeUpdateDto dto)
        {
            var result = await _productSizeService.UpdateAsync(productId, sizeId, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // DELETE: api/Product/5/sizes/2
        [HttpDelete("{sizeId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int productId, int sizeId)
        {
            var result = await _productSizeService.DeleteAsync(productId, sizeId);
            if (!result) return NotFound();
            return Ok(new { message = "Xóa size thành công" });
        }
    }
}
