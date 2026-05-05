# 🌟 TẦM NHÌN VÀ MỤC TIÊU DỰ ÁN - HỆ THỐNG QUẢN LÝ QUÁN CÀ PHÊ MINH HỮU

**Ngày:** 23/12/2025  
**Tác giả:** Nguyễn Hữu Hạnh  
**Đồ án Tốt nghiệp 2026**

---

## 💭 I. XUẤT PHÁT ĐIỂM - TẠI SAO LẠI LÀ DỰ ÁN NÀY?

### Câu chuyện bắt đầu

Khi bước vào một quán cà phê nhỏ ở góc phố, tôi nhận ra rằng đằng sau mỗi tách cà phê thơm ngon không chỉ là nghệ thuật pha chế, mà còn là cả một hệ thống quản lý phức tạp đang vận hành âm thầm.

Thu ngân phải ghi nhớ giá từng món, size khác nhau, topping khác nhau. Bếp phải đoán xem món nào cần làm trước, món nào đang chờ. Chủ quán phải đếm tiền cuối ngày, lo lắng về nguyên liệu sắp hết, sắp hết hạn. Tất cả đều thủ công, đều dễ sai sót, đều mệt mỏi.

**Và tôi tự hỏi:** Liệu có thể làm cho cuộc sống của họ dễ dàng hơn không?

Đó chính là lý do dự án này ra đời.

---

## 🎯 II. TẦM NHÌN - ĐIỀU TÔI MUỐN ĐẠT ĐƯỢC

### Tầm nhìn tổng thể

> **"Tạo ra một hệ thống quản lý quán cà phê hoàn chỉnh, dễ sử dụng, giúp chủ quán tập trung vào việc phục vụ khách hàng thay vì lo lắng về quản lý."**

### Cụ thể hơn, tôi muốn:

#### 1. **Giúp thu ngân làm việc nhanh hơn, chính xác hơn**
- Không còn phải nhớ giá từng món
- Không còn phải tính toán bằng tay
- Chỉ cần chạm vào màn hình, chọn món, và hệ thống lo phần còn lại
- In hóa đơn đẹp, chuyên nghiệp ngay lập tức

#### 2. **Giúp bếp biết chính xác món nào cần làm**
- Màn hình bếp hiển thị rõ ràng: món gì, bao nhiêu ly, size nào
- Cập nhật trạng thái real-time: đang làm, đã xong
- Không còn tình trạng quên món, làm nhầm món

#### 3. **Giúp chủ quán kiểm soát kho hàng một cách khoa học**
- Biết chính xác còn bao nhiêu nguyên liệu
- Cảnh báo khi sắp hết hàng, sắp hết hạn
- Tính toán chính xác nguyên liệu cần dùng cho mỗi món (BOM - Bill of Materials)
- Tự động trừ kho khi bán hàng

#### 4. **Giúp chủ quán nắm rõ tình hình kinh doanh**
- Doanh thu hôm nay bao nhiêu?
- Món nào bán chạy nhất?
- Ca nào bán được nhiều nhất?
- Lãi lỗ thế nào?
- Kiểm soát được nhân viên, tính lương bổng thưởng phạt...

#### 5. **Giúp chủ quán quản lý nhân viên hiệu quả**
- Theo dõi giờ làm việc của từng nhân viên
- Xem doanh thu từng ca, từng người
- Phát hiện chênh lệch tiền (nếu có)
- Đánh giá hiệu suất làm việc
- Tính lương công bằng, minh bạch

---

## 🌱 III. GIÁ TRỊ CỐT LÕI - ĐIỀU TÔI TIN TƯỞNG

### 1. **Đơn giản là tốt nhất**
Hệ thống phải dễ sử dụng đến mức người không biết công nghệ vẫn dùng được. Giao diện phải trực quan, rõ ràng, không rườm rà.

### 2. **Chính xác là quan trọng nhất**
Tiền bạc, kho hàng, đơn hàng - tất cả phải chính xác tuyệt đối. Một sai sót nhỏ có thể gây thiệt hại lớn.

### 3. **Nhanh là cần thiết**
Khách hàng không thích chờ đợi. Hệ thống phải phản hồi nhanh, xử lý nhanh, không lag, không giật.

### 4. **Tin cậy là nền tảng**
Hệ thống phải hoạt động ổn định, không bị lỗi giữa chừng, không mất dữ liệu.

---

## 🎨 IV. NHỮNG TÍNH NĂNG TÔI MUỐN HIỆN THỰC HÓA

### **A. Hệ thống bán hàng (POS - Point of Sale)**

