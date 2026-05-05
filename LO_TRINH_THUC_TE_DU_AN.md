# 🎯 LỘ TRÌNH THỰC TẾ DỰ ÁN - CAFEMINHHUU SMART POS

## 📅 Timeline: 10/12/2025 → 01/04/2026 (3.5 tháng)

---

## 📊 PHÂN TÍCH ĐỊNH HƯỚNG & THỰC TẾ

### ✅ **Điểm mạnh của định hướng:**
- Mục tiêu rõ ràng: Smart POS cho quán cà phê
- Tính năng đầy đủ: Menu, Kho, Order QR, KDS, BOM, Báo cáo
- Có tầm nhìn dài hạn: Multi-tenant, thương mại hóa

### ⚠️ **Thách thức với timeline:**
- Chỉ còn **3.5 tháng** đến khi báo cáo
- Cần **1 tháng** chuẩn bị tài liệu → Chỉ còn **2.5 tháng** code
- Định hướng có nhiều tính năng → Cần **ưu tiên**

---

## 🎯 CHIẾN LƯỢC: MVP++ (Minimum Viable Product Plus)

### **Nguyên tắc:**
1. ✅ **Làm đủ để demo tốt** (không cần 100% hoàn hảo)
2. ✅ **Tập trung vào tính năng nổi bật** (Order QR + KDS)
3. ✅ **Đơn giản hóa phần phức tạp** (Báo cáo dùng mock data)
4. ✅ **Để lại "hướng phát triển"** trong báo cáo

---

## 📋 LỘ TRÌNH CỤ THỂ (10/12/2025 → 01/03/2026)

### 🗓️ **GIAI ĐOẠN 1: HOÀN THIỆN NỀN TẢNG** (10/12 → 31/12) - 3 tuần

#### **Tuần 1 (10-16/12): Backend Core**
- [x] ✅ Đã có: Users, Products, Orders, JWT Auth
- [x] ✅ Đã có: DbContext, Migration
- [ ] **Cần làm:**
  - [ ] Hoàn thiện Ingredient Module (đang làm)
    - [ ] Thêm `IngredientType` (PACKAGED/BULK/LIQUID)
    - [ ] Thêm `PackageUnit`, `PackageSize`
    - [ ] Migration
  - [ ] Hoàn thiện InventoryBatch (đã có cơ bản)
  - [ ] Kiểm tra Recipe/BOM (đã có cơ bản)

#### **Tuần 2 (17-23/12): Frontend Quản lý**
- [ ] **Hoàn thiện trang quản lý:**
  - [x] ✅ Quản lý Danh mục Sản phẩm
  - [x] ✅ Quản lý Sản phẩm
  - [x] ✅ Quản lý Danh mục Nguyên liệu
  - [x] ✅ Quản lý Kho Nguyên liệu
  - [ ] Cải thiện Modal Nhập Kho (đơn giản hóa)
  - [ ] Quản lý Công thức (Recipe/BOM)

#### **Tuần 3 (24-31/12): Chuẩn bị Order**
- [ ] **Backend Order:**
  - [ ] Tạo Model: Table, Order, OrderItem, OrderStatus
  - [ ] Migration
  - [ ] Repository, Service, Controller
  - [ ] API: Create Order, Update Status, Get Orders
- [ ] **Test API cơ bản**

---

### 🗓️ **GIAI ĐOẠN 2: ORDER QR CODE** (01/01 → 31/01) - 4 tuần

#### **Tuần 1 (01-07/01): QR Code & Menu**
- [ ] **Tạo QR Code cho từng bàn**
  - [ ] Tạo bảng Table (TableNumber, QRCode, Status)
  - [ ] Generate QR Code (dùng thư viện QRCode.js)
  - [ ] API: Get Table Info by QR
- [ ] **Frontend Customer (Mobile-friendly)**
  - [ ] Trang quét QR → Nhận mã bàn
  - [ ] Trang Menu (hiển thị sản phẩm theo category)
  - [ ] Responsive design

#### **Tuần 2 (08-14/01): Giỏ hàng & Đặt món**
- [ ] **Frontend Customer:**
  - [ ] Giỏ hàng (Cart)
  - [ ] Thêm/Xóa/Sửa món
  - [ ] Hiển thị tổng tiền
  - [ ] Nút "Đặt món"
- [ ] **Backend:**
  - [ ] API: Create Order từ Cart
  - [ ] Tự động trừ kho theo BOM
  - [ ] Validate tồn kho

#### **Tuần 3 (15-21/01): Trạng thái đơn hàng**
- [ ] **Frontend Customer:**
  - [ ] Trang xem trạng thái đơn
  - [ ] Hiển thị: Đang chờ → Đang làm → Sẵn sàng → Hoàn thành
  - [ ] Polling mỗi 5s để update (không dùng SignalR)
