# AGENT.md — CaPheMinhHuu POS System
> Đọc file này trước khi làm BẤT CỨ điều gì trong dự án.

---

## ⚙️ TECH STACK

```
Backend  : ASP.NET Core 8, EF Core 8, SQL Server
Auth     : JWT (4h) + Refresh Token Rotation (7d) + BCrypt
Real-time: SignalR (KitchenHub, ShiftHub)
Frontend : React 18 + Vite + MUI + TailwindCSS + Recharts
```

---

## 🔒 KIẾN TRÚC N-TIER — BẤT DI BẤT DỊCH

```
Controller → Service → Repository → DbContext → Database
```

### Dependency Rules
| Layer | Được inject | KHÔNG được inject |
|-------|-------------|-------------------|
| Controller | IService | DbContext, Repository |
| Service | IRepository, IHubContext | DbContext |
| Repository | DbContext (ApplicationDbContext) | - |
| Filter (AuditLogActionFilter) | IRepository | DbContext |

### Vi phạm nghiêm trọng — KHÔNG BAO GIỜ làm:
- ❌ Controller inject DbContext
- ❌ Service inject DbContext
- ❌ Controller inject Repository trực tiếp
- ❌ Viết LINQ query trong Service (chỉ gọi IRepository method)
- ❌ Viết business logic trong Repository
- ❌ Repository gọi Service khác

---

## 📦 PATTERN DỮ LIỆU

### Luồng bắt buộc:
```
DB → Repository (trả Entity) → Service (map sang DTO) → Controller (trả DTO) → Frontend
```

### 3 loại object:
```
1. Entity (Model)  → ánh xạ trực tiếp DB → chỉ dùng trong Models/ và Repository
2. DTO             → trao đổi giữa layers → đặt trong DTOs/[Module]/
3. ViewModel       → chỉ dùng nếu cần aggregate nhiều DTO cho UI
```

### Quy tắc DTO:
- DTO KHÔNG chứa business logic
- Service map Entity → DTO (không dùng AutoMapper)
- Repository KHÔNG nhận hoặc trả DTO
- Tên file: `[Action][Module]Dto.cs` (VD: `OrderCreateDto.cs`, `OrderViewDto.cs`)

---

## 📁 CẤU TRÚC THƯ MỤC

### Backend: `CaPheMinhHuu/CaPheMinhHuu/`
```
Controllers/         ← 11 controllers
DTOs/[Module]/       ← Auth, Category, Dashboard, Email, Ingredient,
                        IngredientCategory, Order, Product, Recipe,
                        Shift, Staff, Table
Models/              ← 23 entities (BaseEntity, User, Product, Category,
                        Order, OrderItem, Table, Area, Shift,
                        Ingredient, Recipe, InventoryBatch, OtpCode,
                        Payment, Coupon, RefreshToken, LoginHistory,
                        AuditLog, Reservation, RequestTicket, HolidayConfig,
                        IngredientCategory, IngredientUnit)
Interfaces/          ← 29 interfaces (16 Repo + 13 Service)
Services/Implements/ ← 12 services + 1 filter (AuditLogActionFilter)
Repositories/Implements/ ← 15 repositories
Data/                ← ApplicationDbContext.cs (DbContext DUY NHẤT)
Hubs/                ← KitchenHub.cs, ShiftHub.cs
Middleware/          ← GlobalExceptionMiddleware.cs
```

### Frontend: `capheminhhuu.ui/src/`
```
common/
  components/        ← ProtectedRoute.jsx
  context/           ← ThemeContext.jsx
  services/          ← authService.js
  utils/             ← axiosCustomize.js, signalRConnection.js
modules/
  auth/              ← AdminLogin, StaffLogin, PortalSelection, ChangePassword
  admin/
    components/      ← Modals, Navbar, Sidebar
    layout/          ← LayoutAdmin.jsx
    pages/           ← AdminDashboard, QuanLy* pages
    services/        ← *Service.js files
  cashier/
    components/      ← CartPanel, CategoryTabs, PaymentPanel, ProductGrid
    layout/          ← LayoutCashier.jsx
    pages/           ← CashierPOS, OrderList, OrderDetail,
                        TableManagement, ShiftOpen, ShiftClose, ShiftReport
    services/        ← orderService, shiftService, tableService
  kitchen/
    pages/           ← KDS_Bep.jsx
```

---

## 🔑 CONVENTIONS

### Backend naming:
```
Interface    : I[Entity]Repository.cs / I[Entity]Service.cs
Repository   : [Entity]Repository.cs  (trong Repositories/Implements/)
Service      : [Entity]Service.cs     (trong Services/Implements/)
DTO          : [Action][Module]Dto.cs
Controller   : [Module]Controller.cs
```

