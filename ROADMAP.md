# 🗺️ ROADMAP TỔNG THỂ — CaPheMinhHuu POS System
> Báo cáo tốt nghiệp 2026 | ASP.NET Core 8 + React Vite + SQL Server

---

## 📐 KIẾN TRÚC TỔNG QUAN

### N-Tier Architecture (Bất di bất dịch)
```
Controller → Service → Repository → DbContext → Database
```

### Dependency Rule
```
✅ Controller  → IService       (không biết DbContext)
✅ Service     → IRepository    (không biết DbContext)
✅ Repository  → DbContext      (DUY NHẤT được dùng ApplicationDbContext)
✅ Filter      → IRepository    (không inject DbContext trực tiếp)
```

### Tech Stack
```
Backend  : ASP.NET Core 8, EF Core 8, SQL Server
Auth     : JWT (4h) + Refresh Token Rotation (7d) + BCrypt
Real-time: SignalR
Frontend : React 18 + Vite + MUI + TailwindCSS + Recharts
Deploy   : Vercel (Frontend) + Backend (TBD)
Domain   : huuminh.cloud (Internal) | capheminhhuu.store (Customer)
```

---

## 🔄 LUỒNG DỮ LIỆU CHUẨN

### Request Flow
```
User (Browser)
    ↓
React Frontend
    ↓
Axios Interceptor (gắn JWT Token)
    ↓
ASP.NET API Controller
    ↓ (Authorize + Validate)
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
EF Core → SQL Server
    ↓
Response ngược lại
```

### Realtime Flow (SignalR)
```
Cashier tạo đơn
    ↓
OrderService → KitchenHub.SendAsync()
    ↓
WebSocket push → Kitchen KDS
    ↓
Kitchen cập nhật trạng thái
    ↓
WebSocket push → Cashier nhận thông báo
```

### Auth Flow
```
Login → JWT (4h) + Refresh Token (7d)
    ↓
Request → Axios gắn Bearer Token
    ↓
401 → Auto refresh token
    ↓
Refresh hết hạn → Force logout → Redirect login
```

---

## 📁 CẤU TRÚC THƯ MỤC CHUẨN

### Backend
```
CaPheMinhHuu/
├── Controllers/             ← API endpoints, authorize, validate input
├── DTOs/                    ← Data Transfer Objects (không phải Model)
│   ├── Auth/
│   ├── Order/
│   ├── Customer/            ← (thêm mới)
│   ├── Otp/                 ← (thêm mới)
│   └── ...
├── Models/                  ← DB Entities (EF Core)
├── Interfaces/
│   ├── I*Repository.cs      ← 16 repo interfaces
│   └── I*Service.cs         ← 13 service interfaces
├── Services/Implements/     ← Business Logic
├── Repositories/Implements/ ← Data Access (DbContext ở đây)
├── Data/
│   └── ApplicationDbContext.cs
├── Hubs/                    ← SignalR
├── Middleware/
└── Migrations/
```

### Frontend Internal (huuminh.cloud)
```
capheminhhuu-internal/src/
├── common/
│   ├── components/ProtectedRoute.jsx
│   ├── services/authService.js
│   └── utils/
│       ├── axiosCustomize.js     ← Interceptor + Auto refresh
│       └── signalRConnection.js  ← SignalR client
└── modules/
    ├── auth/
    ├── admin/
    ├── cashier/
    └── kitchen/
```

### Frontend Customer (capheminhhuu.store)
```
capheminhhuu-customer/src/
├── common/
└── modules/
    └── customer/
        ├── layout/LayoutCustomer.jsx
        ├── pages/
        │   ├── Menu.jsx
        │   ├── Cart.jsx
        │   ├── CustomerLogin.jsx
        │   ├── OrderTracking.jsx
        │   ├── Profile.jsx
        │   └── PaymentCallback.jsx
        ├── components/
        │   ├── OtpInput.jsx
        │   ├── OrderTimeline.jsx
        │   └── CartDrawer.jsx
        └── services/
            ├── customerAuthService.js
            ├── menuService.js
            └── paymentService.js
```

---

## 📋 PHẦN 1 — POS CORE FIX

