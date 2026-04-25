    # 📐 SƠ ĐỒ PHÂN TÍCH HỆ THỐNG - SMARTPOS QUÁN CÀ PHÊ MINH HỮU

**Ngày:** 23/12/2025  
**Mục đích:** Phân tích luồng hoạt động và tìm điểm chưa hợp lý trong vận hành

---

## 📋 MỤC LỤC

1. [Use Case Diagram](#1-use-case-diagram)
2. [Đặc tả Use Case](#2-đặc-tả-use-case)
3. [Sequence Diagram](#3-sequence-diagram)
4. [ERD - Entity Relationship Diagram](#4-erd---entity-relationship-diagram)
5. [Phân tích điểm chưa hợp lý](#5-phân-tích-điểm-chưa-hợp-lý)

---

## 1. USE CASE DIAGRAM

### 1.1. Use Case Diagram Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│                    HỆ THỐNG SMARTPOS                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ADMIN                                  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ UC01: Quản lý Sản phẩm                             │  │  │
│  │  │ UC02: Quản lý Danh mục                             │  │  │
│  │  │ UC03: Quản lý Nguyên liệu                          │  │  │
│  │  │ UC04: Quản lý Công thức (BOM)                      │  │  │
│  │  │ UC05: Quản lý Bàn + QR Code                        │  │  │
│  │  │ UC06: Quản lý Nhân viên                            │  │  │
│  │  │   ├─ UC06.1: Thêm/Sửa/Xóa nhân viên                │  │  │
│  │  │   ├─ UC06.2: Phân quyền nhân viên                  │  │  │
│  │  │   └─ UC06.3: Xem lịch sử làm việc                  │  │  │
│  │  │ UC07: Quản lý Ca làm việc                          │  │  │
│  │  │   ├─ UC07.1: Xem tất cả ca làm việc                │  │  │
│  │  │   ├─ UC07.2: Xem chi tiết ca                       │  │  │
│  │  │   ├─ UC07.3: Đóng ca (nếu nhân viên quên)          │  │  │
│  │  │   └─ UC07.4: Xem báo cáo ca                        │  │  │
│  │  │ UC08: Xem Dashboard                                │  │  │
│  │  │ UC09: Xem Báo cáo & Thống kê                       │  │  │
│  │  │ UC10: Cấu hình hệ thống                            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   CASHIER                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ UC11: Đăng nhập                                    │  │  │
│  │  │ UC12: Mở ca làm việc                               │  │  │
│  │  │   ├─ UC12.1: Nhập tiền đầu ca                      │  │  │
│  │  │   ├─ UC12.2: Xác nhận mở ca                        │  │  │
│  │  │   └─ UC12.3: Hệ thống tạo Shift                    │  │  │
│  │  │ UC13: Bán hàng (SmartPOS)                          │  │  │
│  │  │   ├─ UC13.1: Chọn món                              │  │  │
│  │  │   ├─ UC13.2: Chọn size/topping                     │  │  │
│  │  │   ├─ UC13.3: Thanh toán                            │  │  │
│  │  │   └─ UC13.4: In hóa đơn                            │  │  │
│  │  │ UC14: Quản lý Bàn                                  │  │  │
│  │  │ UC15: Xem đơn hàng                                 │  │  │
│  │  │ UC16: Xem doanh thu ca hiện tại                    │  │  │
│  │  │ UC17: Đóng ca làm việc                             │  │  │
│  │  │   ├─ UC17.1: Nhập tiền cuối ca                     │  │  │
│  │  │   ├─ UC17.2: Đối chiếu tiền thực tế vs hệ thống    │  │  │
│  │  │   ├─ UC17.3: Ghi chú chênh lệch (nếu có)           │  │  │
│  │  │   └─ UC17.4: Xác nhận đóng ca                      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     BẾP                                   │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ UC18: Đăng nhập                                    │  │  │
│  │  │ UC19: Xem đơn hàng realtime (KDS)                  │  │  │
│  │  │ UC20: Cập nhật trạng thái món                      │  │  │
│  │  │ UC21: Nhập kho nguyên liệu                         │  │  │
│  │  │ UC22: Kiểm kho                                     │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 KHÁCH HÀNG                                │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ UC23: Xem Menu trực tuyến                          │  │  │
│  │  │ UC24: Xem Bàn trống (Realtime)                     │  │  │
│  │  │ UC25: Đặt món qua QR Code                          │  │  │
│  │  │   ├─ UC25.1: Quét QR Code                          │  │  │
│  │  │   ├─ UC25.2: Chọn món                              │  │  │
│  │  │   └─ UC25.3: Gửi đơn hàng                          │  │  │
│  │  │ UC26: Đặt món qua Web (Mang đi)                    │  │  │
│  │  │ UC27: Theo dõi đơn hàng                            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ĐẶC TẢ USE CASE

### 2.1. UC12: Bán hàng (SmartPOS)

**Tên Use Case:** Bán hàng tại quầy  
**Actor chính:** Cashier (Thu ngân)  
**Actor phụ:** Bếp (nhận đơn), Hệ thống kho (trừ nguyên liệu)  
**Mô tả:** Thu ngân tạo đơn hàng, thanh toán và in hóa đơn cho khách

**Tiền điều kiện:**
- Thu ngân đã đăng nhập
- Đã mở ca làm việc
- Có sản phẩm trong hệ thống

**Hậu điều kiện:**
- Đơn hàng được tạo thành công
- Kho nguyên liệu được trừ tự động
- Bếp nhận được đơn hàng realtime
- Hóa đơn được in ra

**Luồng chính:**
1. Thu ngân mở màn hình SmartPOS
2. Thu ngân chọn món từ menu
3. Hệ thống hiển thị modal chọn size/topping
4. Thu ngân chọn size (S/M/L)
5. Thu ngân chọn topping (nếu có)
6. Thu ngân xác nhận, món được thêm vào giỏ hàng
7. Hệ thống tính tổng tiền tự động
8. Thu ngân lặp lại bước 2-7 cho các món khác (nếu có)
9. Thu ngân bấm "Thanh toán"
10. Hệ thống hiển thị panel thanh toán
11. Thu ngân chọn phương thức thanh toán:
    - Tiền mặt: Nhập tiền khách đưa → Hệ thống tính tiền thừa
    - Thẻ: Quẹt thẻ
    - Chuyển khoản: Hiển thị QR Code
12. Thu ngân xác nhận thanh toán
13. Hệ thống:
    - Tạo đơn hàng (Order)
    - Lưu chi tiết đơn hàng (OrderDetails)
    - Trừ kho nguyên liệu theo BOM
    - Gửi đơn hàng cho bếp qua SignalR
    - Tạo hóa đơn
14. Thu ngân in hóa đơn
15. Thu ngân đưa hóa đơn cho khách
16. Use case kết thúc

**Luồng thay thế:**

**3a. Khách muốn ghi chú đặc biệt:**
- 3a1. Thu ngân nhập ghi chú vào ô "Note"
- 3a2. Quay lại bước 6

**11a. Khách không đủ tiền:**
- 11a1. Hệ thống thông báo thiếu tiền
- 11a2. Thu ngân hỏi khách bỏ bớt món hoặc đổi phương thức thanh toán
- 11a3. Quay lại bước 2 hoặc 11

**13a. Hết nguyên liệu:**
- 13a1. Hệ thống kiểm tra kho
- 13a2. Nếu không đủ nguyên liệu, hiển thị cảnh báo
- 13a3. Thu ngân thông báo khách, chọn món khác
- 13a4. Quay lại bước 2

**Yêu cầu đặc biệt:**
- Thời gian phản hồi < 1 giây
- Hỗ trợ màn hình cảm ứng
- Tự động lưu giỏ hàng (nếu bị gián đoạn)

---

### 2.2. UC17: Xem đơn hàng realtime (KDS)

**Tên Use Case:** Màn hình bếp hiển thị đơn hàng realtime  
**Actor chính:** Bếp (Kitchen Staff)  
**Actor phụ:** Cashier (tạo đơn), Khách hàng (đặt món qua QR)  
**Mô tả:** Bếp xem đơn hàng mới và cập nhật trạng thái món

**Tiền điều kiện:**
- Bếp đã đăng nhập
- Màn hình KDS đang mở
- Có kết nối SignalR

**Hậu điều kiện:**
- Trạng thái món được cập nhật
- Cashier/Khách hàng nhận thông báo realtime

**Luồng chính:**
1. Bếp mở màn hình KDS
2. Hệ thống hiển thị 3 cột:
   - Chờ làm (Pending)
   - Đang làm (Cooking)
   - Hoàn thành (Done)
3. Khi có đơn mới (từ POS hoặc QR Code):
   - Hệ thống nhận sự kiện SignalR
   - Phát âm thanh thông báo
   - Hiển thị món mới ở cột "Chờ làm"
4. Bếp xem thông tin món:
   - Số bàn (nếu có)
   - Tên món
   - Size
   - Topping
   - Số lượng
   - Ghi chú
   - Thời gian đặt
5. Bếp bấm "Bắt đầu" trên món
6. Hệ thống:
   - Chuyển món sang cột "Đang làm"
   - Gửi sự kiện SignalR cập nhật trạng thái
   - Bắt đầu đếm thời gian làm món
7. Bếp chế biến món
8. Bếp bấm "Hoàn thành"
9. Hệ thống:
   - Chuyển món sang cột "Hoàn thành"
   - Gửi sự kiện SignalR
   - Thông báo cho Cashier/Khách hàng
10. Sau 5 phút, món tự động biến mất khỏi cột "Hoàn thành"
11. Use case kết thúc

**Luồng thay thế:**

**5a. Bếp muốn xem chi tiết món:**
- 5a1. Bếp click vào món
- 5a2. Hệ thống hiển thị modal chi tiết
- 5a3. Quay lại bước 5

**8a. Món không thể làm (hết nguyên liệu):**
- 8a1. Bếp bấm "Hủy món"
- 8a2. Hệ thống hiển thị lý do hủy
- 8a3. Bếp nhập lý do
- 8a4. Hệ thống thông báo cho Cashier/Khách hàng
- 8a5. Use case kết thúc

**Yêu cầu đặc biệt:**
- Realtime latency < 500ms
- Hỗ trợ màn hình lớn (24-32 inch)
- Tự động reconnect SignalR nếu mất kết nối

---

### 2.3. UC23: Đặt món qua QR Code

**Tên Use Case:** Khách hàng quét QR Code và đặt món  
**Actor chính:** Khách hàng  
**Actor phụ:** Bếp (nhận đơn), Cashier (thanh toán)  
**Mô tả:** Khách hàng ngồi tại bàn, quét QR Code và tự đặt món

**Tiền điều kiện:**
- Bàn đã có QR Code
- Khách hàng có smartphone
- Có kết nối internet

**Hậu điều kiện:**
- Đơn hàng được tạo và gán cho bàn
- Bếp nhận đơn realtime
- Trạng thái bàn chuyển sang "Đang dùng"

**Luồng chính:**
1. Khách hàng ngồi vào bàn (ví dụ: Bàn số 5)
2. Khách hàng mở camera điện thoại
3. Khách hàng quét QR Code trên bàn
4. Hệ thống nhận diện mã bàn (Table ID = 5)
5. **Hệ thống kiểm tra rào chắn:**
   - **5a. Kiểm tra giờ hoạt động (IsShopOpen):**
     - Nếu ngoài giờ (VD: 22:00 - 07:00) → Hiển thị: "Quán đã đóng cửa. Giờ mở cửa: 07:00 - 22:00"
     - Use case kết thúc
   - **5b. Kiểm tra trạng thái bàn (TableStatus):**
     - Nếu Status = "Occupied" → Hiển thị: "Bàn đang phục vụ khách khác. Vui lòng liên hệ nhân viên."
     - Use case kết thúc
   - **5c. Nếu tất cả OK:**
     - Chuyển hướng đến trang đặt món
     - URL: `https://capheminhhuu.com/order?table=5`
6. Hệ thống hiển thị Form nhập thông tin:
   ```
   ┌─────────────────────────────────────┐
   │ Đặt món cho Bàn số 5                │
   ├─────────────────────────────────────┤
   │ Họ tên: [____________] (Bắt buộc)   │
   │ SĐT:    [____________] (Bắt buộc)   │
   │                                     │
   │ [Tiếp tục đặt món]                  │
   └─────────────────────────────────────┘
   ```
7. Khách hàng nhập Họ tên và Số điện thoại
8. Khách hàng bấm "Tiếp tục đặt món"
9. Hệ thống validate:
   - Họ tên: Không được rỗng
   - SĐT: Phải đúng 10 số
   - Nếu sai → Hiển thị lỗi, quay lại bước 7
10. Hệ thống hiển thị Menu sản phẩm
11. Khách hàng chọn món (ví dụ: Cà phê sữa đá)
12. Hệ thống hiển thị modal chọn size/topping
13. Khách hàng chọn size: M
14. Khách hàng chọn topping: Trân châu
15. Khách hàng bấm "Thêm vào giỏ"
16. Món được thêm vào giỏ hàng
17. Khách hàng lặp lại bước 11-16 cho món khác (nếu có)
18. Khách hàng bấm "Gửi đơn hàng"
19. **Hệ thống kiểm tra tồn kho (CheckStock):**
    - Tính toán nguyên liệu cần dùng theo BOM
    - Kiểm tra tồn kho có đủ không
    - **Nếu thiếu nguyên liệu:**
      - Hiển thị: "Món [Tên món] hiện đã hết. Vui lòng chọn món khác."
      - Quay lại bước 11
20. Hệ thống xử lý đơn hàng:
    - Tạo đơn hàng (Order) với:
      - CustomerName, CustomerPhone (từ bước 7)
      - OrderType = "DineIn"
      - Status = "Confirmed"
    - Gán đơn hàng cho Bàn số 5
    - **Trừ kho nguyên liệu ngay (DeductStock)**
    - Gửi đơn cho bếp qua SignalR
    - Cập nhật trạng thái bàn: "Occupied"
21. Hệ thống hiển thị:
    - "Đơn hàng đã được gửi!"
    - Danh sách món đã đặt
    - Trạng thái món realtime
22. Khách hàng theo dõi trạng thái món:
    - Chờ làm → Đang làm → Hoàn thành
23. Khi món xong, hệ thống thông báo:
    - "Món của bạn đã xong! Vui lòng gọi nhân viên."
24. Khách hàng gọi nhân viên
25. Nhân viên mang món ra
26. Khách hàng ăn uống
27. Khách hàng gọi nhân viên để thanh toán
28. Cashier vào POS, chọn Bàn số 5
29. Hệ thống tự động load đơn hàng của Bàn 5
30. Cashier thanh toán (theo UC12)
31. Hệ thống cập nhật Order: IsPaid = true
32. Trạng thái bàn chuyển về "Available"
33. Use case kết thúc

**Luồng thay thế:**

**3a. QR Code không quét được:**
- 3a1. Khách hàng thử lại
- 3a2. Nếu vẫn không được, gọi nhân viên
- 3a3. Nhân viên hướng dẫn hoặc đặt món thay
- 3a4. Use case kết thúc

**7a. Khách hàng không muốn nhập thông tin:**
- 7a1. Khách hàng bấm "Gọi nhân viên"
- 7a2. Nhân viên đến hỗ trợ đặt món trực tiếp
- 7a3. Use case kết thúc

**18a. Mất kết nối internet:**
- 18a1. Hệ thống hiển thị "Đang gửi đơn hàng..."
- 18a2. Lưu đơn hàng vào LocalStorage
- 18a3. Khi có kết nối lại, tự động gửi
- 18a4. Quay lại bước 21

**23a. Khách hàng muốn thêm món:**
- 23a1. Khách hàng bấm "Đặt thêm"
- 23a2. Quay lại bước 11
- 23a3. Hệ thống kiểm tra tồn kho lại (bước 19)
- 23a4. Nếu OK, thêm món vào đơn hiện tại

**Yêu cầu đặc biệt:**
- Giao diện mobile-friendly
- Hỗ trợ cả iOS và Android
- Không cần đăng nhập
- Tự động cập nhật trạng thái realtime

---

## 3. SEQUENCE DIAGRAM

### 3.1. Luồng: Khách đặt món qua QR Code (Revised)

```
Khách hàng    Smartphone    Web Server    Database    BOM Service    Kho    SignalR Hub    KDS (Bếp)
    |             |              |            |            |           |        |              |
    |--Quét QR--->|              |            |            |           |        |              |
    |             |--GET /order?table=5----->|            |           |        |              |
    |             |              |--Query Table 5-------->|            |           |        |              |
    |             |              |--Check TableStatus---->|            |           |        |              |
    |             |              |--Check ShopOpen------->|            |           |        |              |
    |             |              |<--Table Info-----------|            |           |        |              |
    |             |              |                        |            |           |        |              |
    |             |              |--Alt: If Occupied or Closed-------->|           |        |              |
    |             |<--Error Page: "Bàn đang dùng" hoặc "Quán đóng cửa"|           |        |              |
    |<--Hiển thị lỗi-------------|            |            |           |        |              |
    |             |              |            |            |           |        |              |
    |             |              |--Else: OK------------->|            |           |        |              |
    |             |<--Form nhập thông tin----|            |           |        |              |
    |<--Hiển thị Form-----------|            |            |           |        |              |
    |             |              |            |            |           |        |              |
    |--Nhập Name, Phone--------->|            |            |           |        |              |
    |             |--Validate--->|            |            |           |        |              |
    |             |<--Menu Page--|            |            |           |        |              |
    |<--Hiển thị Menu-----------|            |            |           |        |              |
    |             |              |            |            |           |        |              |
    |--Chọn món-->|              |            |            |           |        |              |
    |--Chọn size->|              |            |            |           |        |              |
    |--Thêm giỏ->|              |            |            |           |        |              |
    |             |              |            |            |           |        |              |
    |--Gửi đơn--->|              |            |            |           |        |              |
    |             |--POST /api/orders------->|            |           |        |              |
    |             |              |--CheckStock(BOM)------>|            |           |        |              |
    |             |              |            |<--BOM Data-|           |        |              |
    |             |              |--Query Inventory------>|            |           |        |              |
    |             |              |<--Stock Data-----------|            |           |        |              |
    |             |              |                        |            |           |        |              |
    |             |              |--Alt: If Stock < Required---------->|           |        |              |
    |             |<--Error: "Món hết hàng"--|            |           |        |              |
    |<--Hiển thị lỗi-------------|            |            |           |        |              |
    |             |              |            |            |           |        |              |
    |             |              |--Else: Stock OK------->|            |           |        |              |
    |             |              |--Create Order--------->|            |           |        |              |
    |             |              |  (CustomerName, Phone, OrderType=DineIn, Status=Confirmed)              |
    |             |              |--Create OrderDetails-->|            |           |        |              |
    |             |              |--Update Table Status-->|            |           |        |              |
    |             |              |  (Status=Occupied)     |            |           |        |              |
    |             |              |<--Order Created--------|            |           |        |              |
    |             |              |                        |            |           |        |              |
    |             |              |--DeductStock()---------|----------->|           |        |              |
    |             |              |            |            |<--Update--|        |              |
    |             |              |<--Stock Updated--------|            |           |        |              |
    |             |              |                        |            |           |        |              |
    |             |              |--Broadcast NewOrder--->|            |---------->|        |              |
    |             |              |            |            |           |        |------------->|
    |             |              |            |            |           |        |              |--Hiển thị món mới
    |             |<--Success----|            |            |           |        |              |
    |<--Xác nhận--|              |            |            |           |        |              |
    |             |              |            |            |           |        |              |
    |--Theo dõi-->|              |            |            |           |        |              |
    |             |--SignalR Connection----->|            |           |        |              |
    |             |              |            |<--Status Update-----------------|
    |             |              |            |            |           |        |<--Bếp bấm "Bắt đầu"
    |             |<--Realtime Update--------|            |           |        |              |
    |<--"Đang làm"|              |            |            |           |        |              |
    |             |              |            |            |           |        |              |
    |             |              |            |<--Status Update-----------------|
    |             |              |            |            |           |        |<--Bếp bấm "Xong"
    |             |<--Realtime Update--------|            |           |        |              |
    |<--"Món xong"|              |            |            |           |        |              |
    |             |              |            |            |           |        |              |
    |--Gọi thanh toán----------->|            |            |           |        |              |
    |             |              |--Cashier Payment------>|            |           |        |              |
    |             |              |--Update IsPaid=true--->|            |           |        |              |
    |             |              |--Update TableStatus--->|            |           |        |              |
    |             |              |  (Status=Available)    |            |           |        |              |
```

---

### 3.2. Luồng: Thu ngân bán hàng POS (Revised)

```
Cashier    SmartPOS UI    API Server    Database    BOM Service    Kho    SignalR    KDS
   |            |              |            |            |           |        |         |
   |--Chọn món->|              |            |            |           |        |         |
   |            |--GET /api/products------>|            |           |        |         |
   |            |              |--Query---->|            |           |        |         |
   |            |<--Products---|            |            |           |        |         |
   |<--Hiển thị-|              |            |            |           |        |         |
   |            |              |            |            |           |        |         |
   |--Chọn size->|              |            |            |           |        |         |
   |--Thêm giỏ->|              |            |            |           |        |         |
   |            |--Tính tổng-->|            |            |           |        |         |
   |            |              |            |            |           |        |         |
   |--Bấm "Đặt món"----------->|            |            |           |        |         |
   |            |--POST /api/orders-------->|            |           |        |         |
   |            |              |--CheckStock(BOM)------>|            |           |        |         |
   |            |              |            |<--BOM Data-|           |        |         |
   |            |              |--Query Inventory------>|            |           |        |         |
   |            |              |<--Stock Data-----------|            |           |        |         |
   |            |              |                        |            |           |        |         |
   |            |              |--Alt: If Stock < Required---------->|           |        |         |
   |            |<--Error: "Món hết hàng"--|            |           |        |         |
   |<--Hiển thị lỗi-------------|            |            |           |        |         |
   |            |              |            |            |           |        |         |
   |            |              |--Else: Stock OK------->|            |           |        |         |
   |            |              |--Create Order--------->|            |           |        |         |
   |            |              |  (OrderType=TakeAway, Status=Confirmed)         |        |         |
   |            |              |--Create OrderDetails-->|            |           |        |         |
   |            |              |<--Order Created--------|            |           |        |         |
   |            |              |                        |            |           |        |         |
   |            |              |--DeductStock()---------|----------->|           |        |         |
   |            |              |            |            |<--Update--|        |         |
   |            |              |<--Stock Updated--------|            |           |        |         |
   |            |              |                        |            |           |        |         |
   |            |              |--Broadcast NewOrder----------------->|        |         |
   |            |              |            |            |           |        |-------->|
   |            |              |            |            |           |        |         |--Bếp làm ngay
   |            |<--Success----|            |            |           |        |         |
   |<--Hiển thị "Đã đặt món"---|            |            |           |        |         |
   |            |              |            |            |           |        |         |
   |--Bấm "Thanh toán"-------->|            |            |           |        |         |
   |            |--PATCH /api/orders/{id}/payment----->|            |           |        |         |
   |            |              |--Update IsPaid=true--->|            |           |        |         |
   |            |              |--Update ShiftRevenue-->|            |           |        |         |
   |            |              |<--Payment Success------|            |           |        |         |
   |            |<--Success----|            |            |           |        |         |
   |            |--Print Bill->|            |            |           |        |         |
   |<--Hóa đơn--|              |            |            |           |        |         |
```

---

### 3.3. Luồng: Bếp cập nhật trạng thái món

```
KDS (Bếp)    SignalR Client    API Server    Database    SignalR Hub    Cashier/Khách
    |              |                |            |            |              |
    |--Nhận đơn mới<--Realtime------|            |<--Broadcast NewOrder------|
    |              |                |            |            |              |
    |--Hiển thị món|                |            |            |              |
    |              |                |            |            |              |
    |--Bấm "Bắt đầu"->              |            |            |              |
    |              |--PATCH /api/orders/{id}/status---------->|              |
    |              |                |--Update Status--------->|              |
    |              |                |<--Updated---------------|              |
    |              |                |                         |              |
    |              |                |--Broadcast StatusUpdate->|              |
    |              |                |            |            |------------->|
    |<--Chuyển cột-|                |            |            |              |--Nhận thông báo
    |              |                |            |            |              |
    |--Làm món---->|                |            |            |              |
    |              |                |            |            |              |
    |--Bấm "Xong"->|                |            |            |              |
    |              |--PATCH /api/orders/{id}/status---------->|              |
    |              |                |--Update Status--------->|              |
    |              |                |<--Updated---------------|              |
    |              |                |                         |              |
    |              |                |--Broadcast StatusUpdate->|              |
    |              |                |            |            |------------->|
    |<--Chuyển cột-|                |            |            |              |--"Món đã xong"
```

---

## 4. ERD - ENTITY RELATIONSHIP DIAGRAM

### 4.1. ERD Tổng Quan

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │1      * │    Order    │*      1 │    Table    │
│─────────────│◄────────│─────────────│◄────────│─────────────│
│ Id (PK)     │         │ Id (PK)     │         │ Id (PK)     │
│ Username    │         │ OrderCode   │         │ TableNumber │
│ Password    │         │ UserId (FK) │         │ TableName   │
│ Role        │         │ TableId (FK)│         │ AreaId (FK) │
│ FullName    │         │ TotalAmount │         │ Seats       │
│ Phone       │         │ Status      │         │ QRCode      │
│ CreatedAt   │         │ PaymentMethod        │ Status      │
└─────────────┘         │ CreatedAt   │         │ CreatedAt   │
                        └──────┬──────┘         └─────────────┘
                               │1
                               │
                               │*
                        ┌──────▼──────┐
                        │ OrderDetail │
                        │─────────────│
                        │ Id (PK)     │
                        │ OrderId (FK)│
                        │ ProductId(FK)        ┌─────────────┐
                        │ ProductName │        │   Category  │
                        │ Quantity    │        │─────────────│
                        │ Size        │        │ Id (PK)     │
                        │ Toppings    │        │ Name        │
                        │ UnitPrice   │        │ Description │
                        │ Subtotal    │        └──────┬──────┘
                        └──────┬──────┘               │1
                               │*                     │
                               │                      │*
                               │1              ┌──────▼──────┐
                        ┌──────▼──────┐        │   Product   │
                        │   Recipe    │*     1 │─────────────│
                        │─────────────│◄───────│ Id (PK)     │
                        │ Id (PK)     │        │ Name        │
                        │ ProductId(FK)        │ CategoryId(FK)
                        │ IngredientId(FK)     │ Price       │
                        │ Quantity    │        │ ImageUrl    │
                        │ Unit        │        │ Description │
                        └──────┬──────┘        │ Status      │
                               │*              └─────────────┘
                               │
                               │1
                        ┌──────▼──────┐
                        │ Ingredient  │
                        │─────────────│
                        │ Id (PK)     │
                        │ Name        │
                        │ CategoryId(FK)
                        │ Description │
                        └──────┬──────┘
                               │1
                        ┌──────┴──────┬──────────────┐
                        │*            │*             │*
                 ┌──────▼──────┐ ┌───▼────────┐ ┌──▼──────────┐
                 │IngredientUnit│ │InventoryBatch│ │IngredientCategory│
                 │──────────────│ │──────────────│ │──────────────│
                 │ Id (PK)      │ │ Id (PK)      │ │ Id (PK)      │
                 │ IngredientId │ │ IngredientId │ │ Name         │
                 │ UnitName     │ │ BatchCode    │ │ Description  │
                 │ ConversionFactor│ Quantity   │ └──────────────┘
                 │ IsBaseUnit   │ │ ExpiryDate   │
                 └──────────────┘ │ CostPrice    │
                                  │ Location     │
                                  └──────────────┘

┌─────────────┐
│    Shift    │
│─────────────│
│ Id (PK)     │
│ UserId (FK) │
│ StartTime   │
│ EndTime     │
│ StartCash   │
│ EndCash     │
│ TotalRevenue│
│ Status      │
└─────────────┘

┌─────────────┐
│    Area     │
│─────────────│
│ Id (PK)     │
│ Name        │
│ Description │
└─────────────┘
```

### 4.2. Mô tả chi tiết các bảng

#### Bảng: User (Người dùng)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Id | int | PK, Identity |
| Username | nvarchar(50) | Unique, Not Null |
| Password | nvarchar(255) | Hashed, Not Null |
| Role | nvarchar(20) | Admin/Cashier/Kitchen |
| FullName | nvarchar(100) | |
| Phone | nvarchar(15) | |
| CreatedAt | datetime | Default: GETDATE() |
| UpdatedAt | datetime | |
| IsDeleted | bit | Default: 0 |

#### Bảng: Table (Bàn)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Id | int | PK, Identity |
| TableNumber | int | Số bàn |
| TableName | nvarchar(50) | Tên bàn (VD: "Bàn 1", "VIP 1") |
| AreaId | int | FK → Area |
| Seats | int | Số ghế |
| QRCode | nvarchar(255) | URL QR Code |
| Status | nvarchar(20) | Available/Occupied/Reserved |
| CreatedAt | datetime | |
| UpdatedAt | datetime | |
| IsDeleted | bit | |

#### Bảng: Area (Khu vực)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Id | int | PK, Identity |
| Name | nvarchar(100) | Tầng 1, Tầng 2, Sân thượng |
| Description | nvarchar(255) | |
| CreatedAt | datetime | |
| IsDeleted | bit | |

#### Bảng: Order (Đơn hàng)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Id | int | PK, Identity |
| OrderCode | nvarchar(50) | ORD-20251223-001 |
| UserId | int | FK → User (Cashier, Nullable cho đơn QR) |
| TableId | int | FK → Table (Nullable) |
| **CustomerName** | **nvarchar(100)** | **Tên khách hàng (cho đơn QR Code)** |
| **CustomerPhone** | **nvarchar(15)** | **SĐT khách hàng (cho đơn QR Code)** |
| **OrderType** | **nvarchar(20)** | **DineIn/TakeAway** |
| TotalAmount | decimal(18,2) | Tổng tiền |
| DiscountAmount | decimal(18,2) | Giảm giá |
| FinalAmount | decimal(18,2) | Thành tiền |
| PaymentMethod | nvarchar(50) | Cash/Card/Transfer |
| **IsPaid** | **bit** | **true = Đã thanh toán, false = Chưa** |
| Status | nvarchar(20) | Confirmed/Cooking/Done/Cancelled |
| Note | nvarchar(500) | Ghi chú |
| ShiftId | int | FK → Shift (Nullable) |
| CreatedAt | datetime | |
| UpdatedAt | datetime | |
| IsDeleted | bit | |

#### Bảng: OrderDetail (Chi tiết đơn hàng)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Id | int | PK, Identity |
| OrderId | int | FK → Order |
| ProductId | int | FK → Product |
| ProductName | nvarchar(100) | Snapshot tên món |
| Quantity | int | Số lượng |
| Size | nvarchar(10) | S/M/L |
| Toppings | nvarchar(255) | JSON: ["Trân châu", "Thạch"] |
| UnitPrice | decimal(18,2) | Giá 1 món |
| Subtotal | decimal(18,2) | Thành tiền |
| Note | nvarchar(255) | Ghi chú riêng |

#### Bảng: Shift (Ca làm việc)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Id | int | PK, Identity |
| UserId | int | FK → User |
| StartTime | datetime | Thời gian mở ca |
| EndTime | datetime | Thời gian đóng ca |
| StartCash | decimal(18,2) | Tiền đầu ca |
| EndCash | decimal(18,2) | Tiền cuối ca |
| TotalRevenue | decimal(18,2) | Doanh thu ca |
| Difference | decimal(18,2) | Chênh lệch |
| Status | nvarchar(20) | Open/Closed |
| Note | nvarchar(500) | |
| CreatedAt | datetime | |

#### Bảng: ProductSize (Kích thước sản phẩm) - MỚI
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Id | int | PK, Identity |
| ProductId | int | FK → Product |
| SizeName | nvarchar(10) | S/M/L |
| PriceAdjustment | decimal(18,2) | Chênh lệch giá (VD: +5000 cho size L) |
| IsDefault | bit | Size mặc định |
| CreatedAt | datetime | |
| IsDeleted | bit | |

#### Bảng: Topping (Topping) - MỚI
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Id | int | PK, Identity |
| Name | nvarchar(100) | Tên topping (Trân châu, Thạch, Pudding) |
| Price | decimal(18,2) | Giá topping |
| IngredientId | int | FK → Ingredient (Để trừ kho) |
| Status | nvarchar(20) | Available/OutOfStock |
| CreatedAt | datetime | |
| IsDeleted | bit | |

#### Bảng: TableSession (Phiên bàn) - MỚI
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Id | int | PK, Identity |
| TableId | int | FK → Table |
| SessionCode | nvarchar(50) | TBL5-20251223-001 |
| StartTime | datetime | Thời gian bắt đầu phiên |
| EndTime | datetime | Thời gian kết thúc phiên |
| TotalAmount | decimal(18,2) | Tổng tiền tất cả đơn trong phiên |
| Status | nvarchar(20) | Active/Closed |
| CreatedAt | datetime | |

#### Bảng: InventoryTransaction (Giao dịch kho) - MỚI
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Id | int | PK, Identity |
| IngredientId | int | FK → Ingredient |
| Type | nvarchar(20) | Import/Export/Adjust/Refund |
| Quantity | decimal(18,2) | Số lượng (+/-) |
| ReferenceType | nvarchar(50) | Order/Audit/Manual |
| ReferenceId | int | ID tham chiếu (OrderId, AuditId...) |
| Note | nvarchar(500) | Ghi chú |
| CreatedAt | datetime | |
| CreatedBy | int | FK → User |

---

## 5. PHÂN TÍCH ĐIỂM CHƯA HỢP LÝ

### 5.1. Vấn đề 1: Quản lý Size và Topping

**Hiện trạng:**
- Size và Topping đang lưu dạng text trong OrderDetail
- Giá size/topping hard-code trong code

**Vấn đề:**
- Không linh hoạt khi thay đổi giá
- Không theo dõi được topping nào bán chạy
- Khó quản lý kho cho topping

**Đề xuất:**
Tạo 2 bảng mới:

```
ProductSize:
- Id
- ProductId (FK)
- SizeName (S/M/L)
- PriceAdjustment (Chênh lệch giá so với giá gốc)

Topping:
- Id
- Name
- Price
- IngredientId (FK) - Để trừ kho
- Status
```

---

### 5.2. Vấn đề 2: Trạng thái Order

**Hiện trạng:**
- Order có 1 trường Status chung

**Vấn đề:**
- Không phân biệt được trạng thái từng món trong đơn
- Nếu đơn có 3 món, 1 món xong, 2 món chưa xong → Status là gì?

**Đề xuất:**
Thêm trường Status vào OrderDetail:

```
OrderDetail:
- Status (Pending/Cooking/Done)
- StartCookingTime
- CompletedTime
```

Order.Status sẽ tính dựa trên OrderDetail:
- Pending: Tất cả món đều Pending
- Cooking: Có ít nhất 1 món Cooking
- Done: Tất cả món đều Done
- Paid: Đã thanh toán

---

### 5.3. Vấn đề 3: Quản lý Bàn khi đặt qua QR Code

**Hiện trạng:**
- Khách quét QR → Tạo Order → Gán TableId

**Vấn đề:**
- Nếu nhiều khách cùng quét QR của 1 bàn?
- Làm sao biết đơn nào của khách nào?
- Làm sao gộp bill khi thanh toán?

**Đề xuất:**
Tạo bảng TableSession:

```
TableSession:
- Id
- TableId (FK)
- SessionCode (Mã phiên, VD: TBL5-20251223-001)
- StartTime
- EndTime
- Status (Active/Closed)
- TotalAmount
```

Luồng mới:
1. Khách quét QR → Tạo TableSession mới
2. Tất cả Order trong phiên gán vào TableSession
3. Khi thanh toán → Đóng TableSession
4. Bàn chuyển về Trống

---

### 5.4. Vấn đề 4: Realtime cho nhiều thiết bị

**Hiện trạng:**
- SignalR broadcast cho tất cả client

**Vấn đề:**
- Nếu có 10 màn hình KDS, tất cả đều nhận đơn
- Làm sao phân chia đơn cho từng bếp?

**Đề xuất:**
Tạo bảng KitchenStation:

```
KitchenStation:
- Id
- Name (Bếp 1, Bếp 2, Bếp Bar)
- CategoryIds (JSON: [1,2,3]) - Bếp này làm danh mục nào
```

SignalR sẽ gửi đơn có target:
```csharp
await Clients.Group("Kitchen-1").SendAsync("ReceiveNewOrder", order);
```

---

### 5.5. Vấn đề 5: Trừ kho khi hủy đơn

**Hiện trạng:**
- Tạo đơn → Trừ kho ngay
- Nếu hủy đơn → Chưa có logic hoàn kho

**Vấn đề:**
- Kho bị sai nếu hủy nhiều đơn

**Đề xuất:**
Tạo bảng InventoryTransaction:

```
InventoryTransaction:
- Id
- IngredientId (FK)
- Type (Import/Export/Adjust/Refund)
- Quantity
- ReferenceType (Order/Shift/Manual)
- ReferenceId
- Note
- CreatedAt
```

Khi hủy đơn → Tạo transaction Type=Refund để hoàn kho

---

## 📝 KẾT LUẬN

Đã phân tích chi tiết:
- ✅ Use Case Diagram với 25 use cases
- ✅ Đặc tả 3 use cases quan trọng nhất
- ✅ 3 Sequence Diagrams cho luồng chính
- ✅ ERD với 15+ bảng
- ✅ 5 vấn đề cần cải thiện

**Bước tiếp theo:**
1. Review và thống nhất các vấn đề
2. Cập nhật ERD theo đề xuất
3. Bắt đầu implement

---

**Ngày tạo:** 23/12/2025  
**Người tạo:** Nguyễn Hữu Hạnh  
**Trạng thái:** ✅ HOÀN THÀNH PHÂN TÍCH
