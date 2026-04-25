# 🗓️ ROADMAP 4 TUẦN - HOÀN THIỆN DỰ ÁN ĐẠT ĐIỂM 8+

**Thời gian:** 03/12/2025 - 31/12/2025 (4 tuần)  
**Mục tiêu:** Hoàn thành 3 tính năng CORE + Tài liệu đầy đủ → Đạt điểm 8.3/10

---

## 📅 TUẦN 1: POS BÁN HÀNG (03/12 - 09/12)
**Mục tiêu:** Xây dựng hoàn chỉnh hệ thống bán hàng tại quầy

### **Ngày 1-2: Thiết kế Database & API (03-04/12)**

#### Backend Tasks:
- [ ] **Thiết kế Models**
  ```csharp
  // Models/Order.cs
  public class Order : BaseEntity
  {
      public string OrderCode { get; set; }  // ORD-20251203-001
      public int? UserId { get; set; }       // Nhân viên thu ngân
      public decimal TotalAmount { get; set; }
      public decimal DiscountAmount { get; set; }
      public decimal FinalAmount { get; set; }
      public string PaymentMethod { get; set; }  // Cash/Card/VNPay
      public OrderStatus Status { get; set; }    // Pending/Completed/Cancelled
      public string Note { get; set; }
      public int? ShiftId { get; set; }      // Ca làm việc
      
      // Navigation
      public User User { get; set; }
      public ICollection<OrderDetail> OrderDetails { get; set; }
      public Shift Shift { get; set; }
  }
  
  // Models/OrderDetail.cs
  public class OrderDetail
  {
      public int Id { get; set; }
      public int OrderId { get; set; }
      public int ProductId { get; set; }
      public string ProductName { get; set; }  // Snapshot
      public decimal UnitPrice { get; set; }   // Snapshot
      public int Quantity { get; set; }
      public string Size { get; set; }         // S/M/L
      public string Toppings { get; set; }     // JSON: ["Trân châu", "Thạch"]
      public decimal ToppingPrice { get; set; }
      public decimal Subtotal { get; set; }
      public string Note { get; set; }
      
      // Navigation
      public Order Order { get; set; }
      public Product Product { get; set; }
  }
  
  // Enums/OrderStatus.cs
  public enum OrderStatus
  {
      Pending = 0,      // Chờ xử lý
      Cooking = 1,      // Đang làm
      Completed = 2,    // Hoàn thành
      Cancelled = 3     // Hủy
  }
  ```

- [ ] **Tạo Migration**
  ```bash
  dotnet ef migrations add AddOrderTables
  dotnet ef database update
  ```

- [ ] **Tạo DTOs**
  ```csharp
  // DTOs/Order/OrderCreateDto.cs
  public class OrderCreateDto
  {
      public List<OrderItemDto> Items { get; set; }
      public decimal DiscountAmount { get; set; }
      public string PaymentMethod { get; set; }
      public string Note { get; set; }
  }
  
  public class OrderItemDto
  {
      public int ProductId { get; set; }
      public int Quantity { get; set; }
      public string Size { get; set; }
      public List<string> Toppings { get; set; }
      public string Note { get; set; }
  }
  
  // DTOs/Order/OrderViewDto.cs
  public class OrderViewDto
  {
      public int Id { get; set; }
      public string OrderCode { get; set; }
      public decimal TotalAmount { get; set; }
      public decimal FinalAmount { get; set; }
      public string PaymentMethod { get; set; }
      public OrderStatus Status { get; set; }
      public DateTime CreatedAt { get; set; }
      public List<OrderDetailViewDto> Details { get; set; }
  }
  ```

- [ ] **Viết Repository**
  ```csharp
  // Interfaces/IOrderRepository.cs
  public interface IOrderRepository
  {
      Task<Order> CreateAsync(Order order);
      Task<Order> GetByIdAsync(int id);
      Task<List<Order>> GetByDateAsync(DateTime date);
      Task<List<Order>> GetByShiftAsync(int shiftId);
      Task<Order> UpdateStatusAsync(int id, OrderStatus status);
  }
  
  // Repositories/OrderRepository.cs
  public class OrderRepository : IOrderRepository
  {
      private readonly ApplicationDbContext _context;
      
      public async Task<Order> CreateAsync(Order order)
      {
          // Generate OrderCode
          var today = DateTime.Now.ToString("yyyyMMdd");
          var count = await _context.Orders
              .Where(o => o.CreatedAt.Date == DateTime.Today)
              .CountAsync();
          order.OrderCode = $"ORD-{today}-{(count + 1):D3}";
          
          _context.Orders.Add(order);
          await _context.SaveChangesAsync();
          return order;
      }
      
      // ... implement other methods
  }
  ```

- [ ] **Viết Service**
  ```csharp
  // Services/OrderService.cs
  public class OrderService : IOrderService
  {
      public async Task<OrderViewDto> CreateOrderAsync(OrderCreateDto dto)
      {
          // 1. Validate products exist
          // 2. Calculate prices (product + size + toppings)
          // 3. Calculate total
          // 4. Deduct ingredients from inventory (BOM)
          // 5. Create order
          // 6. Send to Kitchen via SignalR (Tuần 2)
          // 7. Return OrderViewDto
      }
  }
  ```