- [ ] **Backend:**
  - [ ] API: Get Order Status
  - [ ] API: Update Order Status

#### **Tuần 4 (22-31/01): Thanh toán**
- [ ] **Tích hợp VNPay** (hoặc mock nếu không kịp)
  - [ ] API: Create Payment URL
  - [ ] API: Verify Payment Callback
  - [ ] Update Order Status sau thanh toán
- [ ] **Thanh toán tiền mặt**
  - [ ] Cashier xác nhận thanh toán
  - [ ] Update Order Status

---

### 🗓️ **GIAI ĐOẠN 3: KDS & DASHBOARD** (01/02 → 28/02) - 4 tuần

#### **Tuần 1 (01-07/02): KDS (Kitchen Display System)**
- [ ] **Frontend KDS:**
  - [ ] Trang hiển thị đơn hàng realtime
  - [ ] Sắp xếp theo thời gian
  - [ ] Đánh dấu món: Đang chờ → Đang làm → Hoàn thành
  - [ ] Polling mỗi 3s để update
  - [ ] Responsive cho màn hình lớn (TV/Tablet)
- [ ] **Backend:**
  - [ ] API: Get Pending Orders
  - [ ] API: Update Order Item Status

#### **Tuần 2 (08-14/02): Dashboard Manager**
- [ ] **Dashboard Tổng quan:**
  - [ ] Doanh thu hôm nay/tuần/tháng (Chart.js)
  - [ ] Số đơn hàng
  - [ ] Sản phẩm bán chạy (Top 5)
  - [ ] Tồn kho cảnh báo (sắp hết)
- [ ] **Backend:**
  - [ ] API: Get Revenue Statistics
  - [ ] API: Get Top Products
  - [ ] API: Get Low Stock Ingredients

#### **Tuần 3 (15-21/02): Testing & Bug Fix**
- [ ] **Test toàn bộ flow:**
  - [ ] Customer: Quét QR → Đặt món → Thanh toán
  - [ ] KDS: Nhận đơn → Cập nhật trạng thái
  - [ ] Manager: Xem dashboard, quản lý kho
- [ ] **Fix bug, tối ưu UI/UX**

#### **Tuần 4 (22-28/02): Hoàn thiện & Demo**
- [ ] **Chuẩn bị demo data:**
  - [ ] Tạo 10-15 sản phẩm mẫu
  - [ ] Tạo 5-10 nguyên liệu mẫu
  - [ ] Tạo 3-5 công thức mẫu
  - [ ] Tạo 10 bàn với QR code
- [ ] **Làm đẹp UI/UX**
- [ ] **Ghi video demo** (5-10 phút)

---

### 🗓️ **GIAI ĐOẠN 4: BÁO CÁO** (01/03 → 01/04) - 4 tuần

#### **Tuần 1 (01-07/03): Phần 1 - Tổng quan**
- [ ] **Chương 1: Giới thiệu**
  - [ ] Lý do chọn đề tài
  - [ ] Mục tiêu, phạm vi
  - [ ] Đối tượng sử dụng
- [ ] **Chương 2: Cơ sở lý thuyết**
  - [ ] POS System là gì?
  - [ ] QR Code Ordering
  - [ ] Kitchen Display System
  - [ ] Công nghệ sử dụng (.NET, React, SQL Server)

#### **Tuần 2 (08-14/03): Phần 2 - Phân tích & Thiết kế**
- [ ] **Chương 3: Phân tích yêu cầu**
  - [ ] Use Case Diagram
  - [ ] User Stories
  - [ ] Functional Requirements
  - [ ] Non-functional Requirements
- [ ] **Chương 4: Thiết kế hệ thống**
  - [ ] Kiến trúc tổng thể (Layered Architecture)
  - [ ] Database Diagram (ERD)
  - [ ] Sequence Diagram (Order flow)
  - [ ] Class Diagram (chính)

#### **Tuần 3 (15-21/03): Phần 3 - Cài đặt & Kết quả**
- [ ] **Chương 5: Cài đặt**
  - [ ] Mô tả các module chính
  - [ ] Code snippet quan trọng
  - [ ] Screenshot giao diện
- [ ] **Chương 6: Kết quả & Đánh giá**
  - [ ] Kết quả đạt được
  - [ ] So sánh với mục tiêu
  - [ ] Testing results
  - [ ] Ưu điểm, nhược điểm

#### **Tuần 4 (22-31/03): Hoàn thiện & Slide**
- [ ] **Chương 7: Kết luận**
  - [ ] Tổng kết
  - [ ] Hạn chế
  - [ ] Hướng phát triển (Multi-tenant, CRM...)
- [ ] **Làm slide PowerPoint** (15-20 slides)
- [ ] **Chuẩn bị kịch bản thuyết trình** (10-15 phút)
- [ ] **In ấn, đóng quyển**

