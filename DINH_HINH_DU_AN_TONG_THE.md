# 🎯 ĐỊNH HÌNH DỰ ÁN - HỆ THỐNG QUẢN LÝ QUÁN CÀ PHÊ MINH HỮU

**Ngày:** 23/12/2025  
**Mục tiêu:** Đạt điểm 8.3/10 cho Báo cáo Tốt nghiệp 2026  
**Thời gian còn lại:**

---

## 📋 I. TỔNG QUAN DỰ ÁN

### Thông tin cơ bản
- **Tên dự án:** Hệ thống Quản lý Quán Cà phê Minh Hữu
- **Công nghệ:** 
  - Backend: ASP.NET Core 8.0 Web API
  - Frontend: React 18 + Vite + Material-UI v5
  - Database: SQL Server + Entity Framework Core
  - Architecture: N-Tier (3-Layer)

### Điểm số hiện tại
- **Hiện tại:** chưa rõ ràng (tầm 50%)
- **Mục tiêu:** 8.3/10 (83%)
- **Cần cải thiện:** 

---

## 🏗️ II. KIẾN TRÚC HỆ THỐNG (N-TIER)

### Cấu trúc 3 lớp:

**1. PRESENTATION LAYER (Controllers)**
- Xử lý HTTP Requests/Responses
- Validation đầu vào
- Trả về DTOs cho Frontend

**2. BUSINESS LOGIC LAYER (Services)**
- Xử lý logic nghiệp vụ
- Tính toán BOM (Bill of Materials)
- Quy đổi đơn vị
- FIFO cho kho

**3. DATA ACCESS LAYER (Repositories)**
- CRUD operations
- Truy vấn database
- Entity Framework Core

**4. DATABASE (SQL Server)**
- 11 bảng chính (còn phát triển thêm)
- Code-First Migrations
- Audit Log (CreatedAt, UpdatedAt)

---

## 📊 III. CẤU TRÚC DATABASE

### Các bảng chính:

**1. User** - Người dùng hệ thống
- Id, Username, Password, Role
- Trạng thái: ✅ Đã có

**2. Category** - Danh mục sản phẩm
- Id, Name, Description
- Trạng thái: ✅ Đã có

**3. Product** - Sản phẩm bán
- Id, Name, Price, ImageUrl, CategoryId
- Trạng thái: ✅ Đã có

**4. Ingredient** - Nguyên liệu
- Id, Name, IngredientCategoryId, Description
- Trạng thái: ✅ Đã có

**5. IngredientCategory** - Danh mục nguyên liệu
- Id, Name, Description
- Trạng thái: ✅ Đã có

**6. IngredientUnit** - Đơn vị quy đổi
- Id, IngredientId, UnitName, ConversionFactor, IsBaseUnit
- Trạng thái: ✅ Đã có

**7. InventoryBatch** - Lô hàng trong kho
- Id, IngredientId, BatchCode, Quantity, ExpiryDate, CostPrice
- Trạng thái: ✅ Đã có

**8. Recipe** - Công thức (BOM)
- Id, ProductId, IngredientId, Quantity, Unit
- Trạng thái: ✅ Đã có

**9. Order** - Đơn hàng
- Id, OrderCode, UserId, TotalAmount, Status
- Trạng thái: ⚠️ Có Model nhưng chưa dùng

**10. OrderItem** - Chi tiết đơn hàng
- Id, OrderId, ProductId, Quantity, UnitPrice
- Trạng thái: ⚠️ Có Model nhưng chưa dùng

**11. Shift** - Ca làm việc
- Trạng thái: ❌ Chưa có
 

 VÀ CÁC MỤC CÒN THIẾU CỦA DỰ ÁN
---

## 💻 IV. BACKEND ARCHITECTURE

### Controllers (6 files)

| Controller | Endpoints | Chuẩn N-Tier | Ghi chú |
|------------|-----------|--------------|---------|
| **AuthController** | POST /login, GET /check-token | ✅ | Hoàn chỉnh |
| **CategoryController** | GET, POST, DELETE | ✅ | Thiếu PUT |
| **ProductController** | GET, POST, DELETE | ✅ | Thiếu PUT |
| **IngredientController** | GET, GET/{id}, POST, PUT, DELETE | ✅ | CRUD đầy đủ |
| **RecipeController** | GET, POST, DELETE | ✅ | Hoàn chỉnh |
| **IngredientCategoryController** | GET, POST, DELETE | ❌ | **KHÔNG CHUẨN** |