- [ ] **Viết Controller**
  ```csharp
  // Controllers/OrderController.cs
  [ApiController]
  [Route("api/orders")]
  [Authorize]
  public class OrderController : ControllerBase
  {
      [HttpPost]
      public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
      {
          var result = await _orderService.CreateOrderAsync(dto);
          return Ok(result);
      }
      
      [HttpGet("{id}")]
      public async Task<IActionResult> GetOrder(int id)
      {
          var order = await _orderService.GetOrderByIdAsync(id);
          return Ok(order);
      }
      
      [HttpGet("today")]
      public async Task<IActionResult> GetTodayOrders()
      {
          var orders = await _orderService.GetTodayOrdersAsync();
          return Ok(orders);
      }
      
      [HttpPatch("{id}/status")]
      public async Task<IActionResult> UpdateStatus(int id, [FromBody] OrderStatus status)
      {
          await _orderService.UpdateOrderStatusAsync(id, status);
          return NoContent();
      }
  }
  ```

**Deliverable Ngày 1-2:**
- ✅ Database schema hoàn chỉnh
- ✅ API CRUD Orders hoạt động
- ✅ Test bằng Postman/Swagger

---

### **Ngày 3-4: Frontend POS Layout (05-06/12)**

#### Frontend Tasks:
- [ ] **Tạo Page POS**
  ```jsx
  // pages/QuanLyBanHang.jsx
  import { useState, useEffect } from 'react';
  import { Grid, Box, Paper } from '@mui/material';
  import MenuGrid from '../components/POS/MenuGrid';
  import Cart from '../components/POS/Cart';
  import PaymentPanel from '../components/POS/PaymentPanel';
  
  export default function QuanLyBanHang() {
      const [cart, setCart] = useState([]);
      const [categories, setCategories] = useState([]);
      const [products, setProducts] = useState([]);
      
      // Load categories & products
      useEffect(() => {
          loadCategories();
          loadProducts();
      }, []);
      
      const addToCart = (product, size, toppings) => {
          // Logic thêm vào giỏ
      };
      
      const removeFromCart = (index) => {
          // Logic xóa khỏi giỏ
      };
      
      const updateQuantity = (index, quantity) => {
          // Logic cập nhật số lượng
      };
      
      const handleCheckout = async (paymentMethod) => {
          // Gọi API tạo đơn hàng
      };
      
      return (
          <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <Typography variant="h5" color="white">
                      ☕ POS - Bán Hàng
                  </Typography>
              </Paper>
              
              {/* Main Content */}
              <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
                  {/* Left: Menu */}
                  <Grid item xs={7} sx={{ height: '100%', overflow: 'auto' }}>
                      <MenuGrid 
                          categories={categories}
                          products={products}
                          onAddToCart={addToCart}
                      />
                  </Grid>
                  
                  {/* Right: Cart + Payment */}
                  <Grid item xs={5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Cart 
                          items={cart}
                          onRemove={removeFromCart}
                          onUpdateQuantity={updateQuantity}
                      />
                      <PaymentPanel 
                          cart={cart}
                          onCheckout={handleCheckout}
                      />
                  </Grid>
              </Grid>
          </Box>
      );
  }
  ```

- [ ] **Tạo Component MenuGrid**
  ```jsx
  // components/POS/MenuGrid.jsx
  export default function MenuGrid({ categories, products, onAddToCart }) {
      const [selectedCategory, setSelectedCategory] = useState(null);
      const [openSizeModal, setOpenSizeModal] = useState(false);
      const [selectedProduct, setSelectedProduct] = useState(null);
      
      const filteredProducts = selectedCategory
          ? products.filter(p => p.categoryId === selectedCategory)
          : products;
      
      const handleProductClick = (product) => {
          setSelectedProduct(product);
          setOpenSizeModal(true);
      };
      
      return (
          <Box sx={{ p: 2 }}>
              {/* Category Tabs */}
              <Tabs value={selectedCategory} onChange={(e, val) => setSelectedCategory(val)}>
                  <Tab label="Tất cả" value={null} />
                  {categories.map(cat => (
                      <Tab key={cat.id} label={cat.name} value={cat.id} />
                  ))}
              </Tabs>
              
              {/* Product Grid */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                  {filteredProducts.map(product => (
                      <Grid item xs={4} key={product.id}>
                          <Card 
                              onClick={() => handleProductClick(product)}
                              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                          >
                              <CardMedia
                                  component="img"
                                  height="140"
                                  image={product.imageUrl}
                                  alt={product.name}
                              />
                              <CardContent>
                                  <Typography variant="h6">{product.name}</Typography>
                                  <Typography variant="h6" color="primary">
                                      {product.price.toLocaleString()}đ
                                  </Typography>
                              </CardContent>
                          </Card>
                      </Grid>
                  ))}
              </Grid>
              
              {/* Size & Topping Modal */}
              <ModalSelectSize 
                  open={openSizeModal}
                  product={selectedProduct}
                  onClose={() => setOpenSizeModal(false)}
                  onConfirm={onAddToCart}
              />
          </Box>
      );
  }
  ```