### Frontend naming:
```
Component    : PascalCase.jsx
Service      : camelCaseService.js
Hook         : useCamelCase.js
Page         : PascalCase.jsx (trong pages/)
```

### API Response pattern:
```csharp
// Success
return Ok(dto);
return Ok(new { message = "...", data = dto });

// Error — dùng GlobalExceptionMiddleware xử lý
throw new Exception("message");
```

---

## ⚠️ KNOWN ISSUES (cần fix theo thứ tự)

### Phần 1 — POS Core (ưu tiên cao nhất):
1. `OrderRepository.cs` — GetByDateAsync thiếu `.ThenInclude(oi => oi.Product)`✅
2. `OrderService.cs` — OrderCode luôn rỗng, cần generate `"MH-{yyyyMMdd}-{4 số random}"`✅
3. `OrderService.cs` — State Machine chưa validate transitions✅
   - Allowed: `Pending→Preparing→Ready→Served→Completed`, `Pending→Cancelled`, `Preparing→Cancelled`✅
4. `Order.cs` — Dùng `TableNumber` (int) thay vì `TableId` (FK) → cần Migration✅
5. `OrderService.cs` — Không RestoreStock khi hủy đơn✅
6. `CartPanel.jsx` — Gửi `tableNumber` thay vì `tableId`
7. `CashierPOS.jsx` — Logic cart đang nằm trong page, cần tách ra `CartPanel.jsx`

### Known Limitations (ghi vào báo cáo):
- Transaction chưa atomic (CreateOrder + DeductStock là 2 bước riêng)
- OTP cleanup thủ công (chạy trong GenerateOtp thay vì Background Service)
- SignalR chưa gộp thành AppHub

---

## 🚦 STATE MACHINE — ORDER STATUS

```
Pending → Preparing → Ready → Served → Completed
Pending → Cancelled
Preparing → Cancelled
```

Logic State Machine LUÔN nằm trong **Service**, KHÔNG trong Repository hay Controller.

```csharp
// Pattern chuẩn trong OrderService.cs
private static readonly Dictionary<string, string[]> _allowedTransitions = new()
{
    { "Pending",    new[] { "Preparing", "Cancelled" } },
    { "Preparing",  new[] { "Ready", "Cancelled" } },
    { "Ready",      new[] { "Served" } },
    { "Served",     new[] { "Completed" } },
    { "Completed",  Array.Empty<string>() },
    { "Cancelled",  Array.Empty<string>() }
};
```

---

## 🌐 SIGNALR

### Hubs hiện tại:
- `KitchenHub` — push đơn mới → KDS
- `ShiftHub`   — notify shift events

### Inject pattern trong Service:
```csharp
// Constructor inject
private readonly IHubContext<KitchenHub> _kitchenHub;
```

### Frontend connect:
```javascript
// signalRConnection.js
import { startConnection, onOrderStatusUpdated, stopConnection }
  from '../../common/utils/signalRConnection'
```

---

## 🔐 AUTH

```
Admin/Staff: JWT (4h) + Refresh Token Rotation (7d)
Token: Bearer trong Authorization header
Refresh: POST /api/auth/refresh với refreshToken
Force logout: Refresh hết hạn → redirect login
```

### Roles:
```
"Admin"   → full access
"Staff"   → cashier + kitchen
"Manager" → (nếu có)
```

---

## 📋 QUY TRÌNH LÀM VIỆC VỚI CLAUDE

1. **Đọc file liên quan trước** khi đề xuất thay đổi
2. **Báo cáo vấn đề phát hiện** trước khi viết code
3. **Chờ xác nhận** trước khi apply bất kỳ thay đổi nào
4. **Không tự ý** thêm package, thay đổi cấu trúc folder, xóa file
5. **Migration** — chỉ tạo sau khi Model đã được confirm
6. **Một việc một lần** — không fix nhiều thứ cùng lúc

---

## 📌 ROADMAP (thứ tự ưu tiên)

```
Phase 1: POS Core Fix          ← ĐANG LÀM
Phase 2: SignalR AppHub
Phase 3: Customer Backend (OTP, JWT, Google OAuth, VNPAY)
Phase 4: Customer Frontend (capheminhhuu.store)
Phase 5: Loyalty & Marketing
```

---

*CaPheMinhHuu POS — Báo cáo tốt nghiệp 2026*
*ASP.NET Core 8 + React Vite + SQL Server + SignalR*