---

## 🎯 TÍNH NĂNG ƯU TIÊN

### ✅ **BẮT BUỘC PHẢI CÓ** (Core Features)
1. ✅ Quản lý Menu/Sản phẩm/Danh mục
2. ✅ Quản lý Kho Nguyên liệu (Ingredient, Batch)
3. ✅ Quản lý Công thức (BOM/Recipe)
4. ✅ **Order qua QR Code** (Tính năng nổi bật #1)
5. ✅ **KDS - Kitchen Display System** (Tính năng nổi bật #2)
6. ✅ Tự động trừ kho theo công thức
7. ✅ Dashboard cơ bản (doanh thu, tồn kho)

### 🔧 **NÊN CÓ** (Nice to Have)
1. 🔧 Thanh toán VNPay (nếu kịp)
2. 🔧 Báo cáo chi tiết (biểu đồ)
3. 🔧 Phân quyền (Admin/Manager/Cashier/Chef)
4. 🔧 Lịch sử đơn hàng

### 💡 **TỐT NẾU CÓ** (Future Work)
1. 💡 SignalR Realtime (dùng Polling thay thế)
2. 💡 Multi-tenant
3. 💡 CRM
4. 💡 Mobile App (PWA là đủ)
5. 💡 AI gợi ý món

---

## 🚀 QUYẾT ĐỊNH NGAY (TUẦN NÀY)

### **Câu hỏi 1: Nhập kho**
**Đề xuất: CHỌN A - Thêm trường DB**

Lý do:
- ✅ Chuẩn, chuyên nghiệp
- ✅ Dễ giải thích trong báo cáo
- ✅ Chỉ mất 2-3 ngày
- ✅ Phù hợp với định hướng "Smart POS"

**Action:**
- [ ] Tạo Migration thêm: `IngredientType`, `PackageUnit`, `PackageSize`, `PackageSizeUnit`
- [ ] Update Model, DTO, Service
- [ ] Update Frontend Modal

---

### **Câu hỏi 2: Thanh toán**
**Đề xuất: CHỌN A - VNPay thật (nếu kịp)**

Lý do:
- ✅ Điểm cộng lớn khi demo
- ✅ Bạn đã có kinh nghiệm VNPay
- ✅ Không khó, chỉ mất 3-4 ngày

**Backup plan:**
- Nếu không kịp → Mock thanh toán online
- Vẫn có thanh toán tiền mặt

---

### **Câu hỏi 3: Realtime**
**Đề xuất: CHỌN B - Polling (đơn giản)**

Lý do:
- ✅ Đủ dùng cho demo
- ✅ Tiết kiệm thời gian
- ✅ Ít bug hơn SignalR
- ✅ Có thể nâng cấp sau (ghi vào "Hướng phát triển")

**Implementation:**
- Customer: Polling mỗi 5s
- KDS: Polling mỗi 3s
- Dashboard: Polling mỗi 10s

---

## 📊 PHÂN BỔ CÔNG SỨC

| Giai đoạn | Thời gian | % Công sức | Ưu tiên |
|-----------|-----------|------------|---------|
| Hoàn thiện nền tảng | 3 tuần | 20% | Cao |
| Order QR Code | 4 tuần | 35% | **Rất cao** |
| KDS & Dashboard | 4 tuần | 30% | **Rất cao** |
| Báo cáo | 4 tuần | 15% | Cao |

---

## ✅ CHECKLIST HOÀN THÀNH

### **Để đạt điểm tốt, cần:**
- [ ] ✅ Hệ thống chạy ổn định, không crash
- [ ] ✅ UI/UX đẹp, chuyên nghiệp
- [ ] ✅ Order QR Code hoạt động tốt
- [ ] ✅ KDS realtime (polling)
- [ ] ✅ Tự động trừ kho theo BOM
- [ ] ✅ Dashboard có biểu đồ
- [ ] ✅ Code clean, có comment
- [ ] ✅ Báo cáo đầy đủ, rõ ràng
- [ ] ✅ Slide đẹp, demo mượt
- [ ] ✅ Video demo chất lượng

---

## 🎯 KẾT LUẬN

**Với lộ trình này:**
- ✅ **Khả thi 90%** nếu bạn tập trung
- ✅ **Đủ tính năng** để demo tốt
- ✅ **Có điểm nhấn** (QR Order + KDS)
- ✅ **Có thời gian** viết báo cáo kỹ
- ✅ **Có backup plan** nếu gặp khó khăn

**Bắt đầu ngay:**
1. Quyết định về nhập kho (A/B)
2. Tôi sẽ implement ngay tuần này
3. Tuần sau bắt đầu Order QR Code

Bạn đồng ý với lộ trình này không? 🚀
