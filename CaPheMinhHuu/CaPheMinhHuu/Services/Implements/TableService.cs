using CaPheMinhHuu.Data;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using CaPheMinhHuu.DTOs.Table;
using Microsoft.EntityFrameworkCore;

namespace CaPheMinhHuu.Services.Implements
{
    public class TableService : ITableService
    {
        private readonly ITableRepository _tableRepository;

        public TableService(ITableRepository tableRepository)
        {
            _tableRepository = tableRepository;
        }

        public async Task<IEnumerable<Table>> GetAllAsync()
        {
            return await _tableRepository.GetAllAsync();
        }

        public async Task<Table?> GetByIdAsync(int id)
        {
            return await _tableRepository.GetByIdAsync(id);
        }

        public async Task<Table> CreateAsync(CreateTableDto dto)
        {
            var table = new Table
            {
                Number = dto.Number,
                Seats = dto.Seats,
                Area = dto.Area,
                Status = "Empty",
                AreaId = dto.AreaId
            };
            return await _tableRepository.CreateAsync(table);
        }

        public async Task UpdateAsync(int id, UpdateTableDto dto)
        {
            var table = await _tableRepository.GetByIdAsync(id);
            if (table == null) throw new Exception("Table not found");

            table.Number = dto.Number;
            table.Seats = dto.Seats;
            table.Status = dto.Status;
            table.AreaId = dto.AreaId;

            await _tableRepository.UpdateAsync(table);
        }
        public async Task UpdateStatusAsync(int id, string status)
        {
            // Validate status hợp lệ
            var validStatuses = new[] { "Empty", "Occupied", "Reserved" };
            if (!validStatuses.Contains(status))
                throw new Exception($"Status không hợp lệ. Chỉ chấp nhận: {string.Join(", ", validStatuses)}");
            var table = await _tableRepository.GetByIdAsync(id);
            if (table == null) throw new Exception("Không tìm thấy bàn");
            table.Status = status;
            await _tableRepository.UpdateAsync(table);
        }
        public async Task DeleteAsync(int id)
        {
            await _tableRepository.DeleteAsync(id);
        }
    }
}