### 1.1 Order System
**Vấn đề & Fix:**
```
❌ GetByDateAsync thiếu ThenInclude(Product)
   → Fix: Thêm .ThenInclude(oi => oi.Product)
   → File: OrderRepository.cs

❌ OrderCode luôn rỗng ""
   → Fix: Generate trong CreateOrderAsync
   → Format: "MH-{yyyyMMdd}-{Random 4 số}"
   → File: OrderService.cs

❌ State Machine không validate
   → Fix: Dictionary<string, string[]> _allowedTransitions
   → Transitions: Pending→Preparing→Ready→Served→Completed
   → Validate trong Service, Repository chỉ update thuần túy
   → File: OrderService.cs

❌ TableNumber (int) thay vì TableId (FK)
   → Fix: Thêm TableId nullable vào Order + Migration
   → Khi tạo đơn: UpdateTableStatus → Occupied
   → Khi Complete/Cancel: UpdateTableStatus → Empty
   → File: Order.cs + OrderService.cs + Migration

❌ Không RestoreStock khi hủy đơn
   → Fix: Trong UpdateOrderStatusAsync khi Cancelled
   → Truyền List<OrderItem> vào RestoreStockForOrderAsync
   → IngredientService không inject IOrderRepository
   → File: IIngredientService.cs + IngredientService.cs
```

**Lưu ý Pattern:**
```
State Machine = Business Logic → nằm trong Service
Repository.UpdateStatusAsync() = chỉ update, không validate
RestoreStock nhận List<OrderItem> (không nhận orderId)
→ Tránh circular dependency
```

**Known Limitation:**
```
Transaction chưa atomic (CreateOrder + DeductStock)
→ Cần Unit of Work Pattern để giải quyết đúng
→ Ghi vào báo cáo: "Hướng phát triển"
```

---

### 1.2 Cashier Module Fix

**Vấn đề & Fix:**
```
❌ Logic nằm hết trong CashierPOS.jsx
   → Fix: Tách ra CartPanel.jsx riêng biệt

❌ Gửi tableNumber thay tableId
   → Fix: dto.tableId = selectedTable?.id

❌ Không refetch tables sau tạo đơn
   → Fix: Gọi fetchTables() sau createOrder thành công

❌ Không có SignalR realtime cho Cashier
   → Fix: Lắng nghe OrderStatusUpdated
   → Toast khi Kitchen báo Ready: "Bàn X món đã xong!"

❌ Không có ghi chú món
   → Fix: Thêm Note vào OrderItem
   → Migration: OrderItem.Note (string nullable)
```

**Component Structure sau khi tách:**
```
CashierPOS.jsx (Orchestrator)
├── State: products, categories, tables
├── Load data
└── Pass props xuống components

CartPanel.jsx (Cart Logic)
├── State: cart, selectedTable, customerInfo
├── Table selector (realtime update)
├── Cart items + ghi chú từng món
└── Submit order

ProductGrid.jsx (hiện có)
CategoryTabs.jsx (hiện có)
```

---

### 1.3 Kitchen KDS Fix
```
❌ 400 error khi cập nhật trạng thái
   → Nguyên nhân: State Machine không khớp
   → Fix: Sau khi fix State Machine backend → tự hết

❌ Hiển thị tableNumber thay tableId
   → Fix: order.tableId ? order.tableName : "Mang đi"

□  Thêm hiển thị ghi chú từng món
□  Sort theo thời gian chờ (đơn lâu nhất lên đầu)
```

---

### 1.4 Table & Area Management

**Backend (đã có nền tảng):**
```
✅ Area.cs model
✅ Table.cs model (có AreaId)
✅ TableController (CRUD + UpdateStatus)
✅ TableService.UpdateStatusAsync (validate Empty/Occupied/Reserved)

□  ITableRepository.GetAllWithAreaAsync()
   → Include Area trong query
```

**Frontend Cashier:**
```
TableManagement.jsx nâng cấp:
□  Hiển thị theo Tab Area (không phải list phẳng)
□  Màu trạng thái realtime (SignalR update)
□  Click bàn Empty → chọn để tạo đơn
□  Click bàn Occupied → xem đơn hiện tại
```

