using CaPheMinhHuu.DTOs.Product;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        // GET: api/Product — Public (customer + POS)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAllProductsAsync(includeDeleted: false);
            return Ok(products);
        }

        // GET: api/Product/admin/all — Admin xem tất cả kể cả đã xóa
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAdmin()
        {
            var products = await _productService.GetAllProductsAsync(includeDeleted: true);
            return Ok(products);
        }

        // POST: api/Product
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] ProductCreateDto dto)
        {
            
            {
                // 1. XỬ LÝ FILE ẢNH (Logic này để ở Controller là hợp lý)
                if (dto.ImageFile != null)
                {
                    // Tạo tên file ngẫu nhiên
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.ImageFile.FileName);

                    // Đường dẫn lưu: wwwroot/images/products
                    var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
                    if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

                    // Lưu file vật lý
                    var filePath = Path.Combine(uploadPath, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.ImageFile.CopyToAsync(stream);
                    }

                    // Gán đường dẫn vào DTO để Service biết đường mà lưu
                    dto.ImageUrl = "/images/products/" + fileName;
                }

                // 2. GỌI SERVICE (Đúng chuẩn kiến trúc của bạn)
                // Thay vì gọi _repo, ta gọi _productService
                var result = await _productService.CreateProductAsync(dto);

                return Ok(result);
            }
           

        }
        // POST: api/Product/{id}/image — Upload/Cập nhật ảnh sản phẩm
        [HttpPost("{id}/image")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadImage(int id, IFormFile ImageFile)
        {
            
            {
                // 1. Validate file
                if (ImageFile == null || ImageFile.Length == 0)
                    return BadRequest("Vui lòng chọn file ảnh.");
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var ext = Path.GetExtension(ImageFile.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(ext))
                    return BadRequest("Chỉ chấp nhận file JPG, PNG, WEBP.");
                if (ImageFile.Length > 5 * 1024 * 1024)
                    return BadRequest("File ảnh không được vượt quá 5MB.");
                // 2. Lấy sản phẩm hiện tại để xóa ảnh cũ
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                    return NotFound("Không tìm thấy sản phẩm.");
                // 3. Xóa ảnh cũ trên disk (nếu có)
                if (!string.IsNullOrEmpty(product.ImageUrl))
                {
                    var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", product.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldPath))
                        System.IO.File.Delete(oldPath);
                }
                // 4. Lưu file mới
                var fileName = Guid.NewGuid().ToString() + ext;
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
                if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);
                var filePath = Path.Combine(uploadPath, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await ImageFile.CopyToAsync(stream);
                }
                // 5. Cập nhật DB
                var imageUrl = "/images/products/" + fileName;
                await _productService.UpdateProductImageAsync(id, imageUrl);
                return Ok(new { message = "Cập nhật ảnh thành công!", imageUrl });
            }
            
        }

        // DELETE: api/Product/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result) return NotFound("Không tìm thấy sản phẩm");

            return Ok(new { message = "Xóa thành công" });
        }
        //PUt
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromForm] ProductUpdateDto dto)
        {
            
            {
                if (dto.ImageFile != null)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.ImageFile.FileName);
                    var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
                    if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);
                    var filePath = Path.Combine(uploadPath, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.ImageFile.CopyToAsync(stream);
                    }
                    dto.ImageUrl = "/images/products/" + fileName;
                }
                var result = await _productService.UpdateProductAsync(id, dto);
                if (!result) return NotFound("Không tìm thấy sản phẩm");
                return Ok(new { message = "Cập nhật thành công" });
            }
            
        }
    }
}