**Vấn đề:** IngredientCategoryController inject DbContext trực tiếp, không có Service/Repository

### Services (5 files)

| Service | Chức năng | Đánh giá |
|---------|-----------|----------|
| **AuthService** | JWT Login, Password Hashing | ✅ Tốt |
| **CategoryService** | CRUD danh mục | ✅ Tốt (thiếu Update) |
| **ProductService** | CRUD sản phẩm | ✅ Tốt (thiếu Update) |
| **RecipeService** | Quản lý công thức, check trùng | ✅ Tốt |
| **IngredientService** | Quản lý kho, tính tồn, FIFO | ✅ Phức tạp nhất (8.5KB) |

### Repositories (7 files)

| Repository | Chức năng | Đánh giá |
|------------|-----------|----------|
| **UserRepository** | CRUD User | ✅ Chuẩn |
| **CategoryRepository** | CRUD Category | ✅ Chuẩn |
| **ProductRepository** | CRUD Product | ✅ Chuẩn |
| **IngredientRepository** | CRUD Ingredient | ✅ Chuẩn |
| **IngredientUnitRepository** | CRUD Units | ✅ Chuẩn |
| **InventoryBatchRepository** | CRUD Batches, FIFO | ✅ Chuẩn |
| **RecipeRepository** | CRUD Recipe | ✅ Chuẩn |

**Điểm số Backend:** 7.5/10

---

## 🎨 V. FRONTEND ARCHITECTURE

### Pages (6 files)

| Page | Chức năng | Trạng thái |
|------|-----------|------------|
| **DangNhap.jsx** | Đăng nhập | ✅ Hoàn chỉnh |
| **QuanLySanPham.jsx** | Quản lý sản phẩm | ✅ Hoàn chỉnh |
| **QuanLyKho.jsx** | Quản lý kho | ✅ Hoàn chỉnh |
| **QuanLyDanhMuc.jsx** | Quản lý danh mục SP | ✅ Hoàn chỉnh |
| **QuanLyDanhMucNguyenLieu.jsx** | Quản lý danh mục NL | ✅ Hoàn chỉnh |
| **KDS_Bep.jsx** | Màn hình bếp | ⚠️ Chưa hoàn chỉnh |

### Components (10 files)

- ✅ Sidebar.jsx - Menu điều hướng
- ✅ Header.jsx - Tiêu đề
- ✅ ModalAddProduct.jsx - Thêm sản phẩm
- ✅ ModalAddIngredient.jsx - Thêm nguyên liệu
- ✅ ModalEditIngredient.jsx - Sửa nguyên liệu
- ✅ ModalAddCategory.jsx - Thêm danh mục
- ✅ ModalRecipe.jsx - Thêm công thức

### Services (7 files)

- ✅ authService.js
- ✅ categoryService.js
- ✅ productService.js
- ✅ ingredientService.js
- ✅ recipeService.js
- ✅ batchService.js
- ✅ ingredientCategoryService.js

**Điểm số Frontend:** 7.0/10

---

## ✅ VI. TÍNH NĂNG ĐÃ CÓ

### 1. Authentication & Authorization - 100% ✅
- JWT Login
- Token Refresh
- Role-based (Admin/Staff)
- Password Hashing

### 2. Quản lý Danh mục - 90% ⚠️
- CRUD danh mục sản phẩm
- **Thiếu:** API Update

### 3. Quản lý Sản phẩm - 90% ⚠️
- CRUD sản phẩm
- Upload ảnh
- **Thiếu:** API Update

### 4. Quản lý Công thức (BOM) - 100% ✅
- Thêm nguyên liệu vào món
- Định lượng chính xác
- Check trùng lặp
- Xóa nguyên liệu

### 5. Quản lý Kho - 95% ✅
- CRUD nguyên liệu
- Quản lý đơn vị (quy đổi)
- Quản lý lô hàng
- Tính tồn kho realtime
- FIFO (First In First Out)
- Cảnh báo HSD
- **Thiếu:** Nhập kho, Xuất kho, Kiểm kho

### 6. Quản lý Danh mục Nguyên liệu - 80% ⚠️
- CRUD danh mục nguyên liệu
- **Vấn đề:** Backend không chuẩn N-Tier

---

## ❌ VII. TÍNH NĂNG CẦN LÀM

### 1. POS Bán hàng - 0% ❌ **CRITICAL**

**Tầm quan trọng:** 🔴 CRITICAL  
**Lý do:** Đây là tính năng CHÍNH của hệ thống quán cafe