**Frontend Admin:**
```
QuanLyKhuVuc.jsx (trang mới):
□  CRUD Area (thêm/sửa/xóa/bật-tắt)
□  CRUD Table theo Area
□  Bật/tắt Area theo mùa/sự kiện
```

---

### 1.5 Admin Dashboard

**4 Trụ cột cần hiển thị:**
```
💰 Doanh thu:
□  Hôm nay / Tuần / Tháng
□  So sánh kỳ trước (% tăng/giảm)
□  Doanh thu theo khung giờ (chart)
□  Doanh thu theo ca làm việc

🛍️ Hàng hóa:
□  Top món bán chạy
□  Cảnh báo tồn kho thấp (< MinStock)
□  Lịch sử nhập/xuất kho

👥 Nhân sự:
□  Thống kê ca theo nhân viên
□  Số ca / tháng
□  Audit log (ai làm gì)

⚙️ Vận hành:
□  Tỷ lệ lấp đầy bàn theo giờ
□  Thời gian xử lý đơn trung bình
□  Tỷ lệ hủy đơn
```

---

## 📡 PHẦN 2 — SIGNALR NÂNG CẤP

### 2.1 AppHub (Gộp KitchenHub + ShiftHub)

**Lý do gộp:**
```
2 Hub riêng → 2 WebSocket connection/client
1 AppHub    → 1 WebSocket connection/client
            → Tiết kiệm tài nguyên
            → Quản lý tập trung
```

**JWT Config cho SignalR (CRITICAL):**
```csharp
// Program.cs — PHẢI có, không thì Context.User = null
.AddJwtBearer(options => {
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context => {
            var token = context.Request.Query["access_token"];
            if (!string.IsNullOrEmpty(token))
                context.Token = token;
            return Task.CompletedTask;
        }
    };
});

// Frontend — gửi token qua query string
.withUrl("/appHub?access_token=" + token)
```

**Group Matrix:**
```
Group "Broadcast"     → Admin + Cashier + Kitchen (tất cả)
Group "Operations"    → Cashier + Kitchen
Group "Admin"         → Admin only
Group "Cashier"       → Cashier only
Group "Kitchen"       → Kitchen only
Group "User_{id}"     → Cá nhân (shift events)
Group "Order_{code}"  → Guest tracking đơn hàng
```

**Event Routing:**
```
Event                     → Group nhận
──────────────────────────────────────────
ReceiveNewOrder           → Operations
OrderStatusUpdated        → Operations
TableStatusUpdated        → Operations
ShiftPendingApproval      → Admin
ShiftApproved/Rejected    → User_{id}
LowStockAlert             → Broadcast
SystemAlert               → Broadcast
OrderTracking update      → Order_{orderCode}
```

### 2.2 LowStockAlert Trigger
```csharp
// IngredientService.DeductStockFIFOAsync() — sau khi trừ kho
var remaining = await _batchRepo.GetTotalStockAsync(ingredientId);
if (remaining <= ingredient.MinStock)
{
    await _hub.Clients.Group("Broadcast")
        .SendAsync("LowStockAlert", new {
            ingredientName,
            remaining,
            unit = ingredient.BaseUnit
        });
}
```

**Lưu ý Pattern:**
```
AppHub thay thế KitchenHub + ShiftHub
→ Update tất cả Service inject hub mới
→ Update Program.cs MapHub<AppHub>("/appHub")
→ Update signalRConnection.js → kết nối 1 hub duy nhất
→ Guest dùng OrderCode thay JWT để join group
```

---

## 👤 PHẦN 3 — CUSTOMER & QR FLOW BACKEND

### 3.1 Thứ tự Implementation (quan trọng)
```
1. DTOs (không dependency)
2. User model update + Migration
3. IJwtService + JwtService (tách từ AuthService)
4. IOtpRepository + OtpRepository
5. IOtpService (update) + OtpService
6. ICustomerService + CustomerService
7. GoogleAuthService
8. CustomerController
9. GuestOrderController
10. Program.cs DI registration
```

### 3.2 User Model Update
```csharp
// Thêm vào User.cs
public int LoyaltyPoints { get; set; } = 0;

// Sửa PasswordHash — nullable cho Customer OTP-only
[StringLength(255)]
public string? PasswordHash { get; set; }  // bỏ [Required]

// Username cho Customer = email (auto-assign khi tạo account)
```

