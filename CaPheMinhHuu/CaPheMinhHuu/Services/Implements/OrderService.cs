
using CaPheMinhHuu.DTOs.Ingredient;
using CaPheMinhHuu.DTOs.Order;
using CaPheMinhHuu.Hubs;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
namespace CaPheMinhHuu.Services.Implements


{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;
        private readonly IHubContext<AppHub> _hubContext;
        private readonly IIngredientService _ingredientService;
        private readonly ITableRepository _tableRepository;

        private readonly ILogger<OrderService> _logger;
        public OrderService(
            IOrderRepository orderRepository,
            IProductRepository productRepository,
            IHubContext<AppHub> hubContext,
            IIngredientService ingredientService,
            ITableRepository tableRepository,
            ILogger<OrderService> logger)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _hubContext = hubContext;
            _ingredientService = ingredientService;
            _tableRepository = tableRepository;
            _logger = logger;
        }
        public async Task<OrderViewDto> CreateOrderAsync(OrderCreateDto dto, int userId)
        {
            var stockCheck = await _ingredientService.CheckStockForOrderAsync(dto.Items);
            if (!stockCheck.IsAvailable)
            {
                var info = string.Join(", ", stockCheck.Shortages.Select(
                    s => $"{s.IngredientName}: cần {s.Required}, còn {s.Available}"));
                throw new InvalidOperationException($"Không đủ nguyên liệu: {info}");
            }
            var order = new Order
            {
                UserId = userId,
                CustomerName = dto.CustomerName,
                Phone = dto.Phone,
                Address = dto.Address ?? "",
                PaymentMethod = dto.PaymentMethod,
                TableId = dto.TableId,
                OrderDate = DateTime.Now,
                Status = "Pending",
                OrderCode = $"MH-{DateTime.Now:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}"
            };
            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();
            foreach (var item in dto.Items)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                    throw new InvalidOperationException($"Sản phẩm ID {item.ProductId} không tồn tại");
                var orderItem = new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    PriceAtOrder = product.Price,
                    Note = item.Note
                };
                orderItems.Add(orderItem);
                totalAmount += product.Price * item.Quantity;
            }
            order.OrderItems = orderItems;
            order.TotalAmount = totalAmount;
            var createdOrder = await _orderRepository.CreateAsync(order);
            if (dto.TableId.HasValue)
                await _tableRepository.UpdateStatusAsync(dto.TableId.Value, "Occupied");
            await _ingredientService.DeductStockForOrderAsync(dto.Items);
            // Lấy OrderViewDto đầy đủ để broadcast (có items, productName...)
            var orderViewDto = await GetOrderByIdAsync(createdOrder.Id) ?? new OrderViewDto();
            _logger.LogInformation("Đơn hàng #{OrderId} đã tạo — {ItemCount} sản phẩm, tổng {Total:N0}đ",
                orderViewDto.Id, orderViewDto.Items?.Count ?? 0, orderViewDto.TotalAmount);
            // Broadcast DTO (không broadcast raw entity) để KDS nhận đầy đủ thông tin
            await _hubContext.Clients.All.SendAsync("ReceiveNewOrder", orderViewDto);
            return orderViewDto;
        }
        public async Task<OrderViewDto?> GetOrderByIdAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;
            return new OrderViewDto
            {
                Id = order.Id,
                CustomerName = order.CustomerName,
                Phone = order.Phone,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                OrderDate = order.OrderDate,
                PaymentMethod = order.PaymentMethod,
                TableId = order.TableId,
                TableName = order.Table?.Number.ToString(),
                OrderCode = order.OrderCode,
                Items = order.OrderItems.Select(oi => new OrderItemViewDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    PriceAtOrder = oi.PriceAtOrder,
                    Subtotal = oi.PriceAtOrder * oi.Quantity,
                    Note = oi.Note
                }).ToList()
            };
        }
        public async Task<List<OrderViewDto>> GetTodayOrdersAsync()
        {
            var orders = await _orderRepository.GetByDateAsync(DateTime.Today);
            return orders.Select(o => new OrderViewDto
            {
                Id = o.Id,
                CustomerName = o.CustomerName,
                Phone = o.Phone,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                OrderDate = o.OrderDate,
                PaymentMethod = o.PaymentMethod,
                TableId = o.TableId,
                TableName = o.Table?.Number.ToString(),
                OrderCode = o.OrderCode,
                Items = o.OrderItems?.Select(oi => new OrderItemViewDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name ?? "N/A",
                    Quantity = oi.Quantity,
                    PriceAtOrder = oi.PriceAtOrder,
                    Subtotal = oi.PriceAtOrder * oi.Quantity,
                    Note = oi.Note
                }).ToList() ?? new List<OrderItemViewDto>()
            }).ToList();
        }
        private static readonly Dictionary<string, string[]> _allowedTransitions = new()
        {
            ["Pending"] = new[] { "Preparing", "Cancelled", "Completed" },
            ["Preparing"] = new[] { "Ready", "Cancelled" },
            ["Ready"] = new[] { "Served" },
            ["Served"] = new[] { "Completed" },
            ["Completed"] = Array.Empty<string>(),
            ["Cancelled"] = Array.Empty<string>()
        };
        public async Task UpdateOrderStatusAsync(int id, string newStatus)
        {
            // 1. Validate state machine (đã lấy order ở Service)
            var order = await _orderRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Không tìm thấy đơn hàng #{id}");
            if (!_allowedTransitions.TryGetValue(order.Status, out var validNext)
                || !validNext.Contains(newStatus))
                throw new InvalidOperationException(
                    $"Không thể chuyển từ '{order.Status}' → '{newStatus}'");
            // 2. Nếu hủy đơn → transaction bọc cả UpdateStatus + RestoreStock
            if (newStatus == "Cancelled")
            {
                using var tx = await _orderRepository.BeginTransactionAsync();
                try
                {
                    await _orderRepository.UpdateStatusAsync(id, newStatus);
                    // Truyền OrderItems trực tiếp — order đã load sẵn ở bước 1
                    await _ingredientService.RestoreStockForOrderAsync(order.OrderItems.ToList());
                    await tx.CommitAsync();
                }
                catch
                {
                    await tx.RollbackAsync();
                    throw;
                }
            }
            else
            {
                await _orderRepository.UpdateStatusAsync(id, newStatus);
            }
            // Sau khi UpdateStatus thành công
            if (newStatus == "Completed" || newStatus == "Cancelled")
            {
                if (order.TableId.HasValue)
                    await _tableRepository.UpdateStatusAsync(order.TableId.Value, "Empty");
            }
            _logger.LogInformation("Đơn hàng #{OrderId} chuyển trạng thái → {Status}", id, newStatus);
            await _hubContext.Clients.All.SendAsync("OrderStatusUpdated", id, newStatus);
        }
    }
}