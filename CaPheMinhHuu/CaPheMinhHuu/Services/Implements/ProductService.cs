using CaPheMinhHuu.DTOs.Product;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using CaPheMinhHuu.Repositories.Implements;

namespace CaPheMinhHuu.Services.Implements
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<ProductService> _logger;

        public ProductService(IProductRepository repo, IHttpContextAccessor httpContextAccessor, ILogger<ProductService> logger)
        {
            _repo = repo;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        /// <summary>
        /// Build full absolute URL cho ảnh sản phẩm.
        /// VD: "/images/products/abc.png" → "https://localhost:7280/images/products/abc.png"
        /// Frontend chỉ cần dùng src={product.imageUrl} mà không cần ghép domain.
        /// </summary>
        private string? BuildFullImageUrl(string? relativePath)
        {
            if (string.IsNullOrEmpty(relativePath)) return null;
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null) return relativePath;
            return $"{request.Scheme}://{request.Host}{relativePath}";
        }

        public async Task<IEnumerable<ProductViewDto>> GetAllProductsAsync(bool includeDeleted = false)
        {
            var products = includeDeleted
                ? await _repo.GetAllIncludingDeletedAsync()
                : await _repo.GetAllAsync();
            return products.Select(p => new ProductViewDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Unit = p.Unit,
                ImageUrl = BuildFullImageUrl(p.ImageUrl),
                PreparationTime = p.PreparationTime,
                CategoryName = p.Category?.Name ?? "Chưa phân loại",
                CategoryId = p.CategoryId,
                Description = p.Description,
                IsActive = p.IsActive
            });
        }

        public async Task<ProductViewDto> CreateProductAsync(ProductCreateDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                // Unit = dto.Unit, <--- ĐÃ XÓA DÒNG NÀY VÌ DTO KHÔNG CÓ
                ImageUrl = dto.ImageUrl, // <--- QUAN TRỌNG: Lưu link ảnh vào DB
                PreparationTime = dto.PreparationTime,
                CategoryId = dto.CategoryId,
                IsActive = true // Mặc định là đang bán
            };

            await _repo.AddAsync(product);
            _logger.LogInformation("Sản phẩm mới: #{Id} - {Name}", product.Id, product.Name);

            return new ProductViewDto { Id = product.Id, Name = product.Name };
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var result = await _repo.DeleteAsync(id);
            if (result) _logger.LogInformation("Xóa sản phẩm #{Id}", id);
            return result;
        }
        public async Task<bool> UpdateProductAsync(int id, ProductUpdateDto dto)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) return false;
            product.Name = dto.Name;
            product.Price = dto.Price;
            product.CategoryId = dto.CategoryId;
            product.Description = dto.Description;
            product.PreparationTime = dto.PreparationTime;
            if (!string.IsNullOrEmpty(dto.ImageUrl))
            {
                product.ImageUrl = dto.ImageUrl;
            }
            product.UpdatedDate = DateTime.Now;
            await _repo.UpdateAsync(product);
            _logger.LogInformation("Cập nhật sản phẩm #{Id} - {Name}", id, product.Name);
            return true;
        }
        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }
        public async Task UpdateProductImageAsync(int id, string imageUrl)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) throw new Exception("Sản phẩm không tồn tại.");
            product.ImageUrl = imageUrl;
            product.UpdatedDate = DateTime.Now;
            await _repo.UpdateAsync(product);
            _logger.LogInformation("Cập nhật ảnh sản phẩm #{Id}", id);
        }
    }
}