### 3.3 IJwtService (tách từ AuthService)
```
Lý do tách:
AuthService.GenerateJwtToken() đang là private method
CustomerService cần generate JWT sau verify OTP
→ Không thể duplicate code
→ Tách ra IJwtService dùng chung

Interface:
IJwtService
├── string GenerateAccessToken(User user)
└── RefreshToken GenerateRefreshToken(int userId, string? ip)

Inject vào:
✅ AuthService (thay thế private method hiện tại)
✅ CustomerService (mới)
```

### 3.4 OTP System

**OtpVerifyResult Enum (đặt trong DTOs/Otp/):**
```csharp
public enum OtpVerifyResult
{
    Success,
    InvalidCode,         // Sai mã
    Expired,             // Hết hạn 5 phút
    MaxAttemptsReached,  // Quá 5 lần thử
    AlreadyUsed          // Đã dùng rồi
}
```

**IOtpRepository:**
```csharp
Task<OtpCode?> GetActiveOtpAsync(string target, string purpose);
Task AddAsync(OtpCode otp);
Task UpdateAsync(OtpCode otp);
Task DeleteExpiredAsync();
```

**OtpService Logic:**
```
GenerateOtpAsync():
1. CleanExpiredOtps() trước (dọn DB)
2. Random 6 số
3. ExpiresAt = Now + 5 phút
4. Save vào DB
5. Gọi EmailService.SendOtpAsync()

VerifyOtpAsync() → OtpVerifyResult:
1. GetActiveOtp() → null = InvalidCode
2. ExpiresAt < Now = Expired
3. AttemptCount >= 5 = MaxAttemptsReached
4. Code sai → AttemptCount++ → InvalidCode
5. Code đúng → IsUsed = true → Success
```

**Lưu ý Pattern:**
```
OtpVerifyResult enum thay vì bool
→ Caller biết chính xác lý do fail
→ Frontend hiển thị đúng message

CleanExpired gọi trong GenerateOtp
→ Known limitation: nhiều request cùng lúc = nhiều lần delete
→ Hướng phát triển: IHostedService cleanup mỗi 30 phút
```

### 3.5 CustomerService Logic
```
SendOtpAsync(email):
→ Gọi OtpService.GenerateOtpAsync()

VerifyOtpAndRegisterAsync(dto):
→ Gọi OtpService.VerifyOtpAsync()
→ Nếu không Success → throw với OtpVerifyResult reason
→ Email đã tồn tại + verified → login luôn (không tạo mới)
→ Email mới + chọn đăng ký:
   → Username = email
   → PasswordHash = null (Customer không dùng password)
   → Role = "Customer"
   → IsEmailVerified = true
   → Tạo User → IJwtService.GenerateAccessToken()
→ Email mới + không đăng ký:
   → Không tạo User (guest order)
   → Order lưu email đính kèm

GetProfileAsync(userId):
→ Lấy User + LoyaltyPoints + lịch sử đơn
```

### 3.6 Google OAuth
```
Backend:
□  NuGet: Google.Apis.Auth
□  appsettings.json: GoogleAuth:ClientId
□  GoogleAuthService:
   → ValidateAsync(idToken) → GoogleJsonWebSignature.Payload
   → Lấy email, name, googleId, picture từ payload
   → Tìm User theo GoogleId trong DB
   → Chưa có → tạo mới (không cần OTP, đã verified bởi Google)
   → Đã có → login luôn
   → IJwtService.GenerateAccessToken() → trả JWT

Frontend:
□  @react-oauth/google package
□  GoogleOAuthProvider bọc ngoài App
□  Nút "Sign in with Google" (GoogleLogin component)
□  Nhận credential.credential (Google ID Token)
□  POST /api/customer/google-login { idToken }
```

### 3.7 Controllers

**CustomerController:**
```
[Route("api/customer")]
POST /send-otp      [AllowAnonymous] → { email }
POST /verify-otp    [AllowAnonymous] → { email, code, wantRegister }
POST /google-login  [AllowAnonymous] → { idToken }
GET  /profile       [Authorize(Roles="Customer")]
```