**Backend cần làm:**
- [ ] Sử dụng Model Order, OrderItem đã có
- [ ] Tạo OrderService, OrderRepository
- [ ] API: POST /api/orders (Tạo đơn)
- [ ] API: GET /api/orders/{id} (Chi tiết)
- [ ] API: GET /api/orders/today (Đơn hôm nay)
- [ ] Logic: Tính tổng tiền
- [ ] Logic: Trừ kho nguyên liệu theo BOM

**Frontend cần làm:**
- [ ] Page: QuanLyBanHang.jsx (POS Layout 3 cột)
- [ ] Component: MenuGrid.jsx (Danh sách món)
- [ ] Component: Cart.jsx (Giỏ hàng)
- [ ] Component: PaymentPanel.jsx (Thanh toán)
- [ ] Component: BillTemplate.jsx (In hóa đơn)
- [ ] Service: orderService.js

**Thời gian:** 1 tuần (6-7 ngày)

---

### 2. KDS Bếp + Real-time - 30% ⚠️ **CRITICAL**

**Tầm quan trọng:** 🔴 CRITICAL  
**Lý do:** Bếp cần biết món nào cần làm

**Đã có:**
- ✅ Page KDS_Bep.jsx (UI cơ bản)

**Backend cần làm:**
- [ ] Cài đặt SignalR (Microsoft.AspNetCore.SignalR)
- [ ] Tạo KitchenHub.cs
- [ ] API: PATCH /api/orders/{id}/status
- [ ] Enum: OrderStatus (Pending/Cooking/Done)
- [ ] Tích hợp SignalR vào OrderService

**Frontend cần làm:**
- [ ] Cài đặt @microsoft/signalr
- [ ] Tạo signalRConnection.js
- [ ] Tích hợp vào KDS_Bep.jsx
- [ ] Nhận đơn real-time
- [ ] Cập nhật trạng thái món
- [ ] UI: 3 cột (Chờ làm / Đang làm / Hoàn thành)

**Thời gian:** 1 tuần (6-7 ngày)

---

### 3. Quản lý Ca làm việc - 0% ❌ **IMPORTANT**

**Tầm quan trọng:** 🟡 IMPORTANT  
**Lý do:** Quản lý doanh thu theo ca

**Backend cần làm:**
- [ ] Tạo Model: Shift
- [ ] Tạo ShiftService, ShiftRepository
- [ ] API: POST /api/shifts/open (Mở ca)
- [ ] API: POST /api/shifts/close (Đóng ca)
- [ ] API: GET /api/shifts/{id}/report (Z-Report)
- [ ] Logic: Tính tổng doanh thu ca

**Frontend cần làm:**
- [ ] Modal: ModalOpenShift.jsx
- [ ] Modal: ModalCloseShift.jsx
- [ ] Page: BaoCaoCa.jsx

**Thời gian:** 3-4 ngày

---

### 4. Dashboard & Báo cáo - 0% ❌ **NICE TO HAVE**

**Tầm quan trọng:** 🟢 NICE TO HAVE

**Cần làm:**
- [ ] Dashboard tổng quan
- [ ] Biểu đồ doanh thu (Chart.js)
- [ ] Báo cáo theo ngày/tháng
- [ ] Export Excel

**Thời gian:** 3-4 ngày

---

## 🗓️ VIII. LỘ TRÌNH 4 TUẦN

### **TUẦN 1: POS Bán hàng (23/12 - 29/12)**

**Ngày 1-2 (23-24/12): Backend API**
- Thiết kế API Orders
- Viết OrderService
- Viết OrderRepository
- Test bằng Postman

**Ngày 3-4 (25-26/12): Frontend UI**
- Tạo Page POS Layout
- Component MenuGrid
- Component Cart
- Component PaymentPanel

**Ngày 5-6 (27-28/12): Tích hợp**
- Kết nối API
- In hóa đơn
- Test toàn bộ flow

**Ngày 7 (29/12): Testing & Fix bugs**

**Deliverable:** ✅ POS hoàn chỉnh

---

### **TUẦN 2: KDS Bếp + Real-time (30/12 - 05/01)**

**Ngày 1-2 (30-31/12): SignalR Backend**
- Cài đặt SignalR
- Tạo KitchenHub
- Update OrderService
- Test SignalR

**Ngày 3-4 (01-02/01): Frontend KDS**
- Cài đặt SignalR Client
- Tích hợp vào KDS_Bep.jsx
- UI 3 cột
- Cập nhật trạng thái

