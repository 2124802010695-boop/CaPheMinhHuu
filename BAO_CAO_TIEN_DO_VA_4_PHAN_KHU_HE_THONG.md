# 📊 BÁO CÁO TIẾN ĐỘ VÀ PHÂN TÍCH 4 PHÂN KHU HỆ THỐNG

**Ngày báo cáo:** 08/01/2026  
**Người thực hiện:** Nguyễn Hữu Hạnh  
**Dự án:** Hệ thống Quản lý Quán Cà phê Minh Hữu - SmartPOS  
**Mục tiêu:** Báo cáo Tốt nghiệp 2026

---

## 📑 MỤC LỤC

1. [Tổng quan tiến độ hiện tại](#1-tổng-quan-tiến-độ-hiện-tại)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Phân tích 4 phân khu](#3-phân-tích-4-phân-khu)
4. [Chi tiết Backend hiện tại](#4-chi-tiết-backend-hiện-tại)
5. [Chi tiết Frontend hiện tại](#5-chi-tiết-frontend-hiện-tại)
6. [Roadmap phát triển](#6-roadmap-phát-triển)

---

## 1. TỔNG QUAN TIẾN ĐỘ HIỆN TẠI

### 1.1. Thống kê tổng quan

| Thành phần | Hoàn thành | Đang làm | Chưa làm | Tổng |
|------------|------------|----------|----------|------|
| **Backend Controllers** | 5/7 (71%) | 1/7 (14%) | 1/7 (14%) | 7 |
| **Backend Services** | 7/7 (100%) | 0 | 0 | 7 |
| **Backend Repositories** | 8/8 (100%) | 0 | 0 | 8 |
| **Models** | 14/14 (100%) | 0 | 0 | 14 |
| **Frontend Pages** | 9/9 (100%) | 0 | 0 | 9 |
| **Frontend Components** | 10/10 (100%) | 0 | 0 | 10 |

### 1.2. Tiến độ theo module

```
✅ HOÀN THÀNH (70%):
├── Authentication & Authorization (JWT, Role-based)
├── Quản lý Danh mục sản phẩm (Category)
├── Quản lý Sản phẩm (Product)
├── Quản lý Nguyên liệu (Ingredient)
├── Quản lý Công thức (Recipe/BOM)
├── Quản lý Kho (Inventory với Units, Batches, FIFO)
└── UI Admin Dashboard cơ bản

🔄 ĐANG PHÁT TRIỂN (15%):
├── KDS Bếp (UI có, chưa tích hợp API)
├── Login phân quyền (Admin/Staff)
└── Portal Selection

❌ CHƯA BẮT ĐẦU (15%):
├── POS Bán hàng (Cashier)
├── Quản lý Đơn hàng (Order Management)
├── Quản lý Ca làm việc (Shift Management)
├── Quản lý Bàn (Table Management)
├── Web Order cho Khách hàng
├── QR Code Order
├── SignalR Realtime
└── Báo cáo & Thống kê
```

### 1.3. Điểm mạnh hiện tại

✅ **Kiến trúc vững chắc**
- N-Tier Architecture chuẩn (Controller → Service → Repository)
- Dependency Injection đầy đủ
- Entity Framework Core với Code-First
- JWT Authentication hoàn chỉnh

✅ **Quản lý Kho chuyên nghiệp**
- Hệ thống Units (đơn vị quy đổi)
- Inventory Batches (lô hàng)
- FIFO (First In First Out)
- Tính tồn kho realtime
- Cảnh báo HSD

✅ **BOM (Bill of Materials)**
- Định lượng nguyên liệu cho từng món
- Check trùng lặp
- Quy đổi đơn vị

### 1.4. Điểm yếu cần khắc phục

❌ **Thiếu tính năng CORE**
- Chưa có POS (Point of Sale) - Tính năng QUAN TRỌNG NHẤT
- Chưa có Order Management
- Chưa có Shift Management
- Chưa có Table Management

⚠️ **Vấn đề kỹ thuật**
- 1 Controller không tuân thủ N-Tier (IngredientCategoryController)
- Thiếu Update API cho Category và Product
- Chưa có SignalR cho Realtime
- KDS chỉ có UI dummy data

❌ **Thiếu tài liệu**
- Chưa có Figma Mockup
- Chưa có API Documentation đầy đủ
- Chưa có Unit Tests

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                    4 PHÂN KHU NGƯỜI DÙNG                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  ADMIN   │  │ CASHIER  │  │   BẾP    │  │  KHÁCH   │      │
│  │Dashboard │  │SmartPOS  │  │   KDS    │  │WebOrder  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │              │             │             │
└───────┼─────────────┼──────────────┼─────────────┼─────────────┘
        │             │              │             │
        └─────────────┴──────────────┴─────────────┘
                      │
        ┌─────────────▼────────────────────────┐
        │   REACT FRONTEND (Port 5173)         │
        │   - Material-UI v5                   │
        │   - Axios + JWT Interceptor          │
        │   - React Router                     │
        └─────────────┬────────────────────────┘
                      │ HTTP/HTTPS + JWT
        ┌─────────────▼────────────────────────┐
        │   ASP.NET CORE WEB API (Port 5000)   │
        ├──────────────────────────────────────┤
        │  Controllers (7):                    │
        │  ├── AuthController ✅               │
        │  ├── CategoryController ✅           │
        │  ├── ProductController ✅            │
        │  ├── RecipeController ✅             │
        │  ├── IngredientController ✅         │
        │  ├── IngredientCategoryController ⚠️│
        │  └── StaffController ✅              │
        ├──────────────────────────────────────┤
        │  Services (7) - 100% ✅              │
        │  Repositories (8) - 100% ✅          │
        └─────────────┬────────────────────────┘
                      │
        ┌─────────────▼────────────────────────┐
        │   SQL SERVER DATABASE                │
        │   - 14 Tables                        │
        │   - 25 Migrations                    │
        │   - Entity Framework Core            │
        └──────────────────────────────────────┘
```

### 2.2. Tech Stack

**Backend:**
- ASP.NET Core 8.0 Web API
- Entity Framework Core (Code-First)
- SQL Server
- JWT Authentication
- Swagger/OpenAPI

**Frontend:**
- React 18
- Vite
- Material-UI v5
- Axios
- React Router v6

**Planned:**
- SignalR (Realtime)
- QR Code Generator
- VNPay Payment Gateway

---

## 3. PHÂN TÍCH 4 PHÂN KHU

### 3.1. PHÂN KHU 1: ADMIN (Quản trị viên)

#### 🎯 Mục tiêu hướng đến

**Vai trò:** Trung tâm quản trị toàn bộ hệ thống

**Mục tiêu chính:**
1. **Quản lý dữ liệu Master** - Sản phẩm, Danh mục, Nguyên liệu, Công thức
2. **Giám sát hoạt động** - Dashboard realtime, Báo cáo, Thống kê
3. **Quản lý nhân sự** - Nhân viên, Phân quyền, Ca làm việc
4. **Quản lý cơ sở vật chất** - Bàn, Khu vực, QR Code
5. **Kiểm soát tài chính** - Doanh thu, Chi phí, Lợi nhuận

#### 📋 Chức năng cần có

**1. Dashboard (Tổng quan)**
- [ ] Card: Doanh thu hôm nay (realtime)
- [ ] Card: Số đơn hàng hôm nay
- [ ] Card: Số bàn đang dùng
- [ ] Card: Cảnh báo tồn kho (hết hàng, hết hạn)
- [ ] Biểu đồ: Doanh thu 7 ngày (Chart.js)
- [ ] Biểu đồ: Top 10 món bán chạy
- [ ] Bảng: Đơn hàng gần nhất (10 đơn)

**2. Quản lý Sản phẩm** ✅ (70% hoàn thành)
- [x] Danh sách sản phẩm
- [x] Thêm sản phẩm mới
- [x] Upload ảnh
- [x] Xóa sản phẩm
- [ ] **Sửa sản phẩm** (THIẾU)
- [ ] Quản lý Size (S/M/L với giá khác nhau)
- [ ] Quản lý Topping

**3. Quản lý Danh mục** ✅ (70% hoàn thành)
- [x] Danh sách danh mục
- [x] Thêm danh mục
- [x] Xóa danh mục
- [ ] **Sửa danh mục** (THIẾU)

**4. Quản lý Kho** ✅ (90% hoàn thành)
- [x] CRUD Nguyên liệu
- [x] Quản lý đơn vị (Units)
- [x] Quản lý lô hàng (Batches)
- [x] Tính tồn kho realtime
- [x] FIFO
- [x] Cảnh báo HSD
- [ ] Nhập kho (Import Receipt)
- [ ] Xuất kho (Export Receipt)
- [ ] Kiểm kho (Inventory Check)

**5. Quản lý Công thức (BOM)** ✅ (100% hoàn thành)
- [x] Chọn sản phẩm
- [x] Thêm nguyên liệu
- [x] Nhập định lượng
- [x] Xóa nguyên liệu
- [x] Check trùng lặp

**6. Quản lý Bàn** ❌ (0% hoàn thành)
- [ ] Danh sách bàn
- [ ] Thêm/Sửa/Xóa bàn
- [ ] Quản lý khu vực (Tầng 1, Tầng 2, Sân thượng)
- [ ] Tạo QR Code tự động
- [ ] In QR Code
- [ ] Xem trạng thái bàn realtime

**7. Quản lý Nhân viên** ❌ (0% hoàn thành)
- [ ] Danh sách nhân viên
- [ ] Thêm/Sửa/Xóa nhân viên
- [ ] Phân quyền (Admin/Cashier/Kitchen)
- [ ] Quản lý ca làm việc
- [ ] Lịch sử đăng nhập

**8. Báo cáo & Thống kê** ❌ (0% hoàn thành)
- [ ] Báo cáo doanh thu (ngày/tuần/tháng)
- [ ] Báo cáo món bán chạy
- [ ] Báo cáo tồn kho
- [ ] Báo cáo ca làm việc
- [ ] Export Excel
- [ ] Export PDF

#### 🔧 Trạng thái hiện tại

**✅ Đã có:**
- AdminLogin.jsx (Đăng nhập Admin)
- AdminDashboard.jsx (Dashboard cơ bản)
- QuanLySanPham.jsx (Quản lý Sản phẩm)
- QuanLyDanhMuc.jsx (Quản lý Danh mục)
- QuanLyKho.jsx (Quản lý Kho - rất chi tiết)
- QuanLyDanhMucNguyenLieu.jsx
- LayoutAdmin.jsx (Sidebar + Navbar)

**❌ Chưa có:**
- Dashboard thực sự (hiện tại chỉ là menu)
- Quản lý Bàn
- Quản lý Nhân viên
- Báo cáo & Thống kê
- Quản lý Size/Topping

#### 📊 Tiến độ: 60%

---

### 3.2. PHÂN KHU 2: CASHIER (Thu ngân - SmartPOS)

#### 🎯 Mục tiêu hướng đến

**Vai trò:** Bán hàng nhanh chóng, chính xác tại quầy

**Mục tiêu chính:**
1. **Bán hàng nhanh** - Giao diện tối ưu cho tốc độ
2. **Quản lý đơn hàng** - Tạo, sửa, hủy đơn
3. **Quản lý bàn** - Gán bàn, chuyển bàn, gộp bàn
4. **Thanh toán đa dạng** - Tiền mặt, Thẻ, Chuyển khoản
5. **Quản lý ca làm việc** - Mở ca, đóng ca, Z-Report

#### 📋 Chức năng cần có

**1. SmartPOS - Bán hàng** ❌ (0% hoàn thành)

**Layout 3 cột:**

**Cột 1: Menu (Bên trái - 40%)**
- [ ] Tab danh mục sản phẩm
- [ ] Grid món ăn (Card với hình ảnh)
- [ ] Click món → Modal chọn size/topping
- [ ] Tìm kiếm nhanh
- [ ] Lọc theo danh mục

**Cột 2: Giỏ hàng (Giữa - 35%)**
- [ ] Danh sách món đã chọn
- [ ] Hiển thị: Tên, Size, Topping, SL, Giá
- [ ] Button: +/- số lượng
- [ ] Button: Xóa món
- [ ] Hiển thị: Tổng tiền (realtime)
- [ ] Ghi chú đơn hàng

**Cột 3: Thanh toán (Bên phải - 25%)**
- [ ] Chọn phương thức thanh toán:
  - [ ] Tiền mặt
  - [ ] Thẻ
  - [ ] Chuyển khoản
- [ ] Nhập tiền khách đưa
- [ ] Hiển thị tiền thừa
- [ ] Button: Thanh toán
- [ ] Button: In hóa đơn
- [ ] Button: Hủy đơn

**2. Quản lý Bàn** ❌ (0% hoàn thành)
- [ ] Sơ đồ bàn (Grid layout)
- [ ] Màu sắc trạng thái:
  - Xanh: Trống
  - Đỏ: Đang dùng
  - Vàng: Đã gọi món chưa thanh toán
- [ ] Click bàn → Xem đơn hàng
- [ ] Gán đơn hàng cho bàn
- [ ] Chuyển bàn
- [ ] Gộp bàn
- [ ] Cập nhật realtime (SignalR)

**3. Quản lý Ca làm việc** ❌ (0% hoàn thành)
- [ ] Modal: Mở ca
  - Nhập tiền đầu ca
  - Ghi nhận thời gian
- [ ] Modal: Đóng ca
  - Nhập tiền cuối ca
  - Tính chênh lệch
  - Xuất Z-Report (PDF)
- [ ] Xem báo cáo ca

**4. Xem đơn hàng** ❌ (0% hoàn thành)
- [ ] Danh sách đơn hàng hôm nay
- [ ] Lọc theo trạng thái
- [ ] Xem chi tiết đơn
- [ ] In lại hóa đơn

#### 🔧 Trạng thái hiện tại

**✅ Đã có:**
- StaffLogin.jsx (Đăng nhập nhân viên)
- Routing: `/staff/pos` (đã khai báo trong StaffLogin)

**❌ Chưa có:**
- Trang POS (chưa tạo file)
- API Order (chưa có)
- API Shift (chưa có)
- API Table (chưa có)
- Component Cart
- Component PaymentPanel
- Component BillTemplate

#### 📊 Tiến độ: 5%

---

### 3.3. PHÂN KHU 3: BẾP (Kitchen - KDS + Nhập kho)

#### 🎯 Mục tiêu hướng đến

**Vai trò:** Nhận đơn realtime, chế biến món, quản lý kho

**Mục tiêu chính:**
1. **Nhận đơn realtime** - SignalR, không bỏ sót đơn
2. **Quản lý trạng thái món** - Pending → Cooking → Done
3. **Hiển thị thời gian** - Cảnh báo món chờ lâu
4. **Nhập kho nguyên liệu** - Quản lý lô hàng, HSD
5. **Kiểm kho** - Đối chiếu thực tế với hệ thống

#### 📋 Chức năng cần có

**1. KDS (Kitchen Display System)** 🔄 (50% hoàn thành)

**Layout 3 cột (Kanban style):**

**Cột 1: Chờ làm (Pending) - Màu vàng cam**
- [x] Danh sách món mới nhận
- [x] Hiển thị:
  - [x] Số bàn (nếu có)
  - [x] Tên món
  - [x] Size
  - [x] Topping
  - [x] Số lượng
  - [x] Ghi chú
  - [x] Thời gian đặt
- [x] Button: "Bắt đầu"
- [ ] **Tích hợp API thực** (hiện tại dùng dummy data)
- [ ] **SignalR realtime**

**Cột 2: Đang làm (Cooking) - Màu xanh dương**
- [x] Danh sách món đang chế biến
- [x] Hiển thị thời gian đã làm
- [x] Button: "Hoàn thành"
- [ ] **Tích hợp API thực**

**Cột 3: Hoàn thành (Done) - Màu xanh lá**
- [x] Danh sách món đã xong
- [x] Tự động xóa sau 5 phút
- [ ] **Tích hợp API thực**

**Tính năng bổ sung:**
- [ ] Realtime (SignalR)
- [ ] Âm thanh thông báo đơn mới
- [ ] Sắp xếp theo thời gian (FIFO)
- [ ] Cảnh báo món chờ quá lâu (>10 phút)
- [ ] Filter: All/Drinks/Food

**2. Nhập kho** ❌ (0% hoàn thành)
- [ ] Form nhập kho:
  - [ ] Chọn nguyên liệu
  - [ ] Nhập số lượng
  - [ ] Nhập giá nhập
  - [ ] Nhập ngày sản xuất
  - [ ] Nhập hạn sử dụng
  - [ ] Chọn vị trí lưu trữ (Kệ A1, B2...)
  - [ ] Quét mã vạch (optional)
- [ ] Lịch sử nhập kho
- [ ] In phiếu nhập kho

**3. Kiểm kho** ❌ (0% hoàn thành)
- [ ] Form kiểm kho:
  - [ ] Chọn nguyên liệu
  - [ ] Nhập số lượng thực tế
  - [ ] Hệ thống tự động tính chênh lệch
  - [ ] Ghi chú lý do (nếu có)
- [ ] Báo cáo kiểm kho
- [ ] Export Excel

#### 🔧 Trạng thái hiện tại

**✅ Đã có:**
- KDS_Bep.jsx (UI hoàn chỉnh, đẹp, dark mode)
- Dummy data (5 đơn hàng mẫu)
- Timer realtime (đếm thời gian)
- Progress bar (màu sắc thay đổi theo thời gian)
- Filter: All/Drinks/Food
- Button: Done, Out of Stock

**❌ Chưa có:**
- API Order (Backend)
- SignalR Hub (Backend)
- SignalR Connection (Frontend)
- Tích hợp API thực
- Âm thanh thông báo
- Trang Nhập kho
- Trang Kiểm kho

#### 📊 Tiến độ: 40%

---

### 3.4. PHÂN KHU 4: KHÁCH HÀNG (Web Order + QR Code)

#### 🎯 Mục tiêu hướng đến

**Vai trò:** Khách hàng tự đặt món, giảm tải cho nhân viên

**Mục tiêu chính:**
1. **Xem menu trực tuyến** - Hình ảnh đẹp, mô tả chi tiết
2. **Xem bàn trống realtime** - Biết bàn nào còn trống
3. **Đặt món qua QR Code** - Quét QR trên bàn → Đặt món
4. **Đặt món mang đi** - Order online, thanh toán VNPay
5. **Theo dõi đơn hàng** - Biết món đang ở trạng thái nào

#### 📋 Chức năng cần có

**1. Trang chủ (Landing Page)** ❌ (0% hoàn thành)
- [ ] Banner quán (Slider)
- [ ] Giới thiệu quán
- [ ] Menu nổi bật (Top 6 món)
- [ ] Button: "Xem Menu đầy đủ"
- [ ] Button: "Xem Bàn trống"
- [ ] Button: "Đặt món mang đi"
- [ ] Footer: Địa chỉ, SĐT, Giờ mở cửa

**2. Xem Menu** ❌ (0% hoàn thành)
- [ ] Grid món ăn (Card với hình ảnh)
- [ ] Lọc theo danh mục
- [ ] Tìm kiếm món
- [ ] Click món → Modal chi tiết:
  - [ ] Hình ảnh lớn
  - [ ] Mô tả
  - [ ] Giá
  - [ ] Chọn size (S/M/L)
  - [ ] Chọn topping
  - [ ] Button: "Thêm vào giỏ"

**3. Xem Bàn trống (Realtime)** ❌ (0% hoàn thành)
- [ ] Sơ đồ bàn (Grid layout)
- [ ] Màu xanh: Bàn trống
- [ ] Màu đỏ: Bàn đang dùng
- [ ] Cập nhật realtime (SignalR)
- [ ] Hiển thị số ghế
- [ ] Hiển thị khu vực

**4. Đặt món qua QR Code** ❌ (0% hoàn thành)

**Flow:**
1. Khách quét QR Code trên bàn
2. Tự động nhận diện số bàn
3. Hiển thị menu
4. Chọn món → Giỏ hàng
5. Button: "Gửi đơn hàng"
6. Theo dõi trạng thái món realtime:
   - Đang chờ
   - Đang làm
   - Hoàn thành
7. Gọi nhân viên (nếu cần)

**Tính năng:**
- [ ] QR Code Scanner (Camera)
- [ ] Tự động nhận diện bàn
- [ ] Giỏ hàng
- [ ] Gửi đơn hàng
- [ ] Theo dõi trạng thái realtime
- [ ] Button: "Gọi nhân viên"
- [ ] Button: "Thanh toán"

**5. Đặt món Mang đi** ❌ (0% hoàn thành)
- [ ] Chọn món → Giỏ hàng
- [ ] Chọn thời gian lấy (DateTimePicker)
- [ ] Form thông tin:
  - [ ] Họ tên
  - [ ] Số điện thoại
  - [ ] Ghi chú
- [ ] Chọn thanh toán:
  - [ ] Thanh toán khi nhận
  - [ ] Thanh toán online (VNPay)
- [ ] Button: "Đặt hàng"
- [ ] Nhận mã đơn hàng
- [ ] SMS/Email xác nhận

**6. Theo dõi đơn hàng** ❌ (0% hoàn thành)
- [ ] Nhập mã đơn hàng
- [ ] Xem trạng thái:
  - Đang chờ xác nhận
  - Đã xác nhận
  - Đang làm
  - Hoàn thành
  - Đã giao
- [ ] Realtime update
- [ ] Thông báo khi món xong

#### 🔧 Trạng thái hiện tại

**✅ Đã có:**
- PortalSelection.jsx (Chọn portal: Admin/Staff/Customer)

**❌ Chưa có:**
- Tất cả các trang cho Khách hàng
- API Order (Backend)
- API Table (Backend)
- SignalR (Backend + Frontend)
- QR Code Generator
- QR Code Scanner
- VNPay Integration

#### 📊 Tiến độ: 0%

---

## 4. CHI TIẾT BACKEND HIỆN TẠI

### 4.1. Controllers (7 files)

#### ✅ Controllers chuẩn (6/7)

**1. AuthController.cs** ✅
```
Endpoints:
- POST /api/auth/login (Đăng nhập chung)
- POST /api/auth/admin/login (Đăng nhập Admin)
- POST /api/auth/staff/login (Đăng nhập Staff)
- GET /api/auth/check-token (Kiểm tra token)

Tính năng:
- JWT Generation
- Login History (IP, UserAgent)
- Role-based (Admin/Cashier/Kitchen/Customer)

Đánh giá: ✅ Chuẩn, đầy đủ
```

**2. CategoryController.cs** ⚠️
```
Endpoints:
- GET /api/category (Lấy tất cả)
- POST /api/category (Thêm mới)
- DELETE /api/category/{id} (Xóa)

THIẾU:
- PUT /api/category/{id} (Cập nhật)

Đánh giá: ⚠️ Cần thêm Update
```

**3. ProductController.cs** ⚠️
```
Endpoints:
- GET /api/product (Lấy tất cả)
- POST /api/product (Thêm mới + Upload ảnh)
- DELETE /api/product/{id} (Xóa)

THIẾU:
- PUT /api/product/{id} (Cập nhật)

Đánh giá: ⚠️ Cần thêm Update
```

**4. RecipeController.cs** ✅
```
Endpoints:
- GET /api/recipe/product/{productId} (Lấy công thức theo sản phẩm)
- POST /api/recipe (Thêm nguyên liệu vào món)
- DELETE /api/recipe/{id} (Xóa nguyên liệu)

Tính năng:
- Check trùng lặp nguyên liệu
- Định lượng nguyên liệu

Đánh giá: ✅ Chuẩn, logic tốt
```

**5. IngredientController.cs** ✅
```
Endpoints:
- GET /api/ingredient (Lấy tất cả + Tồn kho realtime)
- GET /api/ingredient/{id} (Lấy chi tiết + Units + Batches)
- POST /api/ingredient (Thêm mới)
- PUT /api/ingredient/{id} (Cập nhật)
- DELETE /api/ingredient/{id} (Xóa)

Tính năng:
- Tính tồn kho realtime
- FIFO
- Cảnh báo HSD
- Quản lý Units
- Quản lý Batches

Đánh giá: ✅ Chuẩn, PHỨC TẠP NHẤT
```

**6. StaffController.cs** ✅
```
Endpoints:
- GET /api/staff (Lấy danh sách nhân viên)

Đánh giá: ✅ Chuẩn (đơn giản)
```

#### ❌ Controllers KHÔNG chuẩn (1/7)

**7. IngredientCategoryController.cs** ❌
```csharp
VẤN ĐỀ:
- Inject DbContext trực tiếp
- Không có Service
- Không có Repository
- Không tuân thủ N-Tier

CẦN SỬA:
- Tạo IIngredientCategoryService + IngredientCategoryService
- Tạo IIngredientCategoryRepository + IngredientCategoryRepository
- Sửa Controller inject Service

Thời gian ước tính: 2 giờ
```

### 4.2. Services (7 files) - 100% ✅

**Tất cả Services đều chuẩn:**

1. **AuthService.cs** (5.9KB)
   - LoginAsync, AdminLoginAsync, StaffLoginAsync
   - JWT Generation
   - Password Hashing (BCrypt)
   - RecordLoginHistoryAsync

2. **CategoryService.cs** (1.6KB)
   - GetAllAsync, CreateAsync, DeleteAsync
   - THIẾU: UpdateAsync

3. **ProductService.cs** (1.8KB)
   - GetAllAsync, CreateAsync, DeleteAsync
   - THIẾU: UpdateAsync

4. **RecipeService.cs** (2.2KB)
   - GetByProductIdAsync, AddIngredientAsync, RemoveIngredientAsync
   - Check trùng lặp

5. **IngredientService.cs** (16.4KB) - **PHỨC TẠP NHẤT**
   - GetAllAsync (Tính tồn kho realtime)
   - GetByIdAsync (Lấy Units, Batches)
   - CreateAsync (Tạo Ingredient + Units + Batch)
   - UpdateAsync (Chỉ update Master data)
   - DeleteAsync
   - Helper: MapToViewDto, GenerateBatchCode, GetExpiryStatus

6. **IngredientCategoryService.cs** (2.5KB)
   - GetAllAsync, CreateAsync, DeleteAsync

7. **StaffService.cs** (448 bytes)
   - GetAllAsync (đơn giản)

### 4.3. Repositories (8 files) - 100% ✅

**Tất cả Repositories đều chuẩn:**

1. UserRepository.cs
2. CategoryRepository.cs
3. ProductRepository.cs
4. RecipeRepository.cs
5. IngredientRepository.cs
6. IngredientUnitRepository.cs
7. InventoryBatchRepository.cs
8. IngredientCategoryRepository.cs

### 4.4. Models (14 files) - 100% ✅

**Quan trọng:**

1. **User.cs** - Phức tạp nhất
   - Username, Email, Phone, PasswordHash
   - Role: Admin/Cashier/Kitchen/Customer
   - AuthProvider: Local/Google/Facebook
   - IsActive, IsFirstLogin, IsEmailVerified
   - FailedLoginAttempts, LockedUntil, LastLoginAt
   - Salary, SalaryCoefficient (cho Staff)

2. **Order.cs** - Đơn giản
   - UserId (nullable - khách vãng lai)
   - CustomerName, Phone, Address
   - TotalAmount, Status, PaymentMethod
   - TableNumber

3. **OrderItem.cs**
   - OrderId, ProductId, Quantity, PriceAtOrder

4. **Product.cs**
   - Name, Price, ImageUrl, CategoryId
   - PreparationTime (cho KDS)
   - IsActive

5. **Ingredient.cs**
   - Name, SKU, BaseUnit
   - IngredientCategoryId
   - MinStock, MaxStock
   - DefaultShelfLifeDays
   - Navigation: Units, Batches

6. **IngredientUnit.cs**
   - IngredientId, UnitName, ConversionFactor, IsBaseUnit

7. **InventoryBatch.cs**
   - IngredientId, BatchCode, Quantity, ExpiryDate, CostPrice

8. **Recipe.cs**
   - ProductId, IngredientId, QuantityRequired

**Khác:**
- BaseEntity.cs (Id, CreatedAt, UpdatedAt, IsDeleted)
- Category.cs
- IngredientCategory.cs
- HolidayConfig.cs
- LoginHistory.cs
- RequestTicket.cs

### 4.5. Bảng tổng hợp Backend

| Module | Controller | Service | Repository | Chuẩn N-Tier | Ghi Chú |
|--------|-----------|---------|------------|--------------|------------|
| Auth | ✅ | ✅ | ✅ | ✅ | Hoàn chỉnh |
| Category | ⚠️ | ✅ | ✅ | ✅ | Thiếu Update API |
| Product | ⚠️ | ✅ | ✅ | ✅ | Thiếu Update API |
| Recipe | ✅ | ✅ | ✅ | ✅ | Hoàn chỉnh |
| Ingredient | ✅ | ✅ | ✅ (x3) | ✅ | Phức tạp nhất |
| IngredientCategory | ❌ | ✅ | ✅ | ❌ | **CẦN SỬA** |
| Staff | ✅ | ✅ | ✅ | ✅ | Đơn giản |
| **Order** | ❌ | ❌ | ❌ | ❌ | **CHƯA CÓ** |
| **Shift** | ❌ | ❌ | ❌ | ❌ | **CHƯA CÓ** |
| **Table** | ❌ | ❌ | ❌ | ❌ | **CHƯA CÓ** |

**Điểm số Backend:** 7.0/10

**Điểm mạnh:**
- Cấu trúc chuẩn N-Tier
- Logic nghiệp vụ tốt (Ingredient, Recipe)
- JWT Authentication hoàn chỉnh
- Entity Framework Code-First

**Điểm yếu:**
- 1 Controller không chuẩn (IngredientCategory)
- Thiếu Update API (Category, Product)
- Thiếu module CORE (Order, Shift, Table)
- Chưa có SignalR

---

## 5. CHI TIẾT FRONTEND HIỆN TẠI

### 5.1. Pages (9 files) - 100% ✅

**1. PortalSelection.jsx** ✅
- Chọn portal: Admin/Staff/Customer
- UI đẹp, gradient

**2. AdminLogin.jsx** ✅
- Form đăng nhập Admin
- JWT Token lưu localStorage
- Redirect về /admin/dashboard

**3. StaffLogin.jsx** ✅
- Form đăng nhập Staff
- Redirect về /staff/pos (CHƯA TẠO)

**4. AdminDashboard.jsx** ✅
- Menu 4 card:
  - Quản lý Sản phẩm
  - Quản lý Danh mục
  - Quản lý Kho
  - Quản lý Nhân viên (CHƯA LÀM)
- Logout

**5. QuanLySanPham.jsx** ✅
- Danh sách sản phẩm (Table)
- Modal: Thêm sản phẩm
- Upload ảnh
- Xóa sản phẩm
- **THIẾU:** Modal Sửa

**6. QuanLyDanhMuc.jsx** ✅
- Danh sách danh mục (Table)
- Modal: Thêm danh mục
- Xóa danh mục
- **THIẾU:** Modal Sửa

**7. QuanLyDanhMucNguyenLieu.jsx** ✅
- Danh sách danh mục nguyên liệu
- Modal: Thêm/Sửa/Xóa

**8. QuanLyKho.jsx** ✅ - **TRANG PHỨC TẠP NHẤT**
- Danh sách nguyên liệu (Table)
- Hiển thị tồn kho realtime
- Cảnh báo HSD (màu đỏ/vàng/xanh)
- Modal: Thêm nguyên liệu (rất chi tiết)
  - Tab 1: Thông tin cơ bản
  - Tab 2: Đơn vị quy đổi
  - Tab 3: Lô hàng đầu tiên
- Modal: Sửa nguyên liệu
- Modal: Chi tiết nguyên liệu
  - Hiển thị Units
  - Hiển thị Batches
  - Hiển thị tồn kho

**9. KDS_Bep.jsx** ✅ - **UI HOÀN CHỈNH**
- Layout 3 cột Kanban
- Dummy data (5 đơn hàng)
- Timer realtime
- Progress bar (màu sắc thay đổi)
- Filter: All/Drinks/Food
- Button: Done, Out of Stock
- **THIẾU:** Tích hợp API thực, SignalR

### 5.2. Components (10 files) - 100% ✅

**1. Navbar.jsx** ✅
- AppBar Material-UI
- Hiển thị user info

**2. Sidebar.jsx** ✅
- Menu điều hướng
- Logout

**3. ModalAddProduct.jsx** ✅
- Form thêm sản phẩm
- Upload ảnh
- Chọn danh mục

**4. ModalAddCategory.jsx** ✅
- Form thêm danh mục

**5. ModalAddIngredientCategory.jsx** ✅
- Form thêm danh mục nguyên liệu

**6. ModalAddIngredient.jsx** ✅ - **PHỨC TẠP NHẤT**
- Tab 1: Thông tin cơ bản
- Tab 2: Đơn vị quy đổi (dynamic array)
- Tab 3: Lô hàng đầu tiên
- Validation đầy đủ

**7. ModalEditIngredient.jsx** ✅
- Form sửa nguyên liệu
- Hiển thị thông tin hiện tại

**8. ModalIngredientDetail.jsx** ✅
- Hiển thị chi tiết nguyên liệu
- Bảng Units
- Bảng Batches

**9. ModalRecipe.jsx** ✅
- Form thêm công thức
- Chọn nguyên liệu
- Nhập số lượng

**10. ModalAddIngredient.jsx.backup**
- File backup

### 5.3. Services (9 files) - 100% ✅

**1. authService.js**
- login(username, password)
- checkToken()

**2. adminAuthService.js**
- adminLogin(username, password)

**3. staffAuthService.js**
- staffLogin(staffCode, password)

**4. categoryService.js**
- getAllCategories()
- createCategory(data)
- deleteCategory(id)

**5. productService.js**
- getAllProducts()
- createProduct(data)
- deleteProduct(id)

**6. ingredientService.js**
- getAllIngredients()
- getIngredientById(id)
- createIngredient(data)
- updateIngredient(id, data)
- deleteIngredient(id)

**7. ingredientCategoryService.js**
- getAllIngredientCategories()
- createIngredientCategory(data)
- deleteIngredientCategory(id)

**8. recipeService.js**
- getRecipesByProductId(productId)
- addRecipe(data)
- deleteRecipe(id)

**9. batchService.js**
- addBatch(ingredientId, data)

### 5.4. Layouts (1 file) - 100% ✅

**1. LayoutAdmin.jsx** ✅
- Sidebar + Navbar
- Outlet cho nested routes

### 5.5. Utils (1 file) - 100% ✅

**1. axiosCustomize.js** ✅
- Axios instance
- Base URL: http://localhost:5000/api
- Request Interceptor: Thêm JWT Token
- Response Interceptor: Xử lý lỗi 401

### 5.6. Routing (App.jsx)

```jsx
Routes:
- / → PortalSelection
- /admin/login → AdminLogin
- /staff/login → StaffLogin
- /admin/dashboard → AdminDashboard
- /admin (Layout):
  - /admin/quanlysanpham → QuanLySanPham
  - /admin/quanlydanhmuc → QuanLyDanhMuc
  - /admin/quanlydanhmucnguyenlieu → QuanLyDanhMucNguyenLieu
  - /admin/quanlykho → QuanLyKho
- /Bep → KDS_Bep (Không có Sidebar)

THIẾU:
- /staff/pos → SmartPOS (CHƯA TẠO)
- /customer/* → Web Order (CHƯA TẠO)
```

### 5.7. Đánh giá Frontend

**Điểm số Frontend:** 7.5/10

**Điểm mạnh:**
- ✅ Material-UI components đẹp
- ✅ Responsive design
- ✅ Axios interceptor tốt
- ✅ Modal components tái sử dụng
- ✅ QuanLyKho.jsx rất chi tiết
- ✅ KDS_Bep.jsx UI hoàn chỉnh

**Điểm yếu:**
- ⚠️ Thiếu Modal Sửa cho Product, Category
- ❌ Chưa có POS UI
- ❌ Chưa có Web Order UI
- ❌ Chưa có Dashboard thực sự
- ❌ Chưa có SignalR client

---

## 6. ROADMAP PHÁT TRIỂN

### 6.1. Ưu tiên CAO (CRITICAL)

#### 1. POS Bán hàng (SmartPOS) - 1 tuần

**Backend:**
- [ ] Model: Order, OrderItem (ĐÃ CÓ, cần kiểm tra)
- [ ] OrderController:
  - POST /api/order (Tạo đơn)
  - GET /api/order/{id} (Chi tiết)
  - GET /api/order/today (Đơn hôm nay)
  - PATCH /api/order/{id}/status (Cập nhật trạng thái)
- [ ] OrderService:
  - CreateOrderAsync (Tạo đơn + Trừ kho)
  - GetOrderByIdAsync
  - GetTodayOrdersAsync
  - UpdateOrderStatusAsync
- [ ] OrderRepository:
  - CreateAsync, GetByIdAsync, GetTodayAsync, UpdateStatusAsync

**Frontend:**
- [ ] Page: SmartPOS.jsx (Layout 3 cột)
- [ ] Component: MenuGrid.jsx
- [ ] Component: Cart.jsx
- [ ] Component: PaymentPanel.jsx
- [ ] Component: ModalSelectSize.jsx
- [ ] Component: BillTemplate.jsx (In hóa đơn)
- [ ] Service: orderService.js

**Thời gian:** 7 ngày

---

#### 2. KDS Bếp + SignalR Realtime - 1 tuần

**Backend:**
- [ ] Cài đặt: Microsoft.AspNetCore.SignalR
- [ ] KitchenHub.cs:
  - SendOrderToKitchen(order)
  - UpdateOrderStatus(orderId, status)
- [ ] Program.cs:
  - builder.Services.AddSignalR()
  - app.MapHub<KitchenHub>("/kitchenHub")
- [ ] Update OrderService: Broadcast khi tạo đơn

**Frontend:**
- [ ] Cài đặt: @microsoft/signalr
- [ ] signalRConnection.js (Singleton)
- [ ] KDS_Bep.jsx:
  - Kết nối SignalR
  - Listen: "ReceiveOrder"
  - Emit: "UpdateOrderStatus"
  - Thay dummy data bằng API thực
- [ ] Âm thanh thông báo (Audio API)

**Thời gian:** 7 ngày

---

#### 3. Quản lý Ca làm việc (Shift) - 1 tuần

**Backend:**
- [ ] Model: Shift
  - UserId, OpenTime, CloseTime
  - OpeningCash, ClosingCash, Difference
  - TotalOrders, TotalRevenue
- [ ] ShiftController:
  - POST /api/shift/open (Mở ca)
  - POST /api/shift/close (Đóng ca)
  - GET /api/shift/{id}/report (Z-Report)
- [ ] ShiftService, ShiftRepository

**Frontend:**
- [ ] Modal: ModalOpenShift.jsx
- [ ] Modal: ModalCloseShift.jsx
- [ ] Page: BaoCaoCa.jsx
- [ ] Component: ZReport.jsx (PDF Export)

**Thời gian:** 7 ngày

---

### 6.2. Ưu tiên TRUNG (IMPORTANT)

#### 4. Sửa lỗi Backend - 1 ngày

- [ ] Sửa IngredientCategoryController (2 giờ)
- [ ] Thêm Update API cho Category (2 giờ)
- [ ] Thêm Update API cho Product (2 giờ)
- [ ] Code cleanup (2 giờ)

**Thời gian:** 1 ngày

---

#### 5. Quản lý Bàn + QR Code - 1 tuần

**Backend:**
- [ ] Model: Table (Number, Area, Seats, QRCode, Status)
- [ ] TableController: CRUD
- [ ] TableService, TableRepository
- [ ] QR Code Generator (QRCoder library)

**Frontend:**
- [ ] Page: QuanLyBan.jsx
- [ ] Component: TableGrid.jsx (Sơ đồ bàn)
- [ ] Modal: ModalAddTable.jsx
- [ ] Component: QRCodeDisplay.jsx (In QR)

**Thời gian:** 7 ngày

---

#### 6. Dashboard thực sự - 3 ngày

**Backend:**
- [ ] DashboardController:
  - GET /api/dashboard/summary (Tổng quan)
  - GET /api/dashboard/revenue-chart (Biểu đồ doanh thu)
  - GET /api/dashboard/top-products (Top món bán chạy)

**Frontend:**
- [ ] Page: Dashboard.jsx (thay AdminDashboard)
- [ ] Component: RevenueChart.jsx (Chart.js)
- [ ] Component: TopProductsChart.jsx
- [ ] Component: StatsCard.jsx

**Thời gian:** 3 ngày

---

### 6.3. Ưu tiên THẤP (NICE TO HAVE)

#### 7. Web Order cho Khách hàng - 2 tuần

**Frontend:**
- [ ] Page: CustomerHome.jsx
- [ ] Page: CustomerMenu.jsx
- [ ] Page: ViewTables.jsx (Realtime)
- [ ] Page: QRCodeOrder.jsx (Quét QR)
- [ ] Page: TakeawayOrder.jsx (Mang đi)
- [ ] Page: TrackOrder.jsx (Theo dõi)
- [ ] Component: QRScanner.jsx

**Backend:**
- [ ] Không cần thêm API (dùng chung Order API)
- [ ] VNPay Integration (nếu cần)

**Thời gian:** 14 ngày

---

#### 8. Product Variants & Toppings - 1 tuần

**Backend:**
- [ ] Model: ProductVariant (Size S/M/L)
- [ ] Model: Topping
- [ ] Model: ProductTopping
- [ ] API: Hỗ trợ Variants

**Frontend:**
- [ ] Modal: ModalManageVariants.jsx
- [ ] Modal: ModalManageToppings.jsx
- [ ] Update: ModalSelectSize.jsx

**Thời gian:** 7 ngày

---

#### 9. Báo cáo & Thống kê - 1 tuần

**Backend:**
- [ ] ReportController:
  - GET /api/report/revenue (Doanh thu)
  - GET /api/report/best-sellers (Món bán chạy)
  - GET /api/report/inventory (Tồn kho)
  - GET /api/report/shifts (Ca làm việc)

**Frontend:**
- [ ] Page: BaoCao.jsx
- [ ] Component: RevenueReport.jsx
- [ ] Component: BestSellersReport.jsx
- [ ] Export Excel (xlsx library)
- [ ] Export PDF (jsPDF library)

**Thời gian:** 7 ngày

---

### 6.4. Timeline tổng hợp (8 tuần)

```
TUẦN 1-2: POS + KDS + SignalR (CRITICAL)
├── Tuần 1: POS Backend + Frontend
└── Tuần 2: KDS + SignalR Realtime

TUẦN 3: Shift Management + Bug Fixes
├── 6 ngày: Shift Management
└── 1 ngày: Sửa lỗi Backend

TUẦN 4: Table Management + Dashboard
├── 4 ngày: Table Management
└── 3 ngày: Dashboard thực sự

TUẦN 5-6: Web Order cho Khách hàng (OPTIONAL)
├── Tuần 5: Frontend (Home, Menu, QR Order)
└── Tuần 6: Takeaway, Track Order

TUẦN 7: Product Variants + Reports
├── 4 ngày: Variants & Toppings
└── 3 ngày: Báo cáo cơ bản

TUẦN 8: Testing + Documentation + Deploy
├── 2 ngày: Testing tổng thể
├── 2 ngày: Tài liệu (Figma, API Docs)
├── 2 ngày: Deploy (Docker, Cloud)
└── 1 ngày: Video Demo
```

---

## 📝 KẾT LUẬN

### Tóm tắt tiến độ

| Phân khu | Tiến độ | Ghi chú |
|----------|---------|---------|
| **1. ADMIN** | 60% | Thiếu Dashboard, Bàn, Nhân viên, Báo cáo |
| **2. CASHIER (POS)** | 5% | Chưa có gì, CHỈ CÓ LOGIN |
| **3. BẾP (KDS)** | 40% | Có UI đẹp, thiếu API + SignalR |
| **4. KHÁCH HÀNG** | 0% | Chưa bắt đầu |

### Điểm mạnh của dự án

1. ✅ **Kiến trúc vững chắc** - N-Tier chuẩn
2. ✅ **Quản lý Kho chuyên nghiệp** - Units, Batches, FIFO
3. ✅ **BOM hoàn chỉnh** - Định lượng nguyên liệu
4. ✅ **UI đẹp** - Material-UI, KDS dark mode
5. ✅ **Authentication tốt** - JWT, Role-based

### Điểm yếu cần khắc phục

1. ❌ **Thiếu POS** - Tính năng QUAN TRỌNG NHẤT
2. ❌ **Thiếu SignalR** - Không có Realtime
3. ❌ **Thiếu Order Management** - Không quản lý được đơn hàng
4. ⚠️ **1 Controller không chuẩn** - IngredientCategoryController
5. ⚠️ **Thiếu Update API** - Category, Product

### Khuyến nghị

**Ưu tiên tuyệt đối (4 tuần đầu):**
1. POS Bán hàng (1 tuần)
2. KDS + SignalR (1 tuần)
3. Shift Management (1 tuần)
4. Table Management + Dashboard (1 tuần)

**Sau đó (4 tuần sau - nếu còn thời gian):**
5. Web Order cho Khách hàng (2 tuần)
6. Variants + Reports (1 tuần)
7. Testing + Deploy (1 tuần)

**Nếu thời gian hạn chế:**
- Tập trung vào 4 tuần đầu (POS, KDS, Shift, Table)
- Bỏ qua Web Order cho Khách hàng
- Làm Dashboard + Reports đơn giản

---

**Ngày tạo:** 08/01/2026  
**Người tạo:** AI Assistant  
**Trạng thái:** ✅ HOÀN THÀNH KHẢO SÁT TOÀN BỘ HỆ THỐNG

---

**📞 Sẵn sàng bắt đầu phát triển!** 🚀
