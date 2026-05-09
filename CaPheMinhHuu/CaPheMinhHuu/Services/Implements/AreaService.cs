using CaPheMinhHuu.DTOs.Area;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;

namespace CaPheMinhHuu.Services.Implements
{
    public class AreaService : IAreaService
    {
        private readonly IAreaRepository _areaRepository;
        private readonly ITableRepository _tableRepository;

        public AreaService(IAreaRepository areaRepository, ITableRepository tableRepository)
        {
            _areaRepository = areaRepository;
            _tableRepository = tableRepository;
        }

        private static AreaResponseDto MapToDto(Area area) => new AreaResponseDto
        {
            Id           = area.Id,
            Name         = area.Name,
            Description  = area.Description,
            IsActive     = area.IsActive,
            DisplayOrder = area.DisplayOrder,
            TableCount   = area.Tables?.Count(t => !t.IsDeleted) ?? 0
        };

        public async Task<IEnumerable<AreaResponseDto>> GetAllAsync()
        {
            var areas = await _areaRepository.GetAllAsync();
            return areas.Select(MapToDto);
        }

        public async Task<AreaResponseDto?> GetByIdAsync(int id)
        {
            var area = await _areaRepository.GetByIdAsync(id);
            return area == null ? null : MapToDto(area);
        }

        public async Task<AreaResponseDto> CreateAsync(AreaCreateDto dto)
        {
            var area = new Area
            {
                Name         = dto.Name.Trim(),
                Description  = dto.Description?.Trim(),
                IsActive     = dto.IsActive,
                DisplayOrder = dto.DisplayOrder
            };
            var created = await _areaRepository.CreateAsync(area);
            return MapToDto(created);
        }

        public async Task UpdateAsync(int id, AreaUpdateDto dto)
        {
            var area = await _areaRepository.GetByIdAsync(id);
            if (area == null) throw new Exception("Không tìm thấy khu vực");

            area.Name         = dto.Name.Trim();
            area.Description  = dto.Description?.Trim();
            area.IsActive     = dto.IsActive;
            area.DisplayOrder = dto.DisplayOrder;

            await _areaRepository.UpdateAsync(area);
        }

        public async Task DeleteAsync(int id)
        {
            // Null-out AreaId của tất cả bàn thuộc khu vực này trước khi soft-delete
            var tables = await _tableRepository.GetAllWithAreaAsync();
            foreach (var table in tables.Where(t => t.AreaId == id))
            {
                table.AreaId = null;
                await _tableRepository.UpdateAsync(table);
            }
            await _areaRepository.DeleteAsync(id);
        }
    }
}