#### Tôi hình dung:
Một màn hình lớn, chia làm 3 phần:
- **Bên trái:** Danh sách món ăn, đồ uống với hình ảnh đẹp mắt
- **Giữa:** Giỏ hàng hiển thị món khách đã chọn
- **Bên phải:** Thanh toán với các phương thức: tiền mặt, thẻ, chuyển khoản

#### Quy trình tôi mong muốn:
1. Thu ngân chạm vào món "Cà phê sữa đá"
2. Hệ thống hỏi: Size nào? (S/M/L)
3. Có thêm topping không? (Trân châu, thạch, pudding...)
4. Món được thêm vào giỏ hàng
5. Khách chọn xong, thu ngân bấm "Đặt món"
6. Hệ thống tự động:
   - Kiểm tra tồn kho (nếu không đủ → Cảnh báo)
   - Tạo đơn hàng (Status = Confirmed)
   - **CHƯA trừ kho** (chỉ trừ khi thanh toán)
   - Gửi thông tin cho bếp (Bếp làm ngay)
7. Bếp làm món
8. Món xong, khách nhận món
9. Khách ăn/uống xong
10. Thu ngân bấm "Thanh toán"
11. Chọn phương thức thanh toán
12. Xác nhận thanh toán
13. Hệ thống:
    - **Trừ kho nguyên liệu** (lúc này mới trừ)
    - Cập nhật IsPaid = true
    - In hóa đơn

#### **🎯 Quyết định thiết kế quan trọng:**
> **"Thanh toán sau - Ưu tiên trải nghiệm khách hàng"**
> 
> Chúng tôi chấp nhận rủi ro khách không thanh toán để mang lại trải nghiệm tốt nhất. Khách hàng không bị "ép" thanh toán trước, tạo cảm giác thoải mái và được tôn trọng.

#### Cảm xúc tôi muốn mang lại:
- Thu ngân cảm thấy **tự tin** vì không sợ tính sai
- Khách hàng cảm thấy **hài lòng** vì được phục vụ nhanh chóng
- Khách hàng cảm thấy **tôn trọng** vì không bị ép thanh toán trước
- Chủ quán cảm thấy **yên tâm** vì mọi thứ được ghi chép đầy đủ

---

### **B. Màn hình bếp (KDS - Kitchen Display System)**

#### Tôi hình dung:
Một màn hình lớn trong bếp, chia làm 3 cột:
- **Cột 1 - Chờ làm:** Các món mới vừa nhận, màu vàng cam
- **Cột 2 - Đang làm:** Các món đang được chế biến, màu xanh dương
- **Cột 3 - Hoàn thành:** Các món đã xong, màu xanh lá

#### Quy trình tôi mong muốn:
1. Thu ngân tạo đơn → Món xuất hiện ngay lập tức ở cột "Chờ làm"
2. Bếp thấy món mới, bấm "Bắt đầu" → Món chuyển sang "Đang làm"
3. Làm xong, bấm "Hoàn thành" → Món chuyển sang "Hoàn thành"
4. Thu ngân thấy thông báo món đã xong → Gọi khách lấy món

#### Công nghệ tôi muốn áp dụng:
**SignalR - Real-time communication**
- Không cần F5, không cần chờ đợi
- Mọi thay đổi cập nhật tức thì
- Như magic vậy!

#### Cảm xúc tôi muốn mang lại:
- Bếp cảm thấy **rõ ràng** vì biết chính xác cần làm gì
- Thu ngân cảm thấy **kết nối** vì biết bếp đang làm đến đâu
- Khách hàng cảm thấy **tin tưởng** vì thấy quy trình chuyên nghiệp

---

### **C. Quản lý kho thông minh**

#### Tôi hình dung:
Một hệ thống biết chính xác:
- Còn bao nhiêu kg cà phê hạt Robusta?
- Lô nào nhập ngày nào, hết hạn ngày nào?
- Cần nhập thêm bao nhiêu để đủ bán tuần này?

#### Điều đặc biệt tôi muốn làm:

**1. Bill of Materials (BOM) - Định lượng nguyên liệu**

Ví dụ: Một ly "Cà phê sữa đá size M" cần:
- 20g cà phê hạt Robusta
- 50ml sữa đặc
- 200g đá viên
- 1 ly nhựa size M
- 1 ống hút

Khi bán 1 ly → Hệ thống tự động trừ chính xác số lượng trên.

**2. Quy đổi đơn vị thông minh**

