# 📐 PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG - SMARTPOS QUÁN CÀ PHÊ MINH HỮU

**Ngày:** 23/12/2025  
**Đề tài:** Xây dựng website SmartPOS quản lý quán Cà Phê Minh Hữu  
**Người thực hiện:** Nguyễn Hữu Hạnh

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Phân tích Actors](#2-phân-tích-actors)
3. [Use Cases tổng quan](#3-use-cases-tổng-quan)
4. [Phân khu chức năng](#4-phân-khu-chức-năng)
5. [Luồng nghiệp vụ chi tiết](#5-luồng-nghiệp-vụ-chi-tiết)
6. [Yêu cầu phi chức năng](#6-yêu-cầu-phi-chức-năng)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Tên đề tài
**"Xây dựng website SmartPOS quản lý quán Cà Phê Minh Hữu"**

### 1.2. Mục tiêu
Xây dựng một hệ thống quản lý quán cà phê toàn diện với:
- Quản trị tập trung (Admin Dashboard)
- Bán hàng thông minh (SmartPOS)
- Bếp hiển thị realtime (KDS)
- Khách hàng tự đặt món (Web Order + QR Code)
- Quản lý bàn realtime

### 1.3. Phạm vi
- **Loại hình:** Website (Web Application)
- **Công nghệ:** ASP.NET Core + React + SignalR
- **Triển khai:** Cloud-based
- **Người dùng:** Admin, Cashier, Bếp, Khách hàng

---

## 2. PHÂN TÍCH ACTORS

### 2.1. Actor 1: ADMIN (Quản trị viên)

**Vai trò:** Quản lý toàn bộ hệ thống

**Quyền hạn:**
- Quản lý toàn bộ dữ liệu (CRUD)
- Xem báo cáo, thống kê
- Quản lý nhân viên, phân quyền
- Cấu hình hệ thống

**Chức năng chính:**
1. **Dashboard tổng quan**
   - Xem doanh thu realtime
   - Xem số đơn hàng
   - Xem trạng thái bàn
   - Xem tồn kho

2. **Quản lý Sản phẩm**
   - CRUD sản phẩm (món ăn, đồ uống)
   - Quản lý danh mục
   - Quản lý giá, hình ảnh
   - Quản lý size, topping

3. **Quản lý Kho**
   - CRUD nguyên liệu
   - Quản lý lô hàng
   - Nhập/Xuất kho
   - Kiểm kho
   - Cảnh báo hết hàng, hết hạn

4. **Quản lý Công thức (BOM)**
   - Định lượng nguyên liệu cho từng món
   - Quy đổi đơn vị

5. **Quản lý Bàn**
   - CRUD bàn
   - Quản lý khu vực (tầng 1, tầng 2, sân thượng...)
   - Tạo QR Code cho từng bàn

6. **Quản lý Nhân viên**
   - CRUD nhân viên
   - Phân quyền (Admin, Cashier, Kitchen)
   - Quản lý ca làm việc

7. **Báo cáo & Thống kê**
   - Báo cáo doanh thu (ngày, tuần, tháng)
   - Báo cáo món bán chạy
   - Báo cáo tồn kho
   - Báo cáo ca làm việc
   - Export Excel, PDF

---

### 2.2. Actor 2: CASHIER (Thu ngân)

**Vai trò:** Bán hàng tại quầy

**Quyền hạn:**
- Tạo đơn hàng
- Thanh toán
- In hóa đơn
- Xem đơn hàng của mình

**Chức năng chính:**
1. **SmartPOS - Bán hàng**
   - Chọn món từ menu
   - Chọn size (S/M/L)
   - Chọn topping
   - Thêm vào giỏ hàng
   - Tính tổng tiền tự động
   - Chọn phương thức thanh toán (Tiền mặt, Thẻ, Chuyển khoản)
   - Tạo đơn hàng
   - In hóa đơn

2. **Quản lý Ca làm việc**
   - Mở ca (nhập tiền đầu ca)
   - Đóng ca (đếm tiền cuối ca)
   - Xem báo cáo ca

3. **Quản lý Bàn**
   - Xem trạng thái bàn (Trống/Đang dùng)
   - Gán đơn hàng cho bàn
   - Chuyển bàn
   - Gộp bàn

4. **Xem đơn hàng**
   - Xem đơn hàng hôm nay
   - Xem trạng thái món (Đang làm/Xong)

---

### 2.3. Actor 3: BẾP (Kitchen Staff)

**Vai trò:** Chế biến món ăn và quản lý kho

**Quyền hạn:**
- Xem đơn hàng realtime
- Cập nhật trạng thái món
- Nhập kho nguyên liệu

**Chức năng chính:**
1. **KDS - Kitchen Display System**
   - Nhận đơn mới realtime (SignalR)
   - Hiển thị 3 cột:
     - **Chờ làm** (Pending) - Màu vàng cam
     - **Đang làm** (Cooking) - Màu xanh dương
     - **Hoàn thành** (Done) - Màu xanh lá
   - Cập nhật trạng thái món:
     - Bấm "Bắt đầu" → Chuyển sang Đang làm
     - Bấm "Hoàn thành" → Chuyển sang Hoàn thành
   - Hiển thị thời gian chờ
   - Âm thanh thông báo đơn mới

2. **Nhập kho**
   - Nhập nguyên liệu mới
   - Nhập thông tin lô hàng:
     - Số lượng
     - Giá nhập
     - Ngày sản xuất
     - Hạn sử dụng
     - Vị trí lưu trữ
   - Quét mã vạch (nếu có)

3. **Kiểm kho**
   - Kiểm đếm tồn kho thực tế
   - So sánh với hệ thống
   - Báo cáo chênh lệch

---

### 2.4. Actor 4: KHÁCH HÀNG (Customer)

**Vai trò:** Đặt món và thanh toán

**Quyền hạn:**
- Xem menu
- Đặt món
- Thanh toán online
- Xem trạng thái bàn

**Chức năng chính:**
1. **Xem Menu trực tuyến**
   - Xem danh sách món
   - Xem hình ảnh, mô tả, giá
   - Lọc theo danh mục
   - Tìm kiếm món

2. **Xem Bàn trống (Realtime)**
   - Xem sơ đồ bàn
   - Biết bàn nào đang trống
   - Biết bàn nào đang có khách
   - Cập nhật realtime (SignalR)

3. **Đặt món qua QR Code**
   - Quét QR Code trên bàn
   - Tự động nhận diện số bàn
   - Chọn món từ menu
   - Chọn size, topping
   - Gửi đơn hàng cho bếp
   - Theo dõi trạng thái món

4. **Đặt món qua Web (Mang đi)**
   - Chọn món
   - Chọn thời gian lấy
   - Nhập thông tin liên hệ
   - Thanh toán online (VNPay)
   - Nhận mã đơn hàng

5. **Theo dõi đơn hàng**
   - Xem trạng thái món
   - Nhận thông báo khi món xong
   - Gọi nhân viên (nếu cần)

---

## 3. USE CASES TỔNG QUAN

### 3.1. Use Case Diagram (Mô tả text)

```
ADMIN:
├── UC01: Quản lý Sản phẩm (CRUD)
├── UC02: Quản lý Danh mục (CRUD)
├── UC03: Quản lý Nguyên liệu (CRUD)
├── UC04: Quản lý Công thức (BOM)
├── UC05: Quản lý Bàn (CRUD + QR Code)
├── UC06: Quản lý Nhân viên (CRUD + Phân quyền)
├── UC07: Xem Dashboard
├── UC08: Xem Báo cáo & Thống kê
└── UC09: Cấu hình hệ thống

CASHIER:
├── UC10: Đăng nhập
├── UC11: Mở ca làm việc
├── UC12: Bán hàng (SmartPOS)
│   ├── UC12.1: Chọn món
│   ├── UC12.2: Chọn size/topping
│   ├── UC12.3: Thanh toán
│   └── UC12.4: In hóa đơn
├── UC13: Quản lý Bàn (Xem, Gán, Chuyển, Gộp)
├── UC14: Xem đơn hàng
└── UC15: Đóng ca làm việc

BẾP:
├── UC16: Đăng nhập
├── UC17: Xem đơn hàng realtime (KDS)
├── UC18: Cập nhật trạng thái món
├── UC19: Nhập kho nguyên liệu
└── UC20: Kiểm kho

KHÁCH HÀNG:
├── UC21: Xem Menu trực tuyến
├── UC22: Xem Bàn trống (Realtime)
├── UC23: Đặt món qua QR Code
│   ├── UC23.1: Quét QR Code
│   ├── UC23.2: Chọn món
│   └── UC23.3: Gửi đơn hàng
├── UC24: Đặt món qua Web (Mang đi)
└── UC25: Theo dõi đơn hàng
```

---

## 4. PHÂN KHU CHỨC NĂNG

### 4.1. PHÂN KHU 1: ADMIN DASHBOARD

**Mô tả:** Trung tâm quản trị toàn bộ hệ thống

**Trang chính:**
1. **Dashboard (Tổng quan)**
   - Card: Doanh thu hôm nay
   - Card: Số đơn hàng
   - Card: Số bàn đang dùng
   - Card: Cảnh báo tồn kho
   - Biểu đồ: Doanh thu 7 ngày
   - Biểu đồ: Top món bán chạy
   - Bảng: Đơn hàng gần nhất

2. **Quản lý Sản phẩm**
   - Danh sách sản phẩm (Table)
   - Modal: Thêm/Sửa sản phẩm
   - Upload ảnh
   - Chọn danh mục
   - Nhập giá, mô tả
   - Quản lý size (S/M/L với giá khác nhau)
   - Quản lý topping

3. **Quản lý Danh mục**
   - Danh sách danh mục
   - Modal: Thêm/Sửa/Xóa

4. **Quản lý Kho**
   - Tab 1: Nguyên liệu
     - Danh sách nguyên liệu
     - Hiển thị tồn kho realtime
     - Cảnh báo hết hàng, hết hạn
   - Tab 2: Lô hàng
     - Danh sách lô hàng
     - FIFO
   - Tab 3: Nhập kho
     - Form nhập kho
   - Tab 4: Xuất kho
     - Form xuất kho
   - Tab 5: Kiểm kho
     - Form kiểm kho

5. **Quản lý Công thức (BOM)**
   - Chọn sản phẩm
   - Thêm nguyên liệu
   - Nhập định lượng
   - Chọn đơn vị

6. **Quản lý Bàn**
   - Sơ đồ bàn (Grid layout)
   - Modal: Thêm/Sửa bàn
   - Chọn khu vực
   - Tạo QR Code tự động
   - In QR Code

7. **Quản lý Nhân viên**
   - Danh sách nhân viên
   - Modal: Thêm/Sửa nhân viên
   - Phân quyền (Admin/Cashier/Kitchen)
   - Quản lý ca làm việc

8. **Báo cáo & Thống kê**
   - Báo cáo doanh thu
   - Báo cáo món bán chạy
   - Báo cáo tồn kho
   - Báo cáo ca làm việc
   - Export Excel, PDF

---

### 4.2. PHÂN KHU 2: CASHIER - SMARTPOS

**Mô tả:** Giao diện bán hàng tại quầy

**Layout:** 3 cột

**Cột 1: Menu (Bên trái - 40%)**
- Tab: Danh mục sản phẩm
- Grid: Danh sách món (Card với hình ảnh)
- Click món → Modal chọn size/topping

**Cột 2: Giỏ hàng (Giữa - 35%)**
- Danh sách món đã chọn
- Hiển thị: Tên món, Size, Topping, Số lượng, Giá
- Button: Tăng/Giảm số lượng
- Button: Xóa món
- Hiển thị: Tổng tiền

**Cột 3: Thanh toán (Bên phải - 25%)**
- Chọn phương thức thanh toán:
  - Tiền mặt
  - Thẻ
  - Chuyển khoản
- Nhập tiền khách đưa (nếu tiền mặt)
- Hiển thị tiền thừa
- Button: Thanh toán
- Button: In hóa đơn

**Chức năng bổ sung:**
- Chọn bàn (nếu khách ăn tại chỗ)
- Ghi chú đơn hàng
- Áp dụng mã giảm giá (nếu có)

---

### 4.3. PHÂN KHU 3: BẾP - KDS + NHẬP KHO

**Mô tả:** Màn hình bếp và quản lý kho

**Trang 1: KDS (Kitchen Display System)**

**Layout:** 3 cột (Kanban style)

**Cột 1: Chờ làm (Pending) - Màu vàng cam**
- Danh sách món mới nhận
- Hiển thị:
  - Số bàn (nếu có)
  - Tên món
  - Size
  - Topping
  - Số lượng
  - Ghi chú
  - Thời gian đặt
- Button: "Bắt đầu"

**Cột 2: Đang làm (Cooking) - Màu xanh dương**
- Danh sách món đang chế biến
- Hiển thị thời gian đã làm
- Button: "Hoàn thành"

**Cột 3: Hoàn thành (Done) - Màu xanh lá**
- Danh sách món đã xong
- Tự động xóa sau 5 phút

**Tính năng:**
- Realtime (SignalR)
- Âm thanh thông báo đơn mới
- Sắp xếp theo thời gian (FIFO)

**Trang 2: Nhập kho**
- Form nhập kho:
  - Chọn nguyên liệu
  - Nhập số lượng
  - Nhập giá nhập
  - Nhập ngày sản xuất
  - Nhập hạn sử dụng
  - Chọn vị trí lưu trữ
- Button: Lưu

---

### 4.4. PHÂN KHU 4: KHÁCH HÀNG - WEB ORDER + QR CODE

**Mô tả:** Giao diện cho khách hàng

**Trang 1: Trang chủ**
- Banner quán
- Menu nổi bật
- Button: "Xem Menu"
- Button: "Xem Bàn trống"

**Trang 2: Menu**
- Danh sách món (Grid)
- Lọc theo danh mục
- Tìm kiếm
- Click món → Modal chi tiết
  - Hình ảnh
  - Mô tả
  - Giá
  - Chọn size
  - Chọn topping
  - Button: "Thêm vào giỏ"

**Trang 3: Xem Bàn trống (Realtime)**
- Sơ đồ bàn
- Màu xanh: Bàn trống
- Màu đỏ: Bàn đang dùng
- Cập nhật realtime (SignalR)

**Trang 4: Đặt món qua QR Code**
- Quét QR Code trên bàn
- Tự động nhận diện số bàn
- Hiển thị menu
- Chọn món → Giỏ hàng
- Button: "Gửi đơn hàng"
- Theo dõi trạng thái món realtime

**Trang 5: Đặt món Mang đi**
- Chọn món → Giỏ hàng
- Chọn thời gian lấy
- Nhập thông tin:
  - Họ tên
  - Số điện thoại
  - Ghi chú
- Chọn thanh toán:
  - Thanh toán khi nhận
  - Thanh toán online (VNPay)
- Button: "Đặt hàng"
- Nhận mã đơn hàng

**Trang 6: Theo dõi đơn hàng**
- Nhập mã đơn hàng
- Xem trạng thái:
  - Đang chờ xác nhận
  - Đang làm
  - Hoàn thành
  - Đã giao

---

## 5. LUỒNG NGHIỆP VỤ CHI TIẾT

### 5.1. LUỒNG 1: Khách hàng đặt món qua QR Code

**Bước 1: Khách hàng quét QR Code**
- Khách ngồi vào bàn số 5
- Quét QR Code trên bàn
- Hệ thống nhận diện: Bàn số 5

**Bước 2: Xem menu và chọn món**
- Hiển thị menu trên điện thoại
- Khách chọn: "Cà phê sữa đá - Size M - Thêm trân châu"
- Thêm vào giỏ hàng

**Bước 3: Gửi đơn hàng**
- Khách bấm "Gửi đơn hàng"
- Hệ thống tạo đơn hàng:
  - Bàn: 5
  - Món: Cà phê sữa đá M + Trân châu
  - Trạng thái: Pending

**Bước 4: Bếp nhận đơn (Realtime)**
- Màn hình KDS hiển thị đơn mới ngay lập tức
- Âm thanh thông báo
- Món xuất hiện ở cột "Chờ làm"

**Bước 5: Bếp làm món**
- Bếp bấm "Bắt đầu"
- Món chuyển sang cột "Đang làm"
- Khách hàng thấy trạng thái "Đang làm" trên điện thoại (Realtime)

**Bước 6: Món xong**
- Bếp bấm "Hoàn thành"
- Món chuyển sang cột "Hoàn thành"
- Khách hàng nhận thông báo "Món đã xong"
- Thu ngân mang món ra bàn 5

**Bước 7: Thanh toán**
- Khách gọi thu ngân
- Thu ngân vào POS, chọn bàn 5
- Hệ thống tự động load đơn hàng của bàn 5
- Thu ngân chọn phương thức thanh toán
- In hóa đơn
- Bàn 5 chuyển về trạng thái "Trống"

---

### 5.2. LUỒNG 2: Thu ngân bán hàng tại quầy (Mang đi)

**Bước 1: Khách đến quầy**
- Khách: "Cho mình 2 ly trà sữa trân châu size L"

**Bước 2: Thu ngân tạo đơn**
- Thu ngân mở SmartPOS
- Click món "Trà sữa trân châu"
- Chọn size: L
- Chọn số lượng: 2
- Món được thêm vào giỏ hàng
- Tổng tiền: 80,000đ

**Bước 3: Thanh toán**
- Thu ngân hỏi: "Tiền mặt hay chuyển khoản?"
- Khách: "Tiền mặt"
- Thu ngân chọn "Tiền mặt"
- Nhập tiền khách đưa: 100,000đ
- Hệ thống tính tiền thừa: 20,000đ
- Thu ngân bấm "Thanh toán"

**Bước 4: Hệ thống xử lý**
- Tạo đơn hàng
- Trừ kho nguyên liệu (theo BOM)
- Gửi đơn cho bếp (SignalR)
- In hóa đơn

**Bước 5: Bếp nhận và làm món**
- KDS hiển thị đơn mới
- Bếp làm món
- Cập nhật trạng thái

**Bước 6: Giao món**
- Món xong, thu ngân gọi khách
- Khách nhận món và tiền thừa

---

### 5.3. LUỒNG 3: Bếp nhập kho nguyên liệu

**Bước 1: Nhận hàng từ nhà cung cấp**
- Nhà cung cấp giao: 10kg cà phê hạt Robusta

**Bước 2: Bếp vào trang Nhập kho**
- Chọn nguyên liệu: "Cà phê hạt Robusta"
- Nhập số lượng: 10kg
- Nhập giá nhập: 300,000đ/kg
- Nhập ngày sản xuất: 15/12/2025
- Nhập hạn sử dụng: 15/06/2026
- Chọn vị trí: "Kệ A1"
- Bấm "Lưu"

**Bước 3: Hệ thống xử lý**
- Tạo lô hàng mới (Batch)
- Mã lô: BATCH-20251223-001
- Cập nhật tồn kho
- Ghi log nhập kho

**Bước 4: Admin xem báo cáo**
- Admin vào Dashboard
- Thấy tồn kho cà phê tăng lên 10kg
- Xem lịch sử nhập kho

---

### 5.4. LUỒNG 4: Admin quản lý bàn và tạo QR Code

**Bước 1: Admin thêm bàn mới**
- Vào trang "Quản lý Bàn"
- Bấm "Thêm bàn"
- Nhập:
  - Số bàn: 10
  - Khu vực: Tầng 2
  - Số ghế: 4
- Bấm "Lưu"

**Bước 2: Hệ thống tạo QR Code**
- Tự động tạo QR Code cho bàn 10
- QR Code chứa: URL + Mã bàn
- Ví dụ: `https://capheminhhuu.com/order?table=10`

**Bước 3: Admin in QR Code**
- Bấm "In QR Code"
- In ra giấy A5
- Dán lên bàn số 10

**Bước 4: Khách sử dụng**
- Khách ngồi bàn 10
- Quét QR Code
- Tự động vào trang đặt món của bàn 10

---

## 6. YÊU CẦU PHI CHỨC NĂNG

### 6.1. Hiệu năng
- Tải trang < 2 giây
- Realtime latency < 500ms
- Xử lý được 100+ đơn hàng/ngày

### 6.2. Bảo mật
- JWT Authentication
- HTTPS
- Role-based Authorization
- SQL Injection prevention
- XSS prevention

### 6.3. Khả năng mở rộng
- Hỗ trợ nhiều chi nhánh (tương lai)
- Hỗ trợ nhiều ngôn ngữ (tương lai)

### 6.4. Tính sẵn sàng
- Uptime: 99%
- Backup dữ liệu hàng ngày

### 6.5. Trải nghiệm người dùng
- Giao diện thân thiện
- Responsive (Mobile, Tablet, Desktop)
- Hỗ trợ cả màn hình cảm ứng

---

## 📝 KẾT LUẬN

Tài liệu này đã phân tích và thiết kế chi tiết hệ thống SmartPOS với:
- **4 Actors:** Admin, Cashier, Bếp, Khách hàng
- **25 Use Cases** chính
- **4 Phân khu chức năng** rõ ràng
- **Luồng nghiệp vụ** chi tiết

Bước tiếp theo:
1. Vẽ Use Case Diagram (Visio/Draw.io)
2. Thiết kế ERD Database
3. Thiết kế UI/UX (Figma)
4. Bắt đầu implement

---

**Ngày tạo:** 23/12/2025  
**Người tạo:** Nguyễn Hữu Hạnh  
**Trạng thái:** ✅ HOÀN THÀNH PHÂN TÍCH