**GuestOrderController:**
```
[Route("api/guest")]
POST /order              [AllowAnonymous]
   → GuestOrderCreateDto: { tableId?, email?, items[] }
   → Gọi OrderService.CreateGuestOrderAsync()
   → Gửi email xác nhận nếu có email

GET /order/{orderCode}   [AllowAnonymous]
   → Track đơn theo OrderCode
   → IOrderRepository cần thêm GetByOrderCodeAsync()
```

**Bổ sung vào IOrderService + IOrderRepository:**
```csharp
// IOrderService
Task<OrderViewDto> CreateGuestOrderAsync(GuestOrderCreateDto dto);

// IOrderRepository
Task<Order?> GetByOrderCodeAsync(string orderCode);
```

### 3.8 Payment VNPAY
```
appsettings.json:
"VnPay": {
  "TmnCode": "...",
  "HashSecret": "...",
  "BaseUrl": "https://sandbox.vnpayment.vn/...",
  "ReturnUrl": "https://capheminhhuu.store/payment/callback"
}

IPaymentService:
→ CreateVnPayUrlAsync(orderId, amount, orderCode) → URL string
→ ProcessCallbackAsync(IQueryCollection query) → PaymentResultDto
→ GetByOrderIdAsync(orderId) → Payment?

Flow:
POST /api/payment/vnpay/create-url [Authorize hoặc AllowAnonymous]
→ Tạo URL thanh toán → Frontend redirect

GET /api/payment/vnpay/callback [AllowAnonymous]
→ VNPAY redirect về đây
→ Verify hash signature
→ Update Payment.Status
→ Update Order.Status → Completed
→ LoyaltyPoints += (amount / 10000)
→ EmailService.SendPaymentReceiptAsync()
```

---

## 🌐 PHẦN 4 — FRONTEND CUSTOMER MODULE

### 4.1 Tách 2 Vercel Project

**Repo 1 — Internal (huuminh.cloud):**
```
Giữ nguyên code hiện tại
modules: admin, cashier, kitchen, auth
```

**Repo 2 — Customer (capheminhhuu.store):**
```
Code mới hoàn toàn
modules: customer
Route / → Menu.jsx (AllowAnonymous)
```

**Google OAuth Console setup:**
```
Authorized JavaScript origins:
├── http://localhost:5173
└── https://capheminhhuu.store

Authorized redirect URIs:
├── http://localhost:5173
└── https://capheminhhuu.store
```

**axiosCustomize.js cho Customer repo:**
```javascript
// Chỉ dùng customerToken, không có adminToken/staffToken
const token = localStorage.getItem("customerToken");
```

### 4.2 QR Flow Frontend Hoàn Chỉnh
```
Khách quét QR bàn số 3
        ↓
URL: https://capheminhhuu.store/menu?tableId=3
        ↓
Menu.jsx load (AllowAnonymous)
→ GET /api/customer/menu/products
→ GET /api/customer/menu/categories
→ Hiển thị theo danh mục, tìm kiếm
→ Thêm vào giỏ hàng
        ↓
Bấm "Đặt món"
        ↓
Popup xác thực:
┌────────────────────────────────┐
│  Nhập email để nhận xác nhận  │
│  [________________________]   │
│                               │
│  [Gửi OTP]  [Google Login]    │
│                               │
│  "Đăng ký thành viên để       │
│   nhận ưu đãi?"               │
│  [Có, đăng ký]  [Bỏ qua]     │
└────────────────────────────────┘
        ↓
OTP Flow:              Google Flow:
Nhập 6 số OTP          Chọn tài khoản Google
OtpInput.jsx           → Tự động xác thực
Verify → JWT           → JWT
        ↓
POST /api/guest/order hoặc /api/customer/order
        ↓
OrderTracking.jsx (SignalR - Group "Order_{orderCode}")
→ Timeline: Pending → Preparing → Ready → Served
        ↓
Thanh toán:
[Tiền mặt - báo nhân viên]  [Thanh toán VNPAY]
        ↓ (VNPAY)
Redirect → VNPAY payment page
        ↓
PaymentCallback.jsx (VNPAY redirect về)
→ Hiển thị kết quả thanh toán
        ↓
Email xác nhận đơn hàng tự động
```