Ví dụ: Cà phê có nhiều đơn vị:
- Đơn vị cơ bản: gram (g)
- Đơn vị mua: túi 500g, bao 5kg, thùng 20kg
- Hệ thống tự động quy đổi: 1 túi = 500g, 1 bao = 5000g

**3. FIFO - First In First Out**

Nguyên liệu nào nhập trước thì dùng trước, tránh để quá hạn.

**4. Cảnh báo thông minh**
- 🔴 Hết hàng: Còn dưới 10% tồn kho tối thiểu
- 🟡 Sắp hết hạn: Còn 7 ngày nữa hết hạn
- 🟢 An toàn: Đủ hàng, còn hạn



---

### **D. Quản lý ca làm việc**

#### Tôi hình dung:
Mỗi ca làm việc là một "hành trình" riêng:


**Mở ca (8:00 sáng):**
- Thu ngân đăng nhập
- Nhập tiền đầu ca: 500,000đ
- Hệ thống ghi nhận thời gian bắt đầu

**Trong ca:**
- Bán hàng bình thường
- Hệ thống tự động tính doanh thu

**Đóng ca (17:00 chiều):**
- Đếm tiền thực tế: 3,200,000đ
- Hệ thống tính:
  - Tiền đầu ca: 500,000đ
  - Doanh thu ca: 2,800,000đ
  - Tiền cuối ca lý thuyết: 3,300,000đ
  - Tiền thực tế: 3,200,000đ
  - **Chênh lệch: -100,000đ** ⚠️

**Báo cáo Z-Report:**
- Tổng số đơn: 45 đơn
- Doanh thu: 2,800,000đ
- Món bán chạy nhất: Trà sữa trân châu (15 ly)
- Phương thức thanh toán: Tiền mặt 60%, Chuyển khoản 40%

#### Cảm xúc tôi muốn mang lại:
- Chủ quán cảm thấy **minh bạch** vì mọi giao dịch được ghi chép
- Thu ngân cảm thấy **công bằng** vì có bằng chứng rõ ràng
- Không còn **tranh cãi** về tiền bạc

---

### **E. Dashboard & Báo cáo**

#### Tôi hình dung:
Một trang tổng quan đẹp mắt với:

**📊 Phần 1: Tổng quan nhanh (Quick Stats)**
```
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD - HÔM NAY (23/12/2025)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 💰 Doanh thu │  │ 📦 Đơn hàng  │  │ 👥 Khách     │     │
│  │ 2,800,000đ   │  │ 45 đơn       │  │ 52 người     │     │
│  │ ↑ +15%       │  │ ↑ +8 đơn     │  │ ↑ +12 người  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 🏆 Bán chạy  │  │ ⏰ Ca hiện tại│  │ ⚠️ Cảnh báo  │     │
│  │ Trà sữa TC   │  │ 2,100,000đ   │  │ 3 món hết    │     │
│  │ 15 ly        │  │ 28 đơn       │  │ 2 sắp hết hạn│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**📈 Phần 2: Biểu đồ doanh thu 7 ngày**
```
Doanh thu (triệu đồng)
4.0 │                              ●
3.5 │                          ●
3.0 │                  ●   ●
2.5 │          ●   ●
2.0 │  ●   ●
    └─────────────────────────────────
     T2  T3  T4  T5  T6  T7  CN
```

**🥇 Phần 3: Top 5 món bán chạy**
```
1. Trà sữa trân châu      15 ly  ████████████████ 33%
2. Cà phê sữa đá          12 ly  █████████████ 27%
3. Trà đào cam sả          8 ly  ████████ 18%
4. Cà phê đen              6 ly  ██████ 13%
5. Sinh tố bơ              4 ly  ████ 9%
```

**💳 Phần 4: Phương thức thanh toán**
```
┌─────────────────────────────────┐
│ Tiền mặt:      1,680,000đ (60%) │
│ Chuyển khoản:  1,120,000đ (40%) │
│ Thẻ:                   0đ (0%)  │
└─────────────────────────────────┘
```

**👨‍💼 Phần 5: Hiệu suất nhân viên**
```
┌──────────────────────────────────────────────────┐
│ Nhân viên        │ Ca    │ Đơn hàng │ Doanh thu │
├──────────────────┼───────┼──────────┼───────────┤
│ Nguyễn Văn A     │ Sáng  │ 28 đơn   │ 2,100,000 │
│ Trần Thị B       │ Chiều │ 17 đơn   │ 1,200,000 │
│ Lê Văn C         │ Tối   │ 0 đơn    │ Đang làm  │
└──────────────────┴───────┴──────────┴───────────┘
```

**⚠️ Phần 6: Cảnh báo quan trọng**
```
🔴 HẾT HÀNG:
   - Trân châu đen (còn 0.5kg)
   - Ly nhựa size M (còn 10 cái)