**Ngày 5-6 (03-04/01): Testing Real-time**
- Test POS → KDS
- Test nhiều thiết bị
- Fix bugs

**Ngày 7 (05/01): Hoàn thiện**

**Deliverable:** ✅ KDS hoạt động real-time

---

### **TUẦN 3: Quản lý Ca + Dashboard (06/01 - 12/01)**

**Ngày 1-2 (06-07/01): Shifts Backend**
- Model Shift
- API Mở/Đóng ca
- Logic tính doanh thu

**Ngày 3-4 (08-09/01): Shifts Frontend**
- Modal Mở ca
- Modal Đóng ca
- Page Báo cáo ca

**Ngày 5-6 (10-11/01): Dashboard**
- Dashboard tổng quan
- Biểu đồ doanh thu
- Export Excel

**Ngày 7 (12/01): Testing**

**Deliverable:** ✅ Quản lý ca + Dashboard

---

### **TUẦN 4: Tài liệu + Testing + Demo (13/01 - 19/01)**

**Ngày 1-3 (13-15/01): Tài liệu**
- Figma Design (POS, KDS, Admin)
- Sequence Diagram
- API Documentation
- User Manual

**Ngày 4-5 (16-17/01): Testing**
- Unit Tests (Services)
- Integration Tests (Controllers)
- Test Report

**Ngày 6-7 (18-19/01): Deployment & Demo**
- Docker Compose
- Deploy lên Cloud
- Video Demo 5-10 phút

**Deliverable:** ✅ Báo cáo hoàn chỉnh

---

## ⚠️ IX. VẤN ĐỀ CẦN SỬA NGAY

### 1. IngredientCategoryController không chuẩn N-Tier

**Vấn đề:**
- Controller inject DbContext trực tiếp
- Không có Service
- Không có Repository

**Giải pháp:**
- Tạo IIngredientCategoryService + IngredientCategoryService
- Tạo IIngredientCategoryRepository + IngredientCategoryRepository
- Sửa Controller inject Service

**Thời gian:** 2-3 giờ

---

### 2. Thiếu Update API cho Product & Category

**Vấn đề:**
- CategoryController thiếu PUT /api/category/{id}
- ProductController thiếu PUT /api/product/{id}

**Giải pháp:**
- Thêm UpdateAsync vào Service
- Thêm PUT endpoint vào Controller

**Thời gian:** 2-3 giờ

---

## 📊 X. BẢNG TỔNG HỢP TIẾN ĐỘ

| Module | Backend | Frontend | Tổng | Ưu tiên |
|--------|---------|----------|------|---------|
| **Auth** | 100% ✅ | 100% ✅ | 100% | - |
| **Category** | 90% ⚠️ | 90% ⚠️ | 90% | Thấp |
| **Product** | 90% ⚠️ | 90% ⚠️ | 90% | Thấp |
| **Recipe** | 100% ✅ | 100% ✅ | 100% | - |
| **Ingredient** | 95% ✅ | 95% ✅ | 95% | Thấp |
| **IngredientCategory** | 60% ⚠️ | 100% ✅ | 80% | **Cao** |
| **Order/POS** | 0% ❌ | 0% ❌ | 0% | **CAO NHẤT** |
| **KDS** | 0% ❌ | 30% ⚠️ | 15% | **CAO NHẤT** |
| **Shift** | 0% ❌ | 0% ❌ | 0% | Trung |
| **Dashboard** | 0% ❌ | 0% ❌ | 0% | Thấp |

**Tổng tiến độ:** 70%

---

## 🎯 XI. MỤC TIÊU ĐIỂM SỐ

### Phân bổ điểm chi tiết:

