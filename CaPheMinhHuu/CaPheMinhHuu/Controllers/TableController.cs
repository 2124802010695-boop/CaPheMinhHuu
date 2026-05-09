using CaPheMinhHuu.DTOs.Table;
using CaPheMinhHuu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace CaPheMinhHuu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TableController : ControllerBase
    {
        private readonly ITableService _tableService;
        public TableController(ITableService tableService)
        {
            _tableService = tableService;
        }
        // GET: api/table
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var tables = await _tableService.GetAllWithAreaAsync();
            return Ok(tables);
        }
        // GET: api/table/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var table = await _tableService.GetByIdAsync(id);
            if (table == null) return NotFound();
            var dto = new TableResponseDto
            {
                Id     = table.Id,
                Number = table.Number,
                AreaId = table.AreaId,
                Seats  = table.Seats,
                Status = table.Status,
                QRCode = table.QRCode
            };
            return Ok(dto);
        }
        // GET: api/table/5/qr
        [HttpGet("{id}/qr")]
        [AllowAnonymous]
        public async Task<IActionResult> GetQRCode(int id)
        {
            var table = await _tableService.GetByIdAsync(id);
            if (table == null) return NotFound();
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var qrUrl = $"{baseUrl}/menu?tableId={id}";
            return Ok(new
            {
                tableId = id,
                tableNumber = table.Number,
                qrUrl = qrUrl,
                status = table.Status
            });
        }
        // POST: api/table
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateTableDto dto)
        {
            var table = await _tableService.CreateAsync(dto);
            var responseDto = new TableResponseDto
            {
                Id     = table.Id,
                Number = table.Number,
                AreaId = table.AreaId,
                Seats  = table.Seats,
                Status = table.Status,
                QRCode = table.QRCode
            };
            return CreatedAtAction(nameof(GetById), new { id = table.Id }, responseDto);
        }
        // PUT: api/table/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTableDto dto)
        {
            await _tableService.UpdateAsync(id, dto);
            return NoContent();
        }
        // PATCH: api/table/5/status — Cashier đổi trạng thái bàn
        // Phân quyền: Admin + Cashier đều được đổi status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin, Cashier")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            
            {
                await _tableService.UpdateStatusAsync(id, status);
                return Ok(new { message = $"Đã cập nhật bàn {id} thành {status}" });
            }
            
        }
        // DELETE: api/table/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _tableService.DeleteAsync(id);
            return NoContent();
        }
    }
}