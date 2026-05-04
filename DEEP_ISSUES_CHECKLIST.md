# 🔍 DANH SÁCH VẤN ĐỀ CÒN LẠI — CaPheMinhHuu

> Cập nhật: 29/04/2026 — Sau khi hoàn thành 10 tasks (OrderService, KDS, POS toast, SecurityDashboard route, Security Headers...)

---

## 🔴 BACKEND — Nghiêm trọng & Cần thiết

### B1. ~~4~~ → 1 Controller thiếu `[Authorize]` class-level

| Controller | Có `[Authorize]` ở class? | Ghi chú |
|-----------|--------------------------|--------|
| `OrderController` | ✅ Có | `[Authorize]` L11 |
| `AuthController` | ✅ Có | — |
| `CategoryController` | ✅ Có | — |
| `ProductController` | ✅ Có | — |
| `TableController` | ✅ Có | — |
| `StaffController` | ✅ Có | `[Authorize(Roles = "Admin")]` L9 |
| `IngredientController` | ✅ Có | `[Authorize(Roles = "Admin")]` L10 |
| `RecipeController` | ✅ Có | `[Authorize(Roles = "Admin")]` L10 |
| **`ShiftController`** | ❌ **THIẾU** | Các action có `[Authorize(Roles)]` nhưng class-level thiếu |

**Cách fix:** Thêm `[Authorize]` ở class level cho ShiftController.

---

### B2. `DateTime.Now` → nên dùng `DateTime.UtcNow` (hoặc giữ nhất quán)

**6 Models** dùng `DateTime.Now` làm default:
- `BaseEntity.cs` L7 — `CreatedDate`
- `Order.cs` L12 — `OrderDate`
- `AuditLog.cs` L9 — `Timestamp`
- `LoginHistory.cs` L15 — `LoginTime`
- `HolidayConfig.cs` L20 — `CreatedAt`
- `RequestTicket.cs` L36 — `CreatedAt`

**8+ chỗ trong Services** dùng `DateTime.Now`:
- `ShiftService.cs` (3 chỗ)
- `OrderService.cs` (1 chỗ)
- `ProductService.cs` (2 chỗ)
- `CategoryService.cs` (1 chỗ)
- `AuthService.cs` (5 chỗ)
- `IngredientService.cs` (5 chỗ)
- `AuditLogActionFilter.cs` (1 chỗ)

> **Lưu ý:** Nếu deploy lên server UTC (Azure, AWS...) → thời gian sẽ lệch so với VN. Có 2 lựa chọn:
> - **Option A (đơn giản):** Giữ `DateTime.Now` — chấp nhận server chạy timezone VN
> - **Option B (chuẩn):** Đổi thành `DateTime.UtcNow` toàn bộ + frontend tự convert sang local

---

### B3. Thiếu Global Exception Handler

**Hiện trạng:** Mỗi controller tự `try/catch`, return format không nhất quán.  
**Cần:** Middleware bắt exception tập trung → trả JSON chuẩn `{ success, message, errors }`.

**File:** `Program.cs` — Tạo `Middleware/GlobalExceptionMiddleware.cs` rồi thêm:
```csharp
app.UseMiddleware<GlobalExceptionMiddleware>();
```

---

### B4. Thiếu `ILogger` cho các Service khác

**Đã có:** `OrderService` ✅  
**Chưa có:**
- `ShiftService` — cần log mở/đóng ca, báo cáo Z
- `ProductService` — cần log CRUD sản phẩm
- `CategoryService` — cần log CRUD danh mục
- `IngredientService` — cần log nhập kho, trừ kho, cảnh báo hết hạn
- `AuthService` — cần log login/logout/lockout

---

### B5. `ShiftService` vi phạm N-Tier (dùng DbContext trực tiếp)

**Hiện trạng:** `ShiftService` không dùng Repository mà inject `ApplicationDbContext` trực tiếp.  
**Chuẩn:** Tạo `IShiftRepository` + `ShiftRepository` rồi inject vào service.

> Đây là vấn đề kiến trúc, ảnh hưởng điểm N-Tier compliance trong bài báo cáo.

---

### B6. `Order.Status` default không nhất quán