� SẮP HẾT HẠN:
   - Sữa tươi lô #123 (hết hạn 25/12)
   - Thạch rau câu (hết hạn 26/12)

🟢 CẦN NHẬP HÀNG:
   - Cà phê hạt Robusta (dưới ngưỡng tối thiểu)
```

**📊 Phần 7: Báo cáo chi tiết**
```
┌─────────────────────────────────────┐
│ [Xuất Excel] [Xuất PDF] [Gửi Email]│
│                                     │
│ Chọn khoảng thời gian:              │
│ [Hôm nay ▼] [Tuần này ▼] [Tháng này ▼]│
│                                     │
│ Loại báo cáo:                       │
│ ☑ Doanh thu                         │
│ ☑ Sản phẩm bán chạy                 │
│ ☑ Hiệu suất nhân viên               │
│ ☑ Tồn kho                           │
│ ☐ Lãi lỗ (Pro)                      │
└─────────────────────────────────────┘
```

#### **🎯 Điểm đặc biệt theo 3 quyết định thiết kế:**

**1. Theo dõi thanh toán:**
- Hiển thị rõ: Đơn đã thanh toán vs Đơn chưa thanh toán
- Cảnh báo: Bàn nào đang có đơn chưa thanh toán
- Thống kê: Tỷ lệ thanh toán đúng hạn

**2. Theo dõi tồn kho realtime:**
- Cập nhật tức thì khi có đơn thanh toán (vì trừ kho lúc thanh toán)
- Dự báo: "Với tốc độ bán hiện tại, nguyên liệu X sẽ hết sau 2 ngày"
- Gợi ý nhập hàng thông minh

**3. Theo dõi bảo mật QR Code:**
- Thống kê: Số đơn QR Code hôm nay
- Cảnh báo: Đơn QR Code bất thường (cùng 1 SĐT đặt nhiều lần)
- Danh sách: Khách hàng đã đặt món qua QR (Tên + SĐT)

#### Cảm xúc tôi muốn mang lại:
- Chủ quán cảm thấy **tự hào** khi thấy doanh thu tăng trưởng
- Cảm thấy **sáng suốt** khi đưa ra quyết định dựa trên dữ liệu
- Cảm thấy **chuyên nghiệp** như các chuỗi lớn
- Cảm thấy **kiểm soát** mọi khía cạnh kinh doanh

---

## 🏆 V. THÀNH CÔNG TRONG MẮT TÔI LÀ GÌ?

### Về mặt kỹ thuật:

#### 1. **Kiến trúc vững chắc**
- N-Tier Architecture chuẩn chỉnh
- Code sạch, dễ đọc, dễ bảo trì
- Có Unit Tests, đảm bảo chất lượng

#### 2. **Bảo mật tốt**
- JWT Authentication
- Role-based Authorization
- Mã hóa mật khẩu
- Chống SQL Injection, XSS

#### 3. **Hiệu năng cao**
- Tải trang nhanh (< 2 giây)
- Real-time không lag
- Xử lý được 100+ đơn hàng/ngày

#### 4. **Dễ mở rộng**
- Thêm tính năng mới dễ dàng
- Tích hợp được với hệ thống khác
- Scale được khi quán lớn lên

---





---

### Về mặt học thuật:

Chứng minh tôi đã nắm vững:
- Phân tích hệ thống
- Thiết kế kiến trúc
- Lập trình Backend/Frontend
- Quản lý dự án
- Viết tài liệu chuyên nghiệp
#### 2. **Kiến thức thu được:**
- ASP.NET Core Web API
- React + Material-UI
- Entity Framework Core
- SignalR Real-time
- JWT Security
- N-Tier Architecture
- Database Design
- Unit Testing

#### 3. **Kỹ năng phát triển:**
- Tư duy hệ thống
- Giải quyết vấn đề
- Làm việc độc lập
- Quản lý thời gian
- Viết tài liệu kỹ thuật

---











#### 1. **Phát triển thêm tính năng:**
- Web Order cho khách (QR Code)
- Mobile App cho chủ quán
- Tích hợp VNPay thanh toán online
- Loyalty Program (Tích điểm khách hàng)

#### 2. **Mở rộng quy mô:**

- Quản lý nhân viên
- Quản lý bàn (Table management)
- Đặt bàn trước (Reservation)




---