---

## 🎁 PHẦN 5 — LOYALTY & MARKETING

### 5.1 Loyalty Points
```
Trigger tích điểm:
→ Sau thanh toán thành công (VNPAY callback OK)
→ Chỉ áp dụng cho Customer có account
→ LoyaltyPoints += Math.Floor(totalAmount / 10000)
   VD: 50.000đ = 5 điểm

Hiển thị:
→ Profile.jsx: Tổng điểm + lịch sử tích/dùng
→ OrderTracking.jsx: "Bạn vừa tích được X điểm!"
```

### 5.2 Coupon System
```
Admin tạo coupon:
→ Code (VD: WELCOME10, SUMMER2026)
→ DiscountType: Percent hoặc Fixed
→ DiscountValue, MinOrderAmount, MaxDiscountAmount
→ MaxUsage, StartDate, EndDate

Khách áp dụng trong Cart:
→ Nhập mã → POST /api/coupon/validate
→ Response: { isValid, discountAmount, message }
→ Trừ vào tổng tiền khi tạo đơn

Email marketing:
→ Admin gửi coupon cho nhóm khách hàng
→ IEmailService.SendMarketingEmailAsync()
```

### 5.3 Email Automation
```
Welcome Email    → Ngay sau đăng ký thành viên
Retention Email  → Sau 30 ngày không có đơn mới
Birthday Email   → 7 ngày trước sinh nhật (cần field DateOfBirth)
Loyalty Reward   → Khi đạt mốc điểm (VD: 50, 100, 200 điểm)
```

---

## 📊 PHẦN 6 — BÁO CÁO & DEMO

### Known Limitations
```
1. Transaction chưa atomic
   → CreateOrder + DeductStock là 2 bước riêng
   → Cần Unit of Work Pattern để atomic
   → Rủi ro thấp trong môi trường quán nhỏ (1 ca < 100 đơn)

2. OTP Cleanup thủ công
   → Chạy trong GenerateOtp thay vì Background Service
   → Hướng phát triển: IHostedService cleanup mỗi 30 phút

3. SignalR chưa gộp AppHub
   → Hiện có 2 hub riêng (KitchenHub + ShiftHub)
   → Hướng phát triển: AppHub tập trung + Group matrix

4. Google OAuth phạm vi hạn chế
   → Model đã chuẩn bị (GoogleId, FacebookId, AuthProvider)
   → Hướng phát triển: Facebook Login, Apple Login
```

### Hướng Phát Triển
```
Technical:
→ Unit of Work Pattern (transaction atomic)
→ AppHub với Notification System đầy đủ
→ Background Service (OTP cleanup, Email queue)
→ Redis Cache (menu, products - giảm DB query)
→ Docker containerization

Business:
→ Mobile App (React Native - dùng lại API)
→ Báo cáo nâng cao (Excel/PDF export)
→ Tích hợp máy in hóa đơn nhiệt
→ AI gợi ý món theo lịch sử đặt hàng
→ Reservation system (đặt bàn trước)
→ Multi-branch (nhiều chi nhánh)
```

### Demo Flow
```
Màn hình 1 — huuminh.cloud (nội bộ):
[Admin] Dashboard → Quản lý menu/kho/nhân viên/khu vực
[Cashier] Đăng nhập → Mở ca → POS bán hàng → Đóng ca
[Kitchen] KDS → Nhận đơn realtime → Cập nhật trạng thái

Màn hình 2 — capheminhhuu.store (khách hàng):
Quét QR bàn → Xem menu → Chọn món → Giỏ hàng
→ OTP/Google Login → Đặt đơn thành công
→ Track đơn realtime (Pending→Preparing→Ready)
→ Thanh toán VNPAY → Email xác nhận
```

---

## ✅ MASTER CHECKLIST

