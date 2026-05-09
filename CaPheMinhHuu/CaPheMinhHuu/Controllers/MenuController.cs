using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaPheMinhHuu.Controllers
{
    [Route("api/customer/menu")]
    [ApiController]
    [AllowAnonymous]
    public class MenuController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ICategoryService _categoryService;

        public MenuController(IProductService productService, ICategoryService categoryService)
        {
            _productService  = productService;
            _categoryService = categoryService;
        }

        // GET /api/customer/menu/products
        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }

        // GET /api/customer/menu/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }
    }
}