- [ ] **Tạo Component Cart**
  ```jsx
  // components/POS/Cart.jsx
  export default function Cart({ items, onRemove, onUpdateQuantity }) {
      const total = items.reduce((sum, item) => sum + item.subtotal, 0);
      
      return (
          <Paper sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                  🛒 Giỏ hàng ({items.length})
              </Typography>
              
              <List>
                  {items.map((item, index) => (
                      <ListItem key={index}>
                          <ListItemText
                              primary={`${item.productName} (${item.size})`}
                              secondary={
                                  <>
                                      {item.toppings?.length > 0 && (
                                          <Typography variant="caption">
                                              + {item.toppings.join(', ')}
                                          </Typography>
                                      )}
                                      <Typography variant="body2" color="primary">
                                          {item.unitPrice.toLocaleString()}đ x {item.quantity}
                                      </Typography>
                                  </>
                              }
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton onClick={() => onUpdateQuantity(index, item.quantity - 1)}>
                                  <RemoveIcon />
                              </IconButton>
                              <Typography>{item.quantity}</Typography>
                              <IconButton onClick={() => onUpdateQuantity(index, item.quantity + 1)}>
                                  <AddIcon />
                              </IconButton>
                              <IconButton onClick={() => onRemove(index)} color="error">
                                  <DeleteIcon />
                              </IconButton>
                          </Box>
                      </ListItem>
                  ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              <Typography variant="h5" align="right">
                  Tổng: {total.toLocaleString()}đ
              </Typography>
          </Paper>
      );
  }
  ```

- [ ] **Tạo Component PaymentPanel**
  ```jsx
  // components/POS/PaymentPanel.jsx
  export default function PaymentPanel({ cart, onCheckout }) {
      const [paymentMethod, setPaymentMethod] = useState('Cash');
      const [loading, setLoading] = useState(false);
      
      const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
      
      const handleCheckout = async () => {
          setLoading(true);
          try {
              await onCheckout(paymentMethod);
              // Show success message
              // Print bill
              // Clear cart
          } catch (error) {
              // Show error
          } finally {
              setLoading(false);
          }
      };
      
      return (
          <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Typography variant="h6" color="white" sx={{ mb: 2 }}>
                  💳 Thanh toán
              </Typography>
              
              <ToggleButtonGroup
                  value={paymentMethod}
                  exclusive
                  onChange={(e, val) => setPaymentMethod(val)}
                  fullWidth
              >
                  <ToggleButton value="Cash">Tiền mặt</ToggleButton>
                  <ToggleButton value="Card">Thẻ</ToggleButton>
                  <ToggleButton value="VNPay">VNPay</ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || loading}
                  sx={{ mt: 2, py: 2, fontSize: '1.2rem' }}
              >
                  {loading ? <CircularProgress size={24} /> : `Thanh toán ${total.toLocaleString()}đ`}
              </Button>
          </Paper>
      );
  }
  ```

**Deliverable Ngày 3-4:**
- ✅ POS Layout 3 cột hoạt động
- ✅ Thêm/xóa sản phẩm vào giỏ
- ✅ Tính tổng tiền tự động

---

### **Ngày 5-6: Tích hợp API & In hóa đơn (07-08/12)**

#### Tasks:
- [ ] **Tạo Service**
  ```javascript
  // services/orderService.js
  import axiosCustomize from '../utils/axiosCustomize';
  
  export const createOrder = async (orderData) => {
      const response = await axiosCustomize.post('/api/orders', orderData);
      return response.data;
  };
  
  export const getOrderById = async (id) => {
      const response = await axiosCustomize.get(`/api/orders/${id}`);
      return response.data;
  };
  
  export const getTodayOrders = async () => {
      const response = await axiosCustomize.get('/api/orders/today');
      return response.data;
  };
  ```

- [ ] **Tạo Bill Template**
  ```jsx
  // components/POS/BillTemplate.jsx
  export default function BillTemplate({ order }) {
      const printBill = () => {
          window.print();
      };
      
      return (
          <Box className="bill-template" sx={{ p: 3, maxWidth: 300 }}>
              <Typography variant="h6" align="center">
                  ☕ QUÁN CÀ PHÊ MINH HỮU
              </Typography>
              <Typography variant="body2" align="center">
                  Địa chỉ: 123 Đường ABC, TP.HCM
              </Typography>
              <Typography variant="body2" align="center">
                  SĐT: 0123456789
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2">
                  Mã đơn: {order.orderCode}
              </Typography>
              <Typography variant="body2">
                  Ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Table size="small">
                  <TableHead>
                      <TableRow>
                          <TableCell>Món</TableCell>
                          <TableCell align="right">SL</TableCell>
                          <TableCell align="right">Giá</TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      {order.details.map((item, index) => (
                          <TableRow key={index}>
                              <TableCell>
                                  {item.productName} ({item.size})
                                  {item.toppings && (
                                      <Typography variant="caption" display="block">
                                          + {item.toppings}
                                      </Typography>
                                  )}
                              </TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">
                                  {item.subtotal.toLocaleString()}
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" align="right">
                  Tổng: {order.finalAmount.toLocaleString()}đ
              </Typography>
              
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  Cảm ơn quý khách!
              </Typography>
              
              <Button onClick={printBill} fullWidth sx={{ mt: 2 }}>
                  🖨️ In hóa đơn
              </Button>
          </Box>
      );
  }
  ```

- [ ] **CSS cho In hóa đơn**
  ```css
  /* index.css */
  @media print {
      body * {
          visibility: hidden;
      }
      .bill-template, .bill-template * {
          visibility: visible;
      }
      .bill-template {
          position: absolute;
          left: 0;
          top: 0;
      }
  }
  ```

**Deliverable Ngày 5-6:**
- ✅ Tạo đơn hàng thành công
- ✅ In hóa đơn đẹp
- ✅ Lưu vào database

---

### **Ngày 7: Testing & Bug Fixes (09/12)**
- [ ] Test toàn bộ flow: Chọn món → Giỏ hàng → Thanh toán → In bill
- [ ] Test edge cases: Giỏ rỗng, số lượng âm, sản phẩm hết hàng
- [ ] Fix bugs
- [ ] Optimize performance

