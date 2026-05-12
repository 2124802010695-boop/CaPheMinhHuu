
using CaPheMinhHuu.Data;
using CaPheMinhHuu.DTOs.Ingredient;
using CaPheMinhHuu.DTOs.Order;
using CaPheMinhHuu.Hubs;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
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
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;
        private readonly IRecipeRepository _recipeRepo;

        private readonly ILogger<OrderService> _logger;
        public OrderService(
            IOrderRepository orderRepository,
            IProductRepository productRepository,
            IHubContext<AppHub> hubContext,
            IIngredientService ingredientService,
            ITableRepository tableRepository,
            IEmailService emailService,
            ApplicationDbContext context,
            IRecipeRepository recipeRepo,
            ILogger<OrderService> logger)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _hubContext = hubContext;
            _ingredientService = ingredientService;
            _tableRepository = tableRepository;
            _emailService = emailService;
            _context = context;
            _recipeRepo = recipeRepo;
            _logger = logger;
        }
        public async Task<OrderViewDto> CreateOrderAsync(OrderCreateDto dto, int userId, int? shiftId = null)
        {
            // 1. Kiểm tra stock nguyên liệu (base product)
            var stockCheck = await _ingredientService.CheckStockForOrderAsync(dto.Items);
            if (!stockCheck.IsAvailable)
            {
                var info = string.Join(", ", stockCheck.Shortages.Select(
                    s => $"{s.IngredientName}: cần {s.Required}, còn {s.Available}"));
                throw new InvalidOperationException($"Không đủ nguyên liệu: {info}");
            }

            // 2. Tạo Order header
            var order = new Order
            {
                UserId        = userId,
                CustomerName  = dto.CustomerName,
                Phone         = dto.Phone,
                Email         = dto.Email,
                Address       = dto.Address ?? "",
                PaymentMethod = dto.PaymentMethod,
                TableId       = dto.TableId,
                ShiftId       = shiftId,
                OrderDate     = DateTime.Now,
                Status        = "Pending",
                OrderCode     = $"MH-{DateTime.Now:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}"
            };

            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();

            foreach (var itemDto in dto.Items)
            {
                // 3. Lấy product
                var product = await _productRepository.GetByIdAsync(itemDto.ProductId);
                if (product == null)
                    throw new InvalidOperationException($"Sản phẩm ID {itemDto.ProductId} không tồn tại");

                // 4. Xử lý Size — query ProductSizes
                decimal sizeExtraPrice = 0;
                string? sizeLabel = null;

                if (!string.IsNullOrEmpty(itemDto.SizeLabel))
                {
                    var productSize = await _context.ProductSizes
                        .FirstOrDefaultAsync(ps => ps.ProductId == itemDto.ProductId
                            && ps.Label == itemDto.SizeLabel
                            && ps.IsActive
                            && !ps.IsDeleted);

                    if (productSize != null)
                    {
                        sizeExtraPrice        = productSize.PriceExtra;
                        sizeLabel             = productSize.Label;
                        itemDto.SizeMultiplier = productSize.RecipeMultiplier;
                    }
                }

                // 5. Xử lý Toppings — query Toppings
                decimal toppingTotal = 0;
                var toppingEntities = new List<OrderItemTopping>();

                if (itemDto.Toppings != null && itemDto.Toppings.Any())
                {
                    foreach (var toppingDto in itemDto.Toppings)
                    {
                        var topping = await _context.Toppings
                            .FirstOrDefaultAsync(t => t.Id == toppingDto.ToppingId
                                && t.IsActive
                                && !t.IsDeleted);

                        if (topping == null)
                            throw new InvalidOperationException($"Topping ID {toppingDto.ToppingId} không tồn tại");

                        var actualToppingQty = toppingDto.Quantity * itemDto.Quantity;
                        var lineTotal = topping.Price * actualToppingQty;
                        toppingTotal += lineTotal;

                        toppingEntities.Add(new OrderItemTopping
                        {
                            ToppingId   = topping.Id,
                            ToppingName = topping.Name,
                            Price       = topping.Price,
                            Quantity    = actualToppingQty,
                            LineTotal   = lineTotal
                        });
                    }
                }

                // 6. Tạo BOM Snapshot — lưu định mức nguyên liệu tại thời điểm order
                var recipes = await _recipeRepo.GetByProductIdAsync(itemDto.ProductId);
                var ingredientSnapshots = recipes
                    .Where(r => r.IsActive && !r.IsDeleted)
                    .Select(r => new OrderItemIngredientSnapshot
                    {
                        IngredientId     = r.IngredientId,
                        IngredientName   = r.Ingredient?.Name ?? "",
                        BaseUnit         = r.Ingredient?.BaseUnit ?? "",
                        QuantityRequired = r.QuantityRequired,
                        YieldFactor      = r.YieldFactor,
                        RecipeVersion    = r.Version,
                        SizeMultiplier   = itemDto.SizeMultiplier,
                        OrderQuantity    = itemDto.Quantity,
                        ActualDeducted   = (r.QuantityRequired / r.YieldFactor) * itemDto.SizeMultiplier * itemDto.Quantity
                    }).ToList();

                // 7. Tạo OrderItem với đầy đủ thông tin + BOM Snapshot
                var orderItem = new OrderItem
                {
                    ProductId           = itemDto.ProductId,
                    Quantity            = itemDto.Quantity,
                    PriceAtOrder        = product.Price,
                    SizeExtraPrice      = sizeExtraPrice,
                    SizeMultiplier      = itemDto.SizeMultiplier,
                    SizeLabel           = sizeLabel,
                    SugarLevel          = itemDto.SugarLevel,
                    IceLevel            = itemDto.IceLevel,
                    Note                = itemDto.Note,
                    ToppingTotal        = toppingTotal,
                    Toppings            = toppingEntities,
                    IngredientSnapshots = ingredientSnapshots
                };

                // SubtotalFull = (PriceAtOrder + SizeExtraPrice) × Quantity + ToppingTotal
                var itemSubtotal = (product.Price + sizeExtraPrice) * itemDto.Quantity + toppingTotal;
                totalAmount += itemSubtotal;

                orderItems.Add(orderItem);
            }

            order.OrderItems  = orderItems;
            order.TotalAmount = totalAmount;

            // 7. Lưu Order + OrderItems + OrderItemToppings (cascade)
            var createdOrder = await _orderRepository.CreateAsync(order);

            // 8. Cập nhật trạng thái bàn
            if (dto.TableId.HasValue)
                await _tableRepository.UpdateStatusAsync(dto.TableId.Value, "Occupied");

            // 9. Trừ kho nguyên liệu base + audit log (atomic)
            await _ingredientService.DeductStockForOrderAsync(
                createdOrder.OrderItems.ToList(),
                createdOrder.OrderCode,
                createdOrder.OrderDate);

            // 10. Trừ kho topping
            var allToppingDtos = dto.Items
                .Where(i => i.Toppings != null)
                .SelectMany(i => i.Toppings!.Select(t => new OrderItemToppingDto
                {
                    ToppingId = t.ToppingId,
                    Quantity  = t.Quantity * i.Quantity
                }))
                .ToList();
            if (allToppingDtos.Any())
                await _ingredientService.DeductStockForToppingsAsync(allToppingDtos);

            // 11. Broadcast + return
            var orderViewDto = await GetOrderByIdAsync(createdOrder.Id) ?? new OrderViewDto();
            _logger.LogInformation("Đơn hàng #{OrderId} đã tạo — {ItemCount} sản phẩm, tổng {Total:N0}đ",
                orderViewDto.Id, orderViewDto.Items?.Count ?? 0, orderViewDto.TotalAmount);
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
                Email = order.Email,
                CashierName = order.User?.FullName,
                IsPaid = order.IsPaid,
                Items = order.OrderItems.Select(oi => new OrderItemViewDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    PriceAtOrder = oi.PriceAtOrder,
                    Note = oi.Note,
                    SizeLabel = oi.SizeLabel,
                    SizeExtraPrice = oi.SizeExtraPrice,
                    SugarLevel = oi.SugarLevel,
                    IceLevel = oi.IceLevel,
                    ToppingTotal = oi.ToppingTotal,
                    ImageUrl = oi.Product?.ImageUrl,
                    Toppings = oi.Toppings?.Select(t => new OrderItemToppingViewDto
                    {
                        ToppingId = t.ToppingId,
                        ToppingName = t.ToppingName,
                        Price = t.Price,
                        Quantity = t.Quantity,
                        LineTotal = t.LineTotal
                    }).ToList() ?? new List<OrderItemToppingViewDto>()
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
                Email      = o.Email,
                CashierName = o.User?.FullName,
                IsPaid     = o.IsPaid,
                Items = o.OrderItems?.Select(oi => new OrderItemViewDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name ?? "N/A",
                    Quantity = oi.Quantity,
                    PriceAtOrder = oi.PriceAtOrder,
                    Note = oi.Note,
                    SizeLabel = oi.SizeLabel,
                    SizeExtraPrice = oi.SizeExtraPrice,
                    SugarLevel = oi.SugarLevel,
                    IceLevel = oi.IceLevel,
                    ToppingTotal = oi.ToppingTotal,
                    ImageUrl = oi.Product?.ImageUrl,
                    Toppings = oi.Toppings?.Select(t => new OrderItemToppingViewDto
                    {
                        ToppingId = t.ToppingId,
                        ToppingName = t.ToppingName,
                        Price = t.Price,
                        Quantity = t.Quantity,
                        LineTotal = t.LineTotal
                    }).ToList() ?? new List<OrderItemToppingViewDto>()
                }).ToList() ?? new List<OrderItemViewDto>()
            }).ToList();
        }
        private static OrderViewDto MapToViewDto(Order order) => new()
        {
            Id            = order.Id,
            CustomerName  = order.CustomerName,
            Phone         = order.Phone,
            TotalAmount   = order.TotalAmount,
            Status        = order.Status,
            OrderDate     = order.OrderDate,
            PaymentMethod = order.PaymentMethod,
            TableId       = order.TableId,
            TableName     = order.Table?.Number.ToString(),
            OrderCode     = order.OrderCode,
            Email         = order.Email,
            CashierName   = order.User?.FullName,
            IsPaid        = order.IsPaid,
            Items         = order.OrderItems?.Select(oi => new OrderItemViewDto
            {
                ProductId    = oi.ProductId,
                ProductName  = oi.Product?.Name ?? "N/A",
                Quantity     = oi.Quantity,
                PriceAtOrder = oi.PriceAtOrder,
                Note         = oi.Note,
                SizeLabel      = oi.SizeLabel,
                SizeExtraPrice = oi.SizeExtraPrice,
                SugarLevel     = oi.SugarLevel,
                IceLevel       = oi.IceLevel,
                ToppingTotal   = oi.ToppingTotal,
                ImageUrl       = oi.Product?.ImageUrl,
                Toppings       = oi.Toppings?.Select(t => new OrderItemToppingViewDto
                {
                    ToppingId   = t.ToppingId,
                    ToppingName = t.ToppingName,
                    Price       = t.Price,
                    Quantity    = t.Quantity,
                    LineTotal   = t.LineTotal
                }).ToList() ?? new List<OrderItemToppingViewDto>()
            }).ToList() ?? new List<OrderItemViewDto>()
        };

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
                    // Hoàn kho topping
                    var allToppings = order.OrderItems
                        .SelectMany(oi => oi.Toppings ?? new List<OrderItemTopping>())
                        .ToList();
                    if (allToppings.Any())
                        await _ingredientService.RestoreStockForToppingsAsync(allToppings);
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
                {
                    var hasActive = await _orderRepository.HasActiveOrdersForTableAsync(
                        order.TableId.Value, order.Id);
                    if (!hasActive)
                        await _tableRepository.UpdateStatusAsync(order.TableId.Value, "Empty");
                }
            }
            _logger.LogInformation("Đơn hàng #{OrderId} chuyển trạng thái → {Status}", id, newStatus);

            if (newStatus == "Completed" && !string.IsNullOrEmpty(order.Email))
            {
                try
                {
                    var emailDto = new CaPheMinhHuu.DTOs.Email.OrderEmailDto
                    {
                        OrderCode = order.OrderCode,
                        CustomerName = order.CustomerName ?? "Quý khách",
                        TableNumber = order.TableId.HasValue ? $"Bàn {order.Table?.Number}" : "Mang đi",
                        PaymentMethod = order.PaymentMethod,
                        TotalAmount = order.TotalAmount,
                        OrderDate = order.OrderDate,
                        Items = order.OrderItems.Select(oi => new CaPheMinhHuu.DTOs.Email.OrderItemInfo
                        {
                            ProductName = oi.Product?.Name ?? "N/A",
                            Quantity = oi.Quantity,
                            Price = oi.PriceAtOrder
                        }).ToList()
                    };
                    await _emailService.SendOrderConfirmationAsync(order.Email, emailDto);
                    _logger.LogInformation("Bill email sent to {Email} for order #{OrderCode}", order.Email, order.OrderCode);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send bill email for order #{OrderCode}", order.OrderCode);
                    // Không throw — email failure không block luồng chính
                }
            }

            await _hubContext.Clients.Group($"Order_{order.OrderCode}")
                .SendAsync("OrderStatusUpdated", order.OrderCode, newStatus);
            
            // Đồng thời notify cho staff/admin (group Broadcast hoặc Operations)
            await _hubContext.Clients.Group("Broadcast").SendAsync("OrderStatusUpdated", order.OrderCode, newStatus);
        }

        public async Task<OrderViewDto> CreateGuestOrderAsync(GuestOrderCreateDto dto)
        {
            // Giới hạn 1 đơn / 1 lần xác thực email
            if (!string.IsNullOrEmpty(dto.Email))
            {
                var existingOrder = await _context.Orders
                    .Where(o => o.Email == dto.Email && !o.IsDeleted)
                    .FirstOrDefaultAsync();
                if (existingOrder != null)
                    throw new InvalidOperationException(
                        "Mỗi lần xác thực chỉ được đặt 1 đơn. Vui lòng xác thực lại email để đặt đơn mới.");
            }

            // Convert GuestOrderItemDto → OrderItemDto để reuse stock check
            var itemDtos = dto.Items.Select(i => new OrderItemDto
            {
                ProductId  = i.ProductId,
                Quantity   = i.Quantity,
                Note       = i.Note,
                SizeLabel  = i.SizeLabel,
                SugarLevel = i.SugarLevel,
                IceLevel   = i.IceLevel,
                Toppings   = i.Toppings ?? new()
            }).ToList();

            var stockCheck = await _ingredientService.CheckStockForOrderAsync(itemDtos);
            if (!stockCheck.IsAvailable)
            {
                var info = string.Join(", ", stockCheck.Shortages.Select(
                    s => $"{s.IngredientName}: cần {s.Required}, còn {s.Available}"));
                throw new InvalidOperationException($"Không đủ nguyên liệu: {info}");
            }

            var order = new Order
            {
                UserId        = null,
                CustomerName  = dto.Email ?? "Khách",
                Email         = dto.Email,
                Phone         = null,
                Address       = "",
                PaymentMethod = "Cash",
                TableId       = dto.TableId,
                OrderDate     = DateTime.Now,
                Status        = "Pending",
                OrderCode     = $"MH-{DateTime.Now:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}"
            };

            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();
            foreach (var item in itemDtos)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null)
                    throw new InvalidOperationException($"Sản phẩm ID {item.ProductId} không tồn tại");

                // Resolve Size → SizeMultiplier + SizeExtraPrice
                decimal sizeExtraPrice = 0;
                string? sizeLabel = null;
                if (!string.IsNullOrEmpty(item.SizeLabel))
                {
                    var productSize = await _context.ProductSizes
                        .FirstOrDefaultAsync(ps => ps.ProductId == item.ProductId
                            && ps.Label == item.SizeLabel
                            && ps.IsActive
                            && !ps.IsDeleted);
                    if (productSize != null)
                    {
                        sizeExtraPrice      = productSize.PriceExtra;
                        sizeLabel           = productSize.Label;
                        item.SizeMultiplier = productSize.RecipeMultiplier;
                    }
                }

                // Resolve Toppings → toppingEntities + toppingTotal
                decimal toppingTotal = 0;
                var toppingEntities = new List<OrderItemTopping>();
                if (item.Toppings != null && item.Toppings.Any())
                {
                    foreach (var toppingDto in item.Toppings)
                    {
                        var topping = await _context.Toppings
                            .FirstOrDefaultAsync(t => t.Id == toppingDto.ToppingId
                                && t.IsActive && !t.IsDeleted);
                        if (topping == null)
                            throw new InvalidOperationException($"Topping ID {toppingDto.ToppingId} không tồn tại");
                        var actualToppingQty = toppingDto.Quantity * item.Quantity;
                        var lineTotal = topping.Price * actualToppingQty;
                        toppingTotal += lineTotal;
                        toppingEntities.Add(new OrderItemTopping
                        {
                            ToppingId   = topping.Id,
                            ToppingName = topping.Name,
                            Price       = topping.Price,
                            Quantity    = actualToppingQty,
                            LineTotal   = lineTotal
                        });
                    }
                }

                // BOM Snapshot cho guest order
                var guestRecipes = await _recipeRepo.GetByProductIdAsync(item.ProductId);
                var guestIngredientSnapshots = guestRecipes
                    .Where(r => r.IsActive && !r.IsDeleted)
                    .Select(r => new OrderItemIngredientSnapshot
                    {
                        IngredientId     = r.IngredientId,
                        IngredientName   = r.Ingredient?.Name ?? "",
                        BaseUnit         = r.Ingredient?.BaseUnit ?? "",
                        QuantityRequired = r.QuantityRequired,
                        YieldFactor      = r.YieldFactor,
                        RecipeVersion    = r.Version,
                        SizeMultiplier   = item.SizeMultiplier,
                        OrderQuantity    = item.Quantity,
                        ActualDeducted   = (r.QuantityRequired / r.YieldFactor) * item.SizeMultiplier * item.Quantity
                    }).ToList();

                orderItems.Add(new OrderItem
                {
                    ProductId           = item.ProductId,
                    Quantity            = item.Quantity,
                    PriceAtOrder        = product.Price,
                    SizeExtraPrice      = sizeExtraPrice,
                    SizeMultiplier      = item.SizeMultiplier,
                    SizeLabel           = sizeLabel,
                    SugarLevel          = item.SugarLevel,
                    IceLevel            = item.IceLevel,
                    Note                = item.Note,
                    ToppingTotal        = toppingTotal,
                    Toppings            = toppingEntities,
                    IngredientSnapshots = guestIngredientSnapshots
                });

                // SubtotalFull = (PriceAtOrder + SizeExtraPrice) × Quantity + ToppingTotal
                totalAmount += (product.Price + sizeExtraPrice) * item.Quantity + toppingTotal;
            }

            order.OrderItems  = orderItems;
            order.TotalAmount = totalAmount;

            var createdOrder = await _orderRepository.CreateAsync(order);

            if (dto.TableId.HasValue)
                await _tableRepository.UpdateStatusAsync(dto.TableId.Value, "Occupied");

            await _ingredientService.DeductStockForOrderAsync(
                createdOrder.OrderItems.ToList(),
                createdOrder.OrderCode,
                createdOrder.OrderDate);

            // Trừ kho topping
            var allToppingDtos = itemDtos
                .Where(i => i.Toppings != null && i.Toppings.Any())
                .SelectMany(i => i.Toppings!.Select(t => new OrderItemToppingDto
                {
                    ToppingId = t.ToppingId,
                    Quantity  = t.Quantity * i.Quantity
                }))
                .ToList();
            if (allToppingDtos.Any())
                await _ingredientService.DeductStockForToppingsAsync(allToppingDtos);

            var orderViewDto = await GetOrderByIdAsync(createdOrder.Id) ?? new OrderViewDto();

            _logger.LogInformation("Guest order #{OrderId} created — {ItemCount} items, total {Total:N0}đ",
                orderViewDto.Id, orderViewDto.Items?.Count ?? 0, orderViewDto.TotalAmount);

            await _hubContext.Clients.Group("Operations").SendAsync("ReceiveNewOrder", orderViewDto);

            return orderViewDto;
        }

        public async Task<OrderViewDto?> GetByOrderCodeAsync(string orderCode)
        {
            var order = await _orderRepository.GetByOrderCodeAsync(orderCode);
            return order == null ? null : MapToViewDto(order);
        }
        public async Task MarkAsPaidAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Không tìm thấy đơn hàng #{id}");

            if (order.IsPaid)
                throw new InvalidOperationException($"Đơn hàng #{id} đã được thanh toán trước đó");

            order.IsPaid = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Đơn hàng #{OrderId} đã được đánh dấu thanh toán", id);

            await _hubContext.Clients.Groups("Cashier", "Admin")
                .SendAsync("OrderPaid", id);
        }
    }
}