**Model:** `Order.cs` L11 → `Status = "Chờ xử lý"` (tiếng Việt)  
**Service:** `OrderService.cs` L54 → `Status = "Pending"` (tiếng Anh)  
**Frontend:** `statusConfig` map theo `"Pending"`, `"Preparing"`, `"Ready"`...

→ Model default **không bao giờ được dùng** vì Service luôn gán `"Pending"`. Nhưng nếu ai đó tạo Order qua DB seed → status = `"Chờ xử lý"` → frontend không nhận diện.

**Fix:** Đổi `Order.cs` L11 thành `Status = "Pending"` cho nhất quán.

---

## 🟡 FRONTEND — Cần hoàn thiện

### F1. `AdminDashboard.jsx` — Chỉ là menu điều hướng, không có thống kê

**Hiện trạng:** 4 card link tới các trang quản lý, không có data thật.  
**Cần:** Dashboard thật với:
- Tổng doanh thu hôm nay / tuần / tháng
- Số đơn hàng hôm nay
- Cảnh báo kho sắp hết
- Top sản phẩm bán chạy
- Biểu đồ doanh thu (chart)

---

### F2. `Sidebar.jsx` — Thiếu link SecurityDashboard

**Hiện trạng:** 7 menu items, không có link tới `/admin/baomat`.  
**Cần:** Thêm 1 `ListItemButton` cho SecurityDashboard (icon: `SecurityIcon`).

---

### F3. 2 Layout files rỗng (0 byte)

| File | Size | Hành động |
|------|------|-----------|
| `layouts/LayoutCustomer.jsx` | 0 byte | Xóa hoặc implement khi làm Customer module |
| `layouts/LayoutKitchen.jsx` | 0 byte | Xóa hoặc implement (wrap KDS với header/auth) |

---

### F4. `pages/auth/` — Folder rỗng

**Hiện trạng:** Folder tồn tại nhưng không có file nào bên trong.  
**Hành động:** Xóa folder nếu không dùng.

---

### F5. KDS cần layout/route riêng cho Kitchen staff

**Hiện trạng:** KDS_Bep.jsx chạy trực tiếp, không có layout wrap (auth check, header...).  
**Cần xem xét:**
- Kitchen staff login → redirect tới KDS
- Có cần LayoutKitchen với header hiển thị tên bếp, nút logout?

---

### F6. Navbar notification badge hardcode

**File:** `Navbar.jsx` L64 → `badgeContent={4}` — Số thông báo cố định = 4.  
**Cần:** Lấy từ API hoặc ẩn đi nếu chưa implement notification system.

---

## 🟢 DATA / UX — Polish

### D1. Migration cho Order nullable fields

**Trạng thái:** Đã đổi model → cần tạo migration:
```bash
dotnet ef migrations add OrderFieldsNullable
dotnet ef database update
```

---

### D2. Responsive test cho Cashier trên tablet

**Hiện trạng:** POS layout fixed height, chưa test trên tablet (1024x768).  
**Cần:** Kiểm tra grid sản phẩm + cart panel trên tablet landscape.

---

## 💡 NICE-TO-HAVE (Bonus điểm ấn tượng)

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| N1 | **Health Check endpoint** `GET /health` | 15 phút | Chuyên nghiệp |
| N2 | **Unit Tests** cho OrderService (xUnit + Moq) | 2-3 giờ | Điểm cao |
| N3 | **Pagination** cho GetAll APIs | 1 giờ/endpoint | Scalability |
| N4 | **Serilog** structured logging → file/JSON | 1 giờ | Production-ready |
| N5 | **API Versioning** `/api/v1/...` | 30 phút | Kiến trúc chuẩn |
| N6 | **Email service** cho Customer order confirmation | 2-3 giờ | Tính năng mới |

---

## 📊 Tóm tắt

| Nhóm | Số lượng | Ưu tiên |
|------|---------|---------|
| 🔴 Backend nghiêm trọng | **6** | Làm trước |
| 🟡 Frontend hoàn thiện | **6** | Làm sau backend |
| 🟢 Data/UX polish | **2** | Tùy thời gian |
| 💡 Nice-to-have | **6** | Bonus |
| **Tổng** | **20** | |