**Deliverable Tuần 1:**
- ✅ **POS hoàn chỉnh và hoạt động tốt**
- ✅ **Video demo 2-3 phút**

---

## 📅 TUẦN 2: KDS BẾP + REAL-TIME (10/12 - 16/12)
**Mục tiêu:** Bếp nhận đơn real-time và cập nhật trạng thái

### **Ngày 1-2: SignalR Backend (10-11/12)**

#### Backend Tasks:
- [ ] **Cài đặt SignalR**
  ```bash
  dotnet add package Microsoft.AspNetCore.SignalR
  ```

- [ ] **Tạo Hub**
  ```csharp
  // Hubs/KitchenHub.cs
  using Microsoft.AspNetCore.SignalR;
  
  public class KitchenHub : Hub
  {
      public async Task SendNewOrder(OrderViewDto order)
      {
          await Clients.All.SendAsync("ReceiveNewOrder", order);
      }
      
      public async Task UpdateOrderStatus(int orderId, OrderStatus status)
      {
          await Clients.All.SendAsync("OrderStatusUpdated", orderId, status);
      }
  }
  ```

- [ ] **Cấu hình Program.cs**
  ```csharp
  // Program.cs
  builder.Services.AddSignalR();
  
  app.MapHub<KitchenHub>("/kitchenHub");
  ```

- [ ] **Update OrderService**
  ```csharp
  // Services/OrderService.cs
  public class OrderService : IOrderService
  {
      private readonly IHubContext<KitchenHub> _hubContext;
      
      public async Task<OrderViewDto> CreateOrderAsync(OrderCreateDto dto)
      {
          // ... create order logic
          
          // Send to Kitchen via SignalR
          await _hubContext.Clients.All.SendAsync("ReceiveNewOrder", orderDto);
          
          return orderDto;
      }
      
      public async Task UpdateOrderStatusAsync(int id, OrderStatus status)
      {
          await _orderRepository.UpdateStatusAsync(id, status);
          
          // Broadcast status change
          await _hubContext.Clients.All.SendAsync("OrderStatusUpdated", id, status);
      }
  }
  ```

**Deliverable Ngày 1-2:**
- ✅ SignalR Hub hoạt động
- ✅ Test bằng Postman/SignalR Client

---

### **Ngày 3-4: Frontend KDS (12-13/12)**

#### Frontend Tasks:
- [ ] **Cài đặt SignalR Client**
  ```bash
  npm install @microsoft/signalr
  ```

- [ ] **Tạo SignalR Connection**
  ```javascript
  // utils/signalRConnection.js
  import * as signalR from '@microsoft/signalr';
  
  const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/kitchenHub')
      .withAutomaticReconnect()
      .build();
  
  export const startConnection = async () => {
      try {
          await connection.start();
          console.log('SignalR Connected');
      } catch (err) {
          console.error('SignalR Connection Error:', err);
          setTimeout(startConnection, 5000);
      }
  };
  
  export const onReceiveNewOrder = (callback) => {
      connection.on('ReceiveNewOrder', callback);
  };
  
  export const onOrderStatusUpdated = (callback) => {
      connection.on('OrderStatusUpdated', callback);
  };
  
  export const updateOrderStatus = async (orderId, status) => {
      await connection.invoke('UpdateOrderStatus', orderId, status);
  };
  
  export default connection;
  ```

- [ ] **Update KDS Page**
  ```jsx
  // pages/KDS_Bep.jsx
  import { useState, useEffect } from 'react';
  import { startConnection, onReceiveNewOrder, onOrderStatusUpdated } from '../utils/signalRConnection';
  import { updateOrderStatus } from '../services/orderService';
  
  export default function KDS_Bep() {
      const [pendingOrders, setPendingOrders] = useState([]);
      const [cookingOrders, setCookingOrders] = useState([]);
      const [doneOrders, setDoneOrders] = useState([]);
      
      useEffect(() => {
          // Connect SignalR
          startConnection();
          
          // Listen for new orders
          onReceiveNewOrder((order) => {
              setPendingOrders(prev => [...prev, order]);
              // Play sound notification
              new Audio('/notification.mp3').play();
          });
          
          // Listen for status updates
          onOrderStatusUpdated((orderId, status) => {
              // Move order between columns
              moveOrder(orderId, status);
          });
          
          // Load existing orders
          loadTodayOrders();
      }, []);
      
      const handleStartCooking = async (orderId) => {
          await updateOrderStatus(orderId, 'Cooking');
      };
      
      const handleMarkDone = async (orderId) => {
          await updateOrderStatus(orderId, 'Completed');
      };
      
      return (
          <Box sx={{ 
              height: '100vh', 
              background: '#1a1a1a',  // Dark mode
              color: 'white',
              p: 2 
          }}>
              <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
                  🍳 KITCHEN DISPLAY SYSTEM
              </Typography>
              
              <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>
                  {/* Pending Column */}
                  <Grid item xs={4}>
                      <Paper sx={{ p: 2, height: '100%', bgcolor: '#2d2d2d', overflow: 'auto' }}>
                          <Typography variant="h6" sx={{ mb: 2, color: '#ffa726' }}>
                              ⏳ Chờ làm ({pendingOrders.length})
                          </Typography>
                          {pendingOrders.map(order => (
                              <OrderCard 
                                  key={order.id} 
                                  order={order}
                                  onAction={() => handleStartCooking(order.id)}
                                  actionLabel="Bắt đầu"
                                  actionColor="primary"
                              />
                          ))}
                      </Paper>
                  </Grid>
                  
                  {/* Cooking Column */}
                  <Grid item xs={4}>
                      <Paper sx={{ p: 2, height: '100%', bgcolor: '#2d2d2d', overflow: 'auto' }}>
                          <Typography variant="h6" sx={{ mb: 2, color: '#42a5f5' }}>
                              🔥 Đang làm ({cookingOrders.length})
                          </Typography>
                          {cookingOrders.map(order => (
                              <OrderCard 
                                  key={order.id} 
                                  order={order}
                                  onAction={() => handleMarkDone(order.id)}
                                  actionLabel="Hoàn thành"
                                  actionColor="success"
                              />
                          ))}
                      </Paper>
                  </Grid>
                  
                  {/* Done Column */}
                  <Grid item xs={4}>
                      <Paper sx={{ p: 2, height: '100%', bgcolor: '#2d2d2d', overflow: 'auto' }}>
                          <Typography variant="h6" sx={{ mb: 2, color: '#66bb6a' }}>
                              ✅ Xong ({doneOrders.length})
                          </Typography>
                          {doneOrders.map(order => (
                              <OrderCard 
                                  key={order.id} 
                                  order={order}
                                  showTimer={false}
                              />
                          ))}
                      </Paper>
                  </Grid>
              </Grid>
          </Box>
      );
  }
  ```