| Tiêu chí | Trọng số | Hiện tại | Mục tiêu | Cần làm |
|----------|----------|----------|----------|---------|
| **1. Phân tích & Thiết kế** | 20% | 18% | 20% | +2% |
| - Use Case Diagram | 5% | 5% ✅ | 5% | - |
| - ERD Database | 5% | 5% ✅ | 5% | - |
| - Class Diagram | 5% | 5% ✅ | 5% | - |
| - UI/UX Mockup | 5% | 0% ❌ | 5% | Figma |
| **2. Chức năng hệ thống** | 40% | 20% | 38% | +18% |
| - Quản lý Kho & BOM | 10% | 10% ✅ | 10% | - |
| - POS Bán hàng | 15% | 0% ❌ | 14% | Tuần 1 |
| - KDS Bếp Real-time | 10% | 0% ❌ | 9% | Tuần 2 |
| - Quản lý Ca & Báo cáo | 5% | 0% ❌ | 5% | Tuần 3 |
| **3. Kiến trúc & Code Quality** | 20% | 16% | 20% | +4% |
| - N-Tier Architecture | 8% | 8% ✅ | 8% | - |
| - Security (JWT, RBAC) | 6% | 5% ⚠️ | 6% | Sửa |
| - Unit Tests | 6% | 0% ❌ | 6% | Tuần 4 |
| **4. Tài liệu & Báo cáo** | 15% | 8% | 15% | +7% |
| - Báo cáo kỹ thuật | 8% | 5% ⚠️ | 8% | Tuần 4 |
| - User Manual | 4% | 0% ❌ | 4% | Tuần 4 |
| - API Documentation | 3% | 3% ✅ | 3% | - |
| **5. Demo & Deployment** | 5% | 2% | 5% | +3% |
| - Video Demo | 2% | 0% ❌ | 2% | Tuần 4 |
| - Deploy Cloud | 3% | 2% ⚠️ | 3% | Tuần 4 |

### Tổng điểm:
- **Hiện tại:** 6.4/10 (64%)
- **Sau 4 tuần:** 8.3/10 (83%) ✅
- **Cần cải thiện:** +1.9 điểm

---

## ✅ XII. CHECKLIST HÀNH ĐỘNG

### Ngay lập tức (Hôm nay - 23/12)
- [ ] Đọc và hiểu toàn bộ tài liệu này
- [ ] Xác nhận lộ trình 4 tuần với giảng viên
- [ ] Sửa IngredientCategoryController (2-3 giờ)
- [ ] Thêm Update API cho Product & Category (2-3 giờ)

### Tuần 1 (23/12 - 29/12) - POS
- [ ] Backend: OrderService, OrderRepository
- [ ] Backend: API POST /api/orders
- [ ] Frontend: QuanLyBanHang.jsx
- [ ] Frontend: MenuGrid, Cart, PaymentPanel
- [ ] Tích hợp và Testing

### Tuần 2 (30/12 - 05/01) - KDS
- [ ] Backend: SignalR + KitchenHub
- [ ] Backend: API PATCH /api/orders/{id}/status
- [ ] Frontend: SignalR Client
- [ ] Frontend: Hoàn thiện KDS_Bep.jsx
- [ ] Testing Real-time

### Tuần 3 (06/01 - 12/01) - Shifts
- [ ] Backend: Shift Model + API
- [ ] Frontend: Modal Mở/Đóng ca
- [ ] Dashboard & Báo cáo

### Tuần 4 (13/01 - 19/01) - Hoàn thiện
- [ ] Figma Mockup
- [ ] Unit Tests
- [ ] Tài liệu
- [ ] Video Demo

---

## 🎓 XIII. KẾT LUẬN

### Điểm mạnh:
✅ Kiến trúc N-Tier chuẩn chỉnh  
✅ Database thiết kế tốt (BOM, Audit Log)  
✅ Security chặt chẽ (JWT, Authorization)  
✅ Frontend hiện đại (React + Material-UI)  
✅ Quản lý kho phức tạp và hoàn chỉnh

### Điểm yếu:
❌ Thiếu tính năng CORE (POS, KDS, Shifts)  
❌ 1 Controller không chuẩn N-Tier  
❌ Thiếu tài liệu (Figma, Testing, Manual)  
❌ Chưa deploy hoàn chỉnh

### Đánh giá tổng thể:
- **Hiện tại:** 6.4/10 - Chưa đủ điểm 8+
- **Tiềm năng:** 8.3/10 - Nếu hoàn thành Roadmap 4 tuần

### Khuyến nghị:

**🚀 TẬP TRUNG VÀO 3 TÍNH NĂNG CORE:**
1. **POS Bán hàng** (Tuần 1) - CRITICAL
2. **KDS Bếp Real-time** (Tuần 2) - CRITICAL
3. **Quản lý Ca & Báo cáo** (Tuần 3) - IMPORTANT

**📚 HOÀN THIỆN TÀI LIỆU:**
- Figma Mockup
- Testing Report
- User Manual
- Video Demo

**🎯 MỤC TIÊU:** Hoàn thành 100% trong 4 tuần → Đạt điểm 8.3/10

---



---

**Ngày tạo:** 23/12/2025  
**Người tạo:** AI Assistant  
**Trạng thái:** ✅ SẴN SÀNG HÀNH ĐỘNG

**Liên hệ AI Assistant bất cứ lúc nào cần hỗ trợ!** 🚀