### Phần 1 — POS Core
```
□ OrderRepository: ThenInclude Product fix
□ OrderService: OrderCode generate
□ OrderService: State Machine (Pending→Preparing→Ready→Served→Completed)
□ Order.cs + Migration: TableId FK nullable
□ OrderService: UpdateTableStatus khi tạo/hoàn thành/hủy đơn
□ IIngredientService: RestoreStockForOrderAsync(List<OrderItem>)
□ CashierPOS: Tách CartPanel.jsx (cart logic)
□ CashierPOS: Gửi tableId thay tableNumber
□ CashierPOS: Refetch tables sau tạo đơn
□ CashierPOS: SignalR nhận OrderStatusUpdated
□ OrderItem.Note: Migration + UI ghi chú món
□ KDS: Fix 400 error (tự hết sau State Machine fix)
□ KDS: Hiển thị ghi chú + sort theo thời gian
□ TableManagement: Hiển thị theo Tab Area
□ Admin: QuanLyKhuVuc.jsx (CRUD Area + Table)
□ Dashboard: 4 trụ cột đầy đủ
```

### Phần 2 — SignalR
```
□ Program.cs: JWT config cho SignalR (OnMessageReceived)
□ AppHub.cs: Group matrix (Broadcast/Operations/Admin/User_{id}/Order_{code})
□ AppHub.cs: OnConnectedAsync với role-based group join
□ Services: Update inject IHubContext<AppHub>
□ Program.cs: MapHub<AppHub>("/appHub")
□ signalRConnection.js: Kết nối 1 hub + tất cả event mới
□ LowStockAlert: Trigger trong IngredientService.DeductStock
□ Frontend: Toast notification cho LowStockAlert
```

### Phần 3 — Customer Backend
```
□ User.cs: PasswordHash nullable + LoyaltyPoints field
□ Migration: CustomerModule (User + OrderItem.Note)
□ IJwtService interface + JwtService implement
□ AuthService: Refactor dùng IJwtService
□ DTOs/Otp/: OtpVerifyResult enum + OtpRequestDto
□ DTOs/Customer/: Register, Verify, Profile DTOs
□ DTOs/Order/: GuestOrderCreateDto
□ IOtpRepository + OtpRepository
□ IOtpService: VerifyOtp trả OtpVerifyResult
□ OtpService: implement đầy đủ
□ ICustomerService + CustomerService
□ IGoogleAuthService + GoogleAuthService
□ CustomerController: 4 endpoints
□ GuestOrderController: 2 endpoints
□ IOrderService: CreateGuestOrderAsync
□ IOrderRepository: GetByOrderCodeAsync
□ IPaymentService + PaymentService (VNPAY)
□ PaymentController: create-url + callback
□ Program.cs: DI registration tất cả services mới
□ appsettings.json: GoogleAuth + VnPay config
```

### Phần 4 — Customer Frontend
```
□ Tạo Repo mới: capheminhhuu-customer
□ Google OAuth Console: Thêm capheminhhuu.store vào origins
□ Setup @react-oauth/google
□ Menu.jsx (AllowAnonymous, load products + categories)
□ CustomerLogin.jsx (Tab OTP + Tab Google)
□ OtpInput.jsx (6 ô nhập tự động focus)
□ Cart.jsx (review giỏ hàng + nhập ghi chú)
□ OrderTracking.jsx (SignalR Group Order_{code})
□ Profile.jsx (thông tin + loyalty points + lịch sử)
□ PaymentCallback.jsx (VNPAY redirect handler)
□ axiosCustomize.js (chỉ dùng customerToken)
□ Deploy Vercel + map domain capheminhhuu.store
□ Vercel env variables (VITE_API_URL, VITE_GOOGLE_CLIENT_ID)
```

### Phần 5 — Loyalty
```
□ LoyaltyPoints tích sau VNPAY callback OK
□ Hiển thị điểm trong OrderTracking + Profile
□ Coupon: Admin tạo + Khách áp dụng
□ POST /api/coupon/validate endpoint
□ Email: Welcome + Retention templates
```

### Phần 6 — Báo cáo
```
□ Viết Known Limitations (4 điểm)
□ Viết Hướng Phát Triển
□ Quay video demo (2 màn hình)
□ Chuẩn bị slide thuyết trình
□ Test toàn bộ flow trước ngày bảo vệ
```

---

*CaPheMinhHuu POS System — Báo cáo tốt nghiệp 2026*
*ASP.NET Core 8 + React Vite + SQL Server + SignalR + VNPAY*