- [ ] **Tạo OrderCard Component**
  ```jsx
  // components/KDS/OrderCard.jsx
  export default function OrderCard({ order, onAction, actionLabel, actionColor, showTimer = true }) {
      const [elapsed, setElapsed] = useState(0);
      
      useEffect(() => {
          if (!showTimer) return;
          
          const interval = setInterval(() => {
              const diff = Math.floor((Date.now() - new Date(order.createdAt)) / 1000);
              setElapsed(diff);
          }, 1000);
          
          return () => clearInterval(interval);
      }, [order.createdAt, showTimer]);
      
      const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${mins}:${secs.toString().padStart(2, '0')}`;
      };
      
      return (
          <Card sx={{ mb: 2, bgcolor: '#3d3d3d', color: 'white' }}>
              <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">{order.orderCode}</Typography>
                      {showTimer && (
                          <Chip 
                              label={formatTime(elapsed)} 
                              color={elapsed > 300 ? 'error' : 'default'}
                              size="small"
                          />
                      )}
                  </Box>
                  
                  <Divider sx={{ my: 1, bgcolor: '#555' }} />
                  
                  {order.details.map((item, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                          <Typography variant="body1">
                              <strong>{item.quantity}x</strong> {item.productName} ({item.size})
                          </Typography>
                          {item.toppings && (
                              <Typography variant="caption" color="warning.main">
                                  + {item.toppings}
                              </Typography>
                          )}
                          {item.note && (
                              <Typography variant="caption" color="error.main" display="block">
                                  📝 {item.note}
                              </Typography>
                          )}
                      </Box>
                  ))}
                  
                  {onAction && (
                      <Button 
                          variant="contained" 
                          color={actionColor}
                          fullWidth
                          onClick={onAction}
                          sx={{ mt: 2 }}
                      >
                          {actionLabel}
                      </Button>
                  )}
              </CardContent>
          </Card>
      );
  }
  ```

**Deliverable Ngày 3-4:**
- ✅ KDS nhận đơn real-time
- ✅ Cập nhật trạng thái món
- ✅ Dark mode đẹp

---

### **Ngày 5-6: Testing & Polish (14-15/12)**
- [ ] Test real-time: POS tạo đơn → KDS nhận ngay
- [ ] Test multi-user: Nhiều màn hình KDS cùng lúc
- [ ] Thêm sound notification
- [ ] Thêm animation khi chuyển trạng thái
- [ ] Optimize performance

**Deliverable Ngày 5-6:**
- ✅ Real-time hoạt động ổn định
- ✅ UX mượt mà

---

### **Ngày 7: Documentation (16/12)**
- [ ] Viết tài liệu SignalR
- [ ] Sequence Diagram: POS → SignalR → KDS
- [ ] Video demo Real-time

**Deliverable Tuần 2:**
- ✅ **KDS Real-time hoàn chỉnh**
- ✅ **Video demo 2-3 phút**

---

## 📅 TUẦN 3: QUẢN LÝ CA & BÁO CÁO (17/12 - 23/12)
**Mục tiêu:** Mở/đóng ca và xem báo cáo doanh thu

### **Ngày 1-2: Database & API (17-18/12)**

#### Backend Tasks:
- [ ] **Thiết kế Model**
  ```csharp
  // Models/Shift.cs
  public class Shift : BaseEntity
  {
      public string ShiftCode { get; set; }  // SHIFT-20251217-001
      public int UserId { get; set; }        // Nhân viên mở ca
      public DateTime StartTime { get; set; }
      public DateTime? EndTime { get; set; }
      public decimal StartingCash { get; set; }  // Tiền đầu ca
      public decimal EndingCash { get; set; }    // Tiền cuối ca
      public decimal TotalRevenue { get; set; }  // Tổng doanh thu
      public decimal CashRevenue { get; set; }   // Tiền mặt
      public decimal CardRevenue { get; set; }   // Thẻ
      public decimal OnlineRevenue { get; set; } // VNPay
      public int TotalOrders { get; set; }
      public ShiftStatus Status { get; set; }    // Open/Closed
      public string Note { get; set; }
      
      // Navigation
      public User User { get; set; }
      public ICollection<Order> Orders { get; set; }
  }
  
  public enum ShiftStatus
  {
      Open = 0,
      Closed = 1
  }
  ```

- [ ] **Tạo API**
  ```csharp
  // Controllers/ShiftController.cs
  [HttpPost("open")]
  public async Task<IActionResult> OpenShift([FromBody] OpenShiftDto dto)
  {
      var shift = await _shiftService.OpenShiftAsync(dto);
      return Ok(shift);
  }
  
  [HttpPost("{id}/close")]
  public async Task<IActionResult> CloseShift(int id, [FromBody] CloseShiftDto dto)
  {
      var report = await _shiftService.CloseShiftAsync(id, dto);
      return Ok(report);
  }
  
  [HttpGet("current")]
  public async Task<IActionResult> GetCurrentShift()
  {
      var shift = await _shiftService.GetCurrentShiftAsync();
      return Ok(shift);
  }
  
  [HttpGet("{id}/report")]
  public async Task<IActionResult> GetShiftReport(int id)
  {
      var report = await _shiftService.GetShiftReportAsync(id);
      return Ok(report);
  }
  ```

- [ ] **Viết Service**
  ```csharp
  // Services/ShiftService.cs
  public async Task<ShiftViewDto> OpenShiftAsync(OpenShiftDto dto)
  {
      // Check if there's already an open shift
      var existingShift = await _shiftRepository.GetOpenShiftAsync();
      if (existingShift != null)
          throw new Exception("Đã có ca đang mở!");
      
      var shift = new Shift
      {
          ShiftCode = GenerateShiftCode(),
          UserId = dto.UserId,
          StartTime = DateTime.Now,
          StartingCash = dto.StartingCash,
          Status = ShiftStatus.Open
      };
      
      await _shiftRepository.CreateAsync(shift);
      return MapToDto(shift);
  }
  
  public async Task<ShiftReportDto> CloseShiftAsync(int id, CloseShiftDto dto)
  {
      var shift = await _shiftRepository.GetByIdAsync(id);
      
      // Calculate revenue
      var orders = await _orderRepository.GetByShiftAsync(id);
      shift.TotalOrders = orders.Count;
      shift.TotalRevenue = orders.Sum(o => o.FinalAmount);
      shift.CashRevenue = orders.Where(o => o.PaymentMethod == "Cash").Sum(o => o.FinalAmount);
      shift.CardRevenue = orders.Where(o => o.PaymentMethod == "Card").Sum(o => o.FinalAmount);
      shift.OnlineRevenue = orders.Where(o => o.PaymentMethod == "VNPay").Sum(o => o.FinalAmount);
      
      shift.EndTime = DateTime.Now;
      shift.EndingCash = dto.EndingCash;
      shift.Status = ShiftStatus.Closed;
      shift.Note = dto.Note;
      
      await _shiftRepository.UpdateAsync(shift);
      
      return GenerateReport(shift, orders);
  }
  ```

**Deliverable Ngày 1-2:**
- ✅ API Mở/Đóng ca hoạt động
- ✅ Tính toán doanh thu chính xác

---

### **Ngày 3-4: Frontend UI (19-20/12)**

#### Frontend Tasks:
- [ ] **Modal Mở Ca**
  ```jsx
  // components/Shift/ModalOpenShift.jsx
  export default function ModalOpenShift({ open, onClose, onSuccess }) {
      const [startingCash, setStartingCash] = useState(0);
      
      const handleSubmit = async () => {
          try {
              await shiftService.openShift({ startingCash });
              onSuccess();
              onClose();
          } catch (error) {
              alert(error.message);
          }
      };
      
      return (
          <Dialog open={open} onClose={onClose}>
              <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  🕐 Mở Ca Làm Việc
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                  <TextField
                      label="Tiền đầu ca"
                      type="number"
                      value={startingCash}
                      onChange={(e) => setStartingCash(e.target.value)}
                      fullWidth
                      InputProps={{
                          endAdornment: <InputAdornment position="end">đ</InputAdornment>
                      }}
                  />
              </DialogContent>
              <DialogActions>
                  <Button onClick={onClose}>Hủy</Button>
                  <Button onClick={handleSubmit} variant="contained">Mở Ca</Button>
              </DialogActions>
          </Dialog>
      );
  }
  ```

- [ ] **Modal Đóng Ca**
  ```jsx
  // components/Shift/ModalCloseShift.jsx
  export default function ModalCloseShift({ open, shift, onClose, onSuccess }) {
      const [endingCash, setEndingCash] = useState(0);
      const [note, setNote] = useState('');
      
      const handleSubmit = async () => {
          try {
              const report = await shiftService.closeShift(shift.id, { endingCash, note });
              // Show report
              onSuccess(report);
              onClose();
          } catch (error) {
              alert(error.message);
          }
      };
      
      return (
          <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  🕐 Đóng Ca Làm Việc
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                      Thông tin ca làm việc
                  </Typography>
                  
                  <Grid container spacing={2}>
                      <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Mã ca:</Typography>
                          <Typography variant="body1">{shift?.shiftCode}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Thời gian:</Typography>
                          <Typography variant="body1">
                              {new Date(shift?.startTime).toLocaleTimeString('vi-VN')}
                          </Typography>
                      </Grid>
                      <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Tiền đầu ca:</Typography>
                          <Typography variant="body1">
                              {shift?.startingCash.toLocaleString()}đ
                          </Typography>
                      </Grid>
                      <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Số đơn:</Typography>
                          <Typography variant="body1">{shift?.totalOrders}</Typography>
                      </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <TextField
                      label="Tiền cuối ca (thực tế)"
                      type="number"
                      value={endingCash}
                      onChange={(e) => setEndingCash(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputProps={{
                          endAdornment: <InputAdornment position="end">đ</InputAdornment>
                      }}
                  />
                  
                  <TextField
                      label="Ghi chú"
                      multiline
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      fullWidth
                  />
              </DialogContent>
              <DialogActions>
                  <Button onClick={onClose}>Hủy</Button>
                  <Button onClick={handleSubmit} variant="contained" color="error">
                      Đóng Ca
                  </Button>
              </DialogActions>
          </Dialog>
      );
  }
  ```

- [ ] **Page Báo Cáo Ca**
  ```jsx
  // pages/BaoCaoCa.jsx
  export default function BaoCaoCa() {
      const [shifts, setShifts] = useState([]);
      const [selectedShift, setSelectedShift] = useState(null);
      const [openReport, setOpenReport] = useState(false);
      
      useEffect(() => {
          loadShifts();
      }, []);
      
      const handleViewReport = (shift) => {
          setSelectedShift(shift);
          setOpenReport(true);
      };
      
      return (
          <Box sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>
                  📊 Báo Cáo Ca Làm Việc
              </Typography>
              
              <TableContainer component={Paper}>
                  <Table>
                      <TableHead>
                          <TableRow>
                              <TableCell>Mã ca</TableCell>
                              <TableCell>Nhân viên</TableCell>
                              <TableCell>Thời gian</TableCell>
                              <TableCell align="right">Số đơn</TableCell>
                              <TableCell align="right">Doanh thu</TableCell>
                              <TableCell>Trạng thái</TableCell>
                              <TableCell>Thao tác</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {shifts.map(shift => (
                              <TableRow key={shift.id}>
                                  <TableCell>{shift.shiftCode}</TableCell>
                                  <TableCell>{shift.userName}</TableCell>
                                  <TableCell>
                                      {new Date(shift.startTime).toLocaleString('vi-VN')}
                                  </TableCell>
                                  <TableCell align="right">{shift.totalOrders}</TableCell>
                                  <TableCell align="right">
                                      {shift.totalRevenue.toLocaleString()}đ
                                  </TableCell>
                                  <TableCell>
                                      <Chip 
                                          label={shift.status === 'Open' ? 'Đang mở' : 'Đã đóng'}
                                          color={shift.status === 'Open' ? 'success' : 'default'}
                                      />
                                  </TableCell>
                                  <TableCell>
                                      <Button onClick={() => handleViewReport(shift)}>
                                          Xem chi tiết
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </TableContainer>
              
              <ShiftReportDialog 
                  open={openReport}
                  shift={selectedShift}
                  onClose={() => setOpenReport(false)}
              />
          </Box>
      );
  }
  ```

**Deliverable Ngày 3-4:**
- ✅ UI Mở/Đóng ca đẹp
- ✅ Báo cáo ca chi tiết

---

### **Ngày 5-6: Tích hợp & Testing (21-22/12)**
- [ ] Tích hợp Shift vào POS
- [ ] Test flow: Mở ca → Bán hàng → Đóng ca → Xem báo cáo
- [ ] Test edge cases: Đóng ca khi chưa mở, mở 2 ca cùng lúc
- [ ] Fix bugs

**Deliverable Ngày 5-6:**
- ✅ Quản lý ca hoạt động hoàn hảo

---

### **Ngày 7: Documentation (23/12)**
- [ ] Viết tài liệu Quản lý ca
- [ ] Sequence Diagram: Mở ca → Bán hàng → Đóng ca
- [ ] Video demo

**Deliverable Tuần 3:**
- ✅ **Quản lý Ca & Báo cáo hoàn chỉnh**
- ✅ **Video demo 2-3 phút**

---

## 📅 TUẦN 4: TÀI LIỆU & TESTING (24/12 - 31/12)
**Mục tiêu:** Hoàn thiện tài liệu và testing để đạt điểm 8+

### **Ngày 1-2: Figma Mockup (24-25/12)**
- [ ] Thiết kế Figma cho tất cả màn hình:
  - [ ] Login
  - [ ] Dashboard
  - [ ] POS Bán hàng
  - [ ] KDS Bếp
  - [ ] Quản lý Danh mục
  - [ ] Quản lý Sản phẩm
  - [ ] Quản lý Kho
  - [ ] Báo cáo Ca
- [ ] Export PNG/PDF
- [ ] Thêm vào báo cáo

**Deliverable Ngày 1-2:**
- ✅ Figma Mockup đầy đủ

---

### **Ngày 3-4: Unit Tests (26-27/12)**
- [ ] **Backend Tests**
  ```csharp
  // Tests/Services/OrderServiceTests.cs
  public class OrderServiceTests
  {
      [Fact]
      public async Task CreateOrder_ShouldReturnOrderDto()
      {
          // Arrange
          var mockRepo = new Mock<IOrderRepository>();
          var service = new OrderService(mockRepo.Object);
          
          // Act
          var result = await service.CreateOrderAsync(new OrderCreateDto());
          
          // Assert
          Assert.NotNull(result);
      }
  }
  ```

- [ ] **Frontend Tests** (Optional)
  ```javascript
  // tests/components/Cart.test.jsx
  import { render, screen } from '@testing-library/react';
  import Cart from '../components/POS/Cart';
  
  test('renders cart with items', () => {
      const items = [{ productName: 'Cà phê sữa', quantity: 1, subtotal: 25000 }];
      render(<Cart items={items} />);
      expect(screen.getByText('Cà phê sữa')).toBeInTheDocument();
  });
  ```

- [ ] Chạy tests và tạo coverage report

**Deliverable Ngày 3-4:**
- ✅ Unit Tests coverage > 70%
- ✅ Test Report

---

### **Ngày 5-6: Tài liệu Báo cáo (28-29/12)**
- [ ] **Viết Báo cáo Tốt nghiệp (100+ trang)**
  - [ ] Chương 1: Tổng quan dự án
  - [ ] Chương 2: Phân tích nghiệp vụ
  - [ ] Chương 3: Thiết kế hệ thống
  - [ ] Chương 4: Triển khai
  - [ ] Chương 5: Testing & Deployment
  - [ ] Chương 6: Kết luận

- [ ] **User Manual (PDF)**
  - [ ] Hướng dẫn cài đặt
  - [ ] Hướng dẫn sử dụng POS
  - [ ] Hướng dẫn sử dụng KDS
  - [ ] Hướng dẫn quản lý

- [ ] **API Documentation**
  - [ ] Swagger export
  - [ ] Postman Collection

**Deliverable Ngày 5-6:**
- ✅ Báo cáo hoàn chỉnh
- ✅ User Manual
- ✅ API Docs

---

### **Ngày 7: Video Demo & Deployment (30-31/12)**
- [ ] **Tạo Video Demo (5-10 phút)**
  - [ ] Giới thiệu dự án
  - [ ] Demo POS Bán hàng
  - [ ] Demo KDS Bếp Real-time
  - [ ] Demo Quản lý Ca
  - [ ] Demo Quản lý Kho & BOM
  - [ ] Kết luận

- [ ] **Deploy lên Cloud**
  - [ ] Backend: Azure/AWS/Somee
  - [ ] Frontend: Vercel/Netlify
  - [ ] Database: SQL Server Cloud

- [ ] **Tạo GitHub Repository**
  - [ ] Push code
  - [ ] Viết README.md chi tiết
  - [ ] Add LICENSE

**Deliverable Ngày 7:**
- ✅ Video Demo chuyên nghiệp
- ✅ Deploy thành công
- ✅ GitHub Repository public

---

## 🎯 CHECKLIST HOÀN THÀNH

### **Chức năng (40%)**
- [ ] ✅ POS Bán hàng (15%)
- [ ] ✅ KDS Bếp Real-time (10%)
- [ ] ✅ Quản lý Ca & Báo cáo (5%)
- [ ] ✅ Quản lý Kho & BOM (10%) - Đã có

### **Tài liệu (35%)**
- [ ] ✅ Figma Mockup (5%)
- [ ] ✅ Báo cáo Tốt nghiệp (15%)
- [ ] ✅ User Manual (5%)
- [ ] ✅ API Documentation (3%)
- [ ] ✅ Sequence Diagrams (4%)
- [ ] ✅ Test Report (3%)

### **Technical (20%)**
- [ ] ✅ N-Tier Architecture (8%) - Đã có
- [ ] ✅ Security (JWT, RBAC) (6%) - Đã có
- [ ] ✅ Unit Tests (6%)

### **Demo (5%)**
- [ ] ✅ Video Demo (2%)
- [ ] ✅ Deploy Cloud (3%)

---

## 📊 DỰ KIẾN ĐIỂM SỐ

| Tiêu chí | Hiện tại | Sau 4 tuần | Tăng |
|----------|----------|------------|------|
| Phân tích & Thiết kế | 18% | 20% | +2% |
| Chức năng hệ thống | 20% | 38% | +18% |
| Kiến trúc & Code | 16% | 20% | +4% |
| Tài liệu & Báo cáo | 8% | 15% | +7% |
| Demo & Deployment | 2% | 5% | +3% |
| **TỔNG** | **6.4/10** | **8.3/10** | **+1.9** |

---

## 💡 LƯU Ý QUAN TRỌNG

### **Ưu tiên tuyệt đối:**
1. **POS Bán hàng** - Không có thì không phải hệ thống quán cafe
2. **KDS Bếp** - Thể hiện kỹ năng Real-time
3. **Quản lý Ca** - Thể hiện tư duy nghiệp vụ

### **Có thể bỏ qua nếu thiếu thời gian:**
- Web Order (QR Code)
- RBAC động
- Product Variants

### **Không được bỏ qua:**
- Figma Mockup
- Báo cáo Tốt nghiệp
- Video Demo
- Unit Tests

---

## 🚀 BƯỚC TIẾP THEO

**Ngay bây giờ (03/12):**
1. Đọc kỹ Roadmap
2. Chuẩn bị môi trường dev
3. Bắt đầu Tuần 1: Thiết kế Database Orders

**Mỗi tuần:**
- Hoàn thành đúng tiến độ
- Commit code lên GitHub
- Tạo video demo ngắn

**Cuối tháng 12:**
- Hoàn thiện 100%
- Nộp báo cáo
- Đạt điểm 8.3/10 ✅

---

**Người lập kế hoạch:** AI Assistant  
**Ngày:** 03/12/2025  
**Trạng thái:** 🚀 SẴN SÀNG THỰC HIỆN

**Chúc bạn thành công! 💪**
