# PHÂN TÍCH ĐỀ TÀI TỐT NGHIỆP
# HỆ THỐNG QUẢN LÝ QUÁN CÀ PHÊ MINH HỮU (SMARTPOS)

**Sinh viên thực hiện:** Nguyễn Hữu Hạnh  
**Ngày:** 23/12/2025  
**Khoa:** Công nghệ Thông tin  

---

## I. LÝ DO CHỌN ĐỀ TÀI

### 1.1. Bối cảnh thực tế

Trong bối cảnh ngành dịch vụ ăn uống phát triển mạnh mẽ tại Việt Nam, đặc biệt là các quán cà phê, trà sữa nhỏ lẻ, việc quản lý hiệu quả trở thành yếu tố then chốt quyết định sự thành bại của doanh nghiệp. Tuy nhiên, phần lớn các quán nhỏ vẫn đang sử dụng phương pháp quản lý thủ công hoặc bán tự động, dẫn đến nhiều vấn đề:

**Vấn đề 1: Quản lý bán hàng không hiệu quả**
- Thu ngân phải ghi nhớ giá từng món, size khác nhau, topping khác nhau
- Tính toán thủ công dễ sai sót, gây thiệt hại cho quán hoặc khách hàng
- Không có hóa đơn điện tử, khó kiểm soát doanh thu
- Thời gian phục vụ chậm, ảnh hưởng trải nghiệm khách hàng

**Vấn đề 2: Quản lý kho hàng thiếu khoa học**
- Không biết chính xác còn bao nhiêu nguyên liệu
- Không theo dõi được hạn sử dụng, dẫn đến lãng phí
- Không tính toán được nguyên liệu cần cho mỗi món (BOM)
- Thường xuyên xảy ra tình trạng hết hàng giữa chừng hoặc dư thừa

**Vấn đề 3: Thiếu kết nối giữa bộ phận**
- Bếp không biết món nào cần làm, thứ tự ưu tiên ra sao
- Thu ngân không biết món nào đã xong, khách phải chờ lâu
- Chủ quán không nắm được tình hình kinh doanh realtime

**Vấn đề 4: Quản lý nhân viên và ca làm việc**
- Khó kiểm soát giờ làm việc, doanh thu từng ca
- Dễ xảy ra tranh chấp về tiền bạc cuối ca
- Không đánh giá được hiệu suất làm việc

### 1.2. Động lực cá nhân

Qua quá trình quan sát và tìm hiểu thực tế tại quán cà phê Minh Hữu, em nhận thấy những khó khăn mà chủ quán và nhân viên đang gặp phải. Với kiến thức đã học về lập trình web, cơ sở dữ liệu, và kiến trúc phần mềm, em mong muốn xây dựng một hệ thống giúp giải quyết các vấn đề trên, đồng thời áp dụng các công nghệ hiện đại như:
- ASP.NET Core Web API (Backend)
- React + Material-UI (Frontend)
- SignalR (Real-time communication)
- Entity Framework Core (ORM)
- JWT Authentication & Authorization

### 1.3. Ý nghĩa của đề tài

Đề tài không chỉ giúp em hoàn thành yêu cầu tốt nghiệp mà còn tạo ra một sản phẩm thực tế, có thể triển khai và sử dụng ngay tại quán cà phê. Hơn nữa, hệ thống có thể mở rộng cho các quán cà phê, trà sữa nhỏ khác, góp phần nâng cao hiệu quả quản lý cho ngành F&B.

---

## II. ĐỐI TƯỢNG VÀ PHẠM VI NGHIÊN CỨU

### 2.1. Đối tượng nghiên cứu

**Đối tượng chính:**
- Quy trình quản lý và vận hành quán cà phê nhỏ (5-20 nhân viên)
- Hệ thống bán hàng tại quầy (POS - Point of Sale)
- Hệ thống hiển thị đơn hàng cho bếp (KDS - Kitchen Display System)
- Quản lý kho nguyên liệu và định lượng nguyên liệu (BOM)
- Quản lý ca làm việc và nhân viên

**Đối tượng sử dụng:**
- **Admin (Quản lý):** Chủ quán, quản lý cấp cao
- **Cashier (Thu ngân):** Nhân viên bán hàng tại quầy
- **Kitchen (Bếp):** Nhân viên chế biến món
- **Customer (Khách hàng):** Khách hàng đặt món qua QR Code

### 2.2. Phạm vi nghiên cứu

**Phạm vi về chức năng:**
- Quản lý danh mục sản phẩm, nguyên liệu
- Bán hàng tại quầy (POS)
- Hiển thị đơn hàng cho bếp realtime (KDS)
- Quản lý kho nguyên liệu (nhập, xuất, kiểm kho)
- Quản lý công thức món (BOM - Bill of Materials)
- Quản lý ca làm việc (mở ca, đóng ca, báo cáo)
- Quản lý bàn và QR Code
- Dashboard và báo cáo thống kê
- Đặt món qua QR Code (khách hàng tự đặt)

**Phạm vi về công nghệ:**
- Backend: ASP.NET Core 8.0 Web API
- Frontend: React 18 + Material-UI v5
- Database: SQL Server
- Real-time: SignalR
- Authentication: JWT
- Architecture: N-Tier (3-layer)

**Phạm vi triển khai:**
- Quán cà phê Minh Hữu (pilot)
- Có thể mở rộng cho các quán nhỏ khác

**Các tính năng sẽ thực hiện:**
- ✅ Thanh toán online VNPay (môi trường test/sandbox)
- ✅ Mobile App (Progressive Web App - PWA)
- ✅ Loyalty Program (tích điểm khách hàng - cơ bản)
- ✅ AI dự đoán doanh thu (Machine Learning - cơ bản)
- ✅ Tất cả chức năng đã liệt kê ở phần IV

**Ngoài phạm vi (KHÔNG làm trong đồ án):**
- ❌ Quản lý nhiều chi nhánh (Multi-branch management)
- ❌ Tích hợp với hệ thống kế toán bên ngoài (SAP, Oracle...)
- ❌ Native Mobile App (iOS/Android riêng biệt)

---

## III. Ý NGHĨA KHOA HỌC VÀ THỰC TIỄN

### 3.1. Ý nghĩa khoa học

**1. Áp dụng kiến trúc N-Tier chuẩn chỉnh**
- Phân tách rõ ràng: Presentation Layer, Business Logic Layer, Data Access Layer
- Dễ bảo trì, mở rộng, kiểm thử
- Tuân thủ nguyên tắc SOLID, DRY, KISS

**2. Nghiên cứu và triển khai Real-time Communication**
- Sử dụng SignalR để đồng bộ dữ liệu giữa POS và KDS
- Giải quyết bài toán cập nhật trạng thái đơn hàng tức thì
- Tối ưu hiệu năng với WebSocket

**3. Thiết kế hệ thống quản lý kho thông minh**
- Áp dụng thuật toán BOM (Bill of Materials) để tính toán nguyên liệu
- Quy đổi đơn vị tự động (gram, kg, túi, bao, thùng)
- Áp dụng FIFO (First In First Out) cho quản lý lô hàng

**4. Bảo mật và phân quyền**
- JWT Authentication
- Role-based Authorization (Admin, Cashier, Kitchen)
- Mã hóa mật khẩu với BCrypt
- Chống SQL Injection, XSS

**5. Thiết kế cơ sở dữ liệu chuẩn hóa**
- Tuân thủ chuẩn 3NF (Third Normal Form)
- Tối ưu query với Index
- Đảm bảo tính toàn vẹn dữ liệu với Foreign Key, Constraint

### 3.2. Ý nghĩa thực tiễn

**1. Giải quyết vấn đề thực tế**
- Giúp quán cà phê nhỏ quản lý hiệu quả hơn
- Tiết kiệm thời gian, công sức cho nhân viên
- Giảm thiểu sai sót, lãng phí

**2. Nâng cao trải nghiệm khách hàng**
- Phục vụ nhanh chóng, chính xác
- Hóa đơn điện tử chuyên nghiệp
- Khách có thể tự đặt món qua QR Code

**3. Hỗ trợ ra quyết định kinh doanh**
- Báo cáo doanh thu, sản phẩm bán chạy
- Phân tích hiệu suất nhân viên
- Dự báo nhu cầu nhập hàng

**4. Có thể thương mại hóa**
- Mô hình SaaS cho các quán nhỏ
- Dễ dàng tùy chỉnh cho từng loại hình (trà sữa, nhà hàng, bar)
- Chi phí triển khai thấp

**5. Đóng góp cho cộng đồng**
- Mã nguồn mở (có thể) cho sinh viên tham khảo
- Tài liệu hướng dẫn chi tiết
- Chia sẻ kinh nghiệm triển khai thực tế

---

## IV. CHỨC NĂNG ĐỀ TÀI (DANH SÁCH ĐẦY ĐỦ)

### 4.1. Nhóm chức năng QUẢN TRỊ HỆ THỐNG (Admin)

#### 4.1.1. Quản lý Danh mục sản phẩm (Category)
- Thêm danh mục mới (Cà phê, Trà, Sinh tố, Bánh...)
- Sửa thông tin danh mục
- Xóa danh mục (soft delete)
- Xem danh sách danh mục
- Tìm kiếm, lọc danh mục

#### 4.1.2. Quản lý Sản phẩm (Product)
- Thêm sản phẩm mới
  - Tên sản phẩm
  - Danh mục
  - Giá cơ bản
  - Hình ảnh
  - Mô tả
  - Trạng thái (Còn bán/Ngừng bán)
- Sửa thông tin sản phẩm
- Xóa sản phẩm (soft delete)
- Xem danh sách sản phẩm
- Tìm kiếm, lọc sản phẩm theo danh mục, trạng thái

#### 4.1.3. Quản lý Kích thước sản phẩm (Product Size)
- Thêm size cho sản phẩm (S, M, L)
- Định giá chênh lệch cho từng size (+0đ, +5000đ, +10000đ)
- Đặt size mặc định
- Sửa, xóa size

#### 4.1.4. Quản lý Topping
- Thêm topping mới (Trân châu, Thạch, Pudding...)
- Định giá topping
- Liên kết topping với nguyên liệu (để trừ kho)
- Trạng thái topping (Còn/Hết)
- Sửa, xóa topping

#### 4.1.5. Quản lý Danh mục nguyên liệu (Ingredient Category)
- Thêm danh mục nguyên liệu (Nguyên liệu chính, Phụ liệu, Bao bì...)
- Sửa, xóa danh mục nguyên liệu
- Xem danh sách

#### 4.1.6. Quản lý Nguyên liệu (Ingredient)
- Thêm nguyên liệu mới
  - Tên nguyên liệu
  - Danh mục
  - Đơn vị cơ bản (gram, ml, cái...)
  - Tồn kho tối thiểu
  - Mô tả
- Sửa thông tin nguyên liệu
- Xóa nguyên liệu (soft delete)
- Xem danh sách nguyên liệu
- Tìm kiếm, lọc nguyên liệu

#### 4.1.7. Quản lý Đơn vị quy đổi (Ingredient Unit)
- Thêm đơn vị quy đổi cho nguyên liệu
  - VD: Cà phê hạt
    - Đơn vị cơ bản: gram (1)
    - Túi 500g: 500 gram
    - Bao 5kg: 5000 gram
    - Thùng 20kg: 20000 gram
- Sửa, xóa đơn vị quy đổi
- Đặt đơn vị cơ bản

#### 4.1.8. Quản lý Công thức món (Recipe/BOM)
- Thêm công thức cho sản phẩm
  - Chọn sản phẩm
  - Thêm nguyên liệu cần dùng
  - Định lượng cho từng nguyên liệu
  - VD: Cà phê sữa đá size M cần:
    - 20g cà phê hạt Robusta
    - 50ml sữa đặc
    - 200g đá viên
    - 1 ly nhựa size M
    - 1 ống hút
- Sửa công thức
- Xóa công thức
- Xem công thức chi tiết
- Copy công thức cho size khác

#### 4.1.9. Quản lý Khu vực (Area)
- Thêm khu vực (Tầng 1, Tầng 2, Sân thượng...)
- Sửa, xóa khu vực
- Xem danh sách khu vực

#### 4.1.10. Quản lý Bàn (Table)
- Thêm bàn mới
  - Số bàn
  - Tên bàn
  - Khu vực
  - Số ghế
  - Trạng thái (Trống/Đang dùng/Đặt trước)
- Tạo QR Code cho bàn
- Sửa thông tin bàn
- Xóa bàn (soft delete)
- Xem danh sách bàn theo khu vực
- Xem trạng thái bàn realtime

#### 4.1.11. Quản lý Nhân viên (User)
- Thêm nhân viên mới
  - Username
  - Password (mã hóa)
  - Họ tên
  - Số điện thoại
  - Vai trò (Admin/Cashier/Kitchen)
- Sửa thông tin nhân viên
- Đổi mật khẩu
- Phân quyền nhân viên
  - Sẽ có quy định theo từng mã nhân viên để tính chấm công và lương
  - Thiết lập mức lương cơ bản, hệ số lương
  - Cấu hình ngày lễ (x2, x3 lương)
- Xóa nhân viên (soft delete)
- Xem danh sách nhân viên
- Xem lịch sử làm việc của nhân viên

#### 4.1.12. Quản lý Ca làm việc (Shift Management)
- Xem tất cả ca làm việc (dựa theo mã nhân viên, mã quản lý)
  - Lọc theo ngày, tuần, tháng
  - Lọc theo nhân viên
  - Lọc theo trạng thái (Đang mở/Đã đóng)
- Xem chi tiết ca (dựa theo mã nhân viên, mã quản lý)
  - Thông tin nhân viên
  - Thời gian mở/đóng ca
  - Tiền đầu ca, tiền cuối ca
  - Doanh thu ca
  - Chênh lệch
  - Danh sách đơn hàng trong ca
  - Tính lương ca làm việc (dựa trên giờ làm và hệ số)
- Đóng ca thay nhân viên (nếu nhân viên quên)
- Xem báo cáo ca
- Xuất báo cáo Excel, PDF

#### 4.1.13. Xem Dashboard
- Tổng quan nhanh
  - Doanh thu hôm nay
  - Số đơn hàng
  - Số khách
  - Món bán chạy
  - Doanh thu ca hiện tại
  - Cảnh báo (hết hàng, sắp hết hạn)
- Biểu đồ doanh thu 7 ngày
- Top 5 món bán chạy
- Phương thức thanh toán
- Hiệu suất nhân viên
- Cảnh báo tồn kho

#### 4.1.14. Xem Báo cáo & Thống kê
- Báo cáo doanh thu
  - Theo ngày, tuần, tháng, năm
  - So sánh với kỳ trước
  - Biểu đồ xu hướng
- Báo cáo sản phẩm bán chạy
  - Top sản phẩm
  - Sản phẩm ế ẩm
  - Phân tích theo danh mục
- Báo cáo hiệu suất nhân viên
  - Doanh thu từng người
  - Số đơn hàng
  - Chênh lệch tiền
- Báo cáo tồn kho
  - Nguyên liệu sắp hết
  - Nguyên liệu sắp hết hạn
  - Giá trị tồn kho
- Xuất báo cáo Excel, PDF
- Gửi email báo cáo tự động

#### 4.1.15. Cấu hình hệ thống
- Cấu hình giờ mở cửa/đóng cửa
- Cấu hình thuế VAT
- Cấu hình thông tin quán (tên, địa chỉ, logo)
- Cấu hình email server
- Cấu hình in hóa đơn

---

### 4.2. Nhóm chức năng THU NGÂN (Cashier)

#### 4.2.1. Đăng nhập
- Nhập username, password
- Xác thực JWT
- Lưu token vào localStorage
- Chuyển hướng theo vai trò

#### 4.2.2. Mở ca làm việc
- Kiểm tra ca đang mở
- Nhập tiền đầu ca
- Nhập ghi chú (nếu có)
- Xác nhận mở ca (cần mã quản lý ca để xác thực)
- Hệ thống tạo Shift mới

#### 4.2.3. Bán hàng (SmartPOS)
- Hiển thị danh sách sản phẩm theo danh mục
- Tìm kiếm sản phẩm nhanh
- Chọn món
- Chọn size (S/M/L)
- Chọn topping (nhiều lựa chọn)
- Nhập số lượng
- Thêm ghi chú cho món
- Thêm vào giỏ hàng
- Xem giỏ hàng
- Sửa số lượng món trong giỏ
- Xóa món khỏi giỏ
- Tính tổng tiền tự động
- Áp dụng giảm giá (nếu có)
- Bấm "Đặt món"
- Kiểm tra tồn kho (không thay đổi, chỉ xem - logic kiểm tra do Bếp quản lý)
  - Nếu không đủ → Cảnh báo
  - Nếu đủ → Tạo đơn hàng
- Gửi đơn cho bếp qua SignalR
- Dự kiến hoàn thành đơn hàng dựa trên:
  - Công thức món (thời gian chế biến)
  - Tình trạng bill còn trên KDS (số lượng đơn đang chờ)
- Bấm "Thanh toán"
- Chọn phương thức thanh toán
  - Tiền mặt: Nhập tiền khách đưa, tính tiền thừa
  - Chuyển khoản: Hiển thị QR Code (cần làm vì có môi trường test VNPay)
  - Thẻ: Quẹt thẻ (có thể chưa làm ngay vì vướng bận nhiều xác thực ngân hàng)
- Xác nhận thanh toán
- Trừ kho nguyên liệu
- Cập nhật IsPaid = true
- In hóa đơn

#### 4.2.4. Quản lý Bàn
- Xem danh sách bàn theo khu vực
- Xem trạng thái bàn realtime
- Chọn bàn để bán hàng
- Xem đơn hàng của bàn
- Xem màn hình KDS bếp để theo dõi đơn hàng (realtime)
- Chuyển bàn

#### 4.2.5. Xem đơn hàng
- Xem danh sách đơn hàng hôm nay (không cần thiết - có thể bỏ)
- Lọc theo trạng thái (Chờ làm/Đang làm/Xong/Đã thanh toán)
- Xem chi tiết đơn hàng
- Hủy đơn hàng (nếu chưa làm, cần xác thực của admin → tạo phiếu yêu cầu hủy)
- In lại hóa đơn

#### 4.2.6. Xem doanh thu ca hiện tại
- Xem tổng doanh thu ca
- Xem số đơn hàng
- Xem thời gian làm việc (tính luôn lương hôm nay làm được, sẽ setup theo ngày lễ có thể x2, x3)


#### 4.2.7. Đóng ca làm việc
- Kiểm tra đơn hàng chưa thanh toán
- Tính toán doanh thu ca
- Hiển thị tiền lý thuyết
- Nhập tiền thực tế
- Tính chênh lệch tự động
- Nhập ghi chú (nếu có chênh lệch)
- Xác nhận đóng ca
- In báo cáo ca (Z-Report)
- Đăng xuất (Kết thúc ca làm việc) = Kết thúc ca làm việc =>

---

### 4.3. Nhóm chức năng BẾP (Kitchen)

#### 4.3.1. Đăng nhập
- Nhập username, password
- Xác thực JWT
- Chuyển đến màn hình KDS

#### 4.3.2. Xem đơn hàng realtime (KDS)
- Kết nối SignalR
- Hiển thị 3 cột trạng thái:
  - **Chờ làm (Pending)::** Màu vàng cam
  - **Đang làm (Cooking):** Màu xanh dương
  - **Hoàn thành (Done):** Màu xanh lá → Gửi notification đến Cashier
- Nhận đơn mới realtime
- Phát âm thanh thông báo khi có đơn mới
- Hiển thị thông tin món:
  - Số bàn (nếu có)
  - Tên món
  - Size
  - Topping
  - Số lượng
  - Ghi chú
  - Thời gian đặt

#### 4.3.3. Cập nhật trạng thái món
- Bấm "Bắt đầu" → Chuyển sang "Đang làm"
- Bấm "Hoàn thành" → Chuyển sang "Hoàn thành"
- Gửi thông báo realtime cho Cashier/Khách hàng
- Tự động ẩn món sau 5 phút nếu Cashier đã lấy món (xác nhận)

#### 4.3.4. Hủy món (nếu cần)
- Bấm "Hủy món"
- Nhập lý do hủy (Hết nguyên liệu, Khách hủy, Lỗi kỹ thuật, Nguyên liệu hỏng trước hạn...)
- Gửi thông báo cho Cashier/Khách hàng

#### 4.3.5. Thông báo tình trạng nguyên liệu
- Bếp chủ động kiểm tra nguyên liệu trước mỗi ca
- Gửi notification đến Cashier về món nào hết nguyên liệu
- Cập nhật trạng thái món "Tạm hết" trên hệ thống
- Thống nhất phương án bán món trong buổi với Cashier

#### 4.3.6. Nhập kho nguyên liệu
- Chọn nguyên liệu
- Nhập số lượng nhập
- Chọn đơn vị
- Nhập giá nhập
- Nhập ngày hết hạn
- Nhập mã lô (Batch Code)
- Nhập vị trí lưu trữ
- Xác nhận nhập kho
- Hệ thống tạo InventoryBatch mới
- Cập nhật tồn kho

#### 4.3.7. Kiểm kho (Inventory Audit)
- Tạo phiếu kiểm kho mới
- Chọn nguyên liệu cần kiểm (tick chọn mục sẽ kiểm kho)
  - VD: Hôm nay kiểm gì thì tick chọn
  - Báo kết quả của những phần đã tick chọn
  - Nếu không tick chọn thì không kiểm kho
  - Nên có lịch kiểm kho hàng tuần
- Nhập số lượng thực tế
- Xác nhận kiểm kho
- Gửi phiếu kiểm kho cho Admin (Admin sẽ xử lý chênh lệch)

---

### 4.4. Nhóm chức năng KHÁCH HÀNG (Customer)

#### 4.4.1. Xem Menu trực tuyến
- Truy cập website quán
- Xem danh sách sản phẩm theo danh mục
- Xem hình ảnh, giá, mô tả sản phẩm
- Tìm kiếm sản phẩm

#### 4.4.2. Xem Bàn trống (Realtime)
- Xem sơ đồ bàn theo khu vực
- Nếu chọn "Dùng tại chỗ":
  - Hẹn giờ đến quán (VD: 15 phút nữa đến)
  - Xác nhận qua email/SMS
  - Đặt trước bàn
- Xem trạng thái bàn realtime
  - Trống: Màu xanh
  - Đang dùng: Màu đỏ
  - Đặt trước: Màu vàng

#### 4.4.3. Đặt món qua QR Code (trường hợp khách dùng tại chỗ, đang có mặt ở quán)
- Quét QR Code trên bàn
- Hệ thống kiểm tra:
  - Giờ mở cửa (nếu ngoài giờ → Báo lỗi)
  - Trạng thái bàn (nếu đang dùng → Báo lỗi)
- Hiển thị form nhập thông tin:
  - Họ tên (bắt buộc)
  - Số điện thoại (bắt buộc, 10 số)
- Validate thông tin
- Hiển thị menu sản phẩm
- Chọn món
- Chọn size
- Chọn topping
- Thêm vào giỏ hàng
- Xem giỏ hàng
- Sửa, xóa món trong giỏ
- Bấm "Gửi đơn hàng"
- Kiểm tra tồn kho
  - Nếu không đủ → Báo lỗi "Món đã hết"
  - Nếu đủ → Tạo đơn hàng
- Gửi đơn cho bếp qua SignalR
- Cập nhật trạng thái bàn = "Occupied"
- Hiển thị xác nhận đặt món thành công

#### 4.4.4. Theo dõi đơn hàng
- Xem trạng thái món realtime:
  - Chờ làm → Đang làm → Hoàn thành
- Nhận thông báo khi món xong
- Gọi nhân viên để thanh toán

#### 4.4.5. Đặt món qua Web (Mang đi)
- Truy cập website
- Chọn "Đặt món mang đi"
- Nhập thông tin:
  - Họ tên
  - Số điện thoại
  - Thời gian nhận (nếu đặt trước)
- Chọn món, size, topping
- Thêm vào giỏ hàng
- Xác nhận đơn hàng
- Nhận mã đơn hàng
- Theo dõi trạng thái đơn hàng

#### 4.4.6. Đánh giá và Phản hồi
- Đánh giá món ăn (1-5 sao)
- Đánh giá cách phục vụ
- Viết nhận xét, góp ý
- Xem đánh giá của khách khác

#### 4.4.7. Chương trình khách hàng thân thiết
- Đăng ký nhận giảm giá thành viên (nếu có)
- Tích điểm khi mua hàng
- Đổi điểm lấy quà/voucher
- Nhận thông báo khuyến mãi

---

## V. KẾT QUẢ DỰ KIẾN

### 5.1. Sản phẩm phần mềm

**Backend (ASP.NET Core 8.0 Web API):**
- ✅ Kiến trúc N-Tier chuẩn chỉnh
- ✅ 15+ Controllers với đầy đủ CRUD
- ✅ 15+ Services xử lý business logic
- ✅ 15+ Repositories truy cập dữ liệu
- ✅ 20+ Models/Entities
- ✅ 20+ DTOs (Data Transfer Objects)
- ✅ JWT Authentication & Authorization
- ✅ SignalR Hub cho real-time
- ✅ Unit Tests (dự kiến 70% coverage)

**Frontend (React 18 + Material-UI v5):**
- ✅ 10+ Pages (Dashboard, POS, KDS, Quản lý...)
- ✅ 30+ Components tái sử dụng
- ✅ SignalR Client
- ✅ Axios HTTP Client
- ✅ React Router v6
- ✅ Context API cho state management
- ✅ Responsive design (Desktop, Tablet, Mobile)

**Database (SQL Server):**
- ✅ 20+ Tables chuẩn hóa 3NF
- ✅ Foreign Keys, Constraints
- ✅ Indexes tối ưu
- ✅ Stored Procedures (nếu cần)

### 5.2. Tài liệu kỹ thuật

**Tài liệu phân tích & thiết kế:**
- ✅ Use Case Diagram tổng quan
- ✅ Use Case chi tiết cho từng chức năng
- ✅ Đặc tả Use Case đầy đủ
- ✅ Sequence Diagram cho luồng chính
- ✅ ERD (Entity Relationship Diagram)
- ✅ Class Diagram
- ✅ Database Schema

**Tài liệu hướng dẫn:**
- ✅ Hướng dẫn cài đặt (Installation Guide)
- ✅ Hướng dẫn sử dụng (User Manual)
- ✅ API Documentation (Swagger)
- ✅ Hướng dẫn triển khai (Deployment Guide)

**Báo cáo tốt nghiệp:**
- ✅ Báo cáo đầy đủ theo quy định nhà trường
- ✅ Slide thuyết trình
- ✅ Video demo hệ thống

### 5.3. Chức năng hoàn thiện

**Chức năng CORE (Bắt buộc - Ưu tiên cao nhất):**
- ✅ Quản lý sản phẩm, danh mục
- ✅ Quản lý nguyên liệu, kho hàng
- ✅ Quản lý công thức món (BOM)
- ✅ Bán hàng POS
- ✅ Màn hình bếp KDS realtime
- ✅ Quản lý ca làm việc
- ✅ Dashboard & Báo cáo

**Chức năng BỔ SUNG (Phải hoàn thành):**
- ✅ Đặt món qua QR Code (với xác thực khách hàng)
- ✅ Quản lý bàn (Table Management)
- ✅ Kiểm kho (Inventory Audit)
- ✅ Xuất báo cáo Excel, PDF
- ✅ Thanh toán VNPay (môi trường test)
- ✅ Quản lý Size & Topping
- ✅ Quản lý nhân viên đầy đủ
- ✅ Loyalty Program cơ bản (tích điểm)
- ✅ AI dự đoán doanh thu (Linear Regression/Time Series)

**Chức năng NÂNG CAO (Nếu còn thời gian):**
- ⚠️ PWA (Progressive Web App) cho mobile
- ⚠️ Đặt bàn trước (Reservation)
- ⚠️ Gửi email báo cáo tự động
- ⚠️ Thống kê nâng cao (biểu đồ phức tạp)
- ⚠️ AI gợi ý combo món (Recommendation System)

### 5.4. Tiêu chí đánh giá


---

## VI. PHÂN TÍCH HỆ THỐNG

### 6.1. Các tác nhân (Actors)

Hệ thống SmartPOS có 4 tác nhân chính:

#### 6.1.1. Admin (Quản lý)
**Vai trò:** Chủ quán, quản lý cấp cao

**Trách nhiệm:**
- Quản lý toàn bộ hệ thống
- Quản lý sản phẩm, nguyên liệu, công thức
- Quản lý nhân viên, phân quyền
- Quản lý ca làm việc của tất cả nhân viên
- Xem báo cáo, thống kê tổng thể
- Cấu hình hệ thống

**Quyền hạn:** Cao nhất, truy cập tất cả chức năng

#### 6.1.2. Cashier (Thu ngân)
**Vai trò:** Nhân viên bán hàng tại quầy

**Trách nhiệm:**
- Mở/Đóng ca làm việc
- Bán hàng tại quầy (POS)
- Quản lý bàn
- Xem đơn hàng
- Xem doanh thu ca hiện tại

**Quyền hạn:** Trung bình, chỉ truy cập chức năng liên quan đến bán hàng

#### 6.1.3. Kitchen (Bếp)
**Vai trò:** Nhân viên chế biến món

**Trách nhiệm:**
- Xem đơn hàng realtime (KDS)
- Cập nhật trạng thái món
- Nhập kho nguyên liệu
- Kiểm kho

**Quyền hạn:** Thấp, chỉ truy cập KDS và quản lý kho

#### 6.1.4. Customer (Khách hàng)
**Vai trò:** Khách hàng sử dụng dịch vụ

**Trách nhiệm:**
- Xem menu trực tuyến
- Đặt món qua QR Code
- Theo dõi đơn hàng
- Đặt món qua Web (mang đi)
- Đánh giá món, cách phục vụ
- Đăng ký nhận giảm giá thành viên (nếu có)
**Quyền hạn:** Thấp nhất, không cần đăng nhập (có thể đăng nhập, đăng ký nếu cần), chỉ truy cập chức năng công khai

---

### 6.2. Các chức năng chính của hệ thống

Hệ thống SmartPOS được chia thành 4 nhóm chức năng chính:

#### 6.2.1. Nhóm Quản trị (Admin Module)
**Mục đích:** Quản lý toàn bộ hệ thống

**Các chức năng:**
1. Quản lý Danh mục sản phẩm (Category Management)
2. Quản lý Sản phẩm (Product Management)
3. Quản lý Kích thước sản phẩm (Product Size Management)
4. Quản lý Topping (Topping Management)
5. Quản lý Danh mục nguyên liệu (Ingredient Category Management)
6. Quản lý Nguyên liệu (Ingredient Management)
7. Quản lý Đơn vị quy đổi (Unit Conversion Management)
8. Quản lý Công thức món (Recipe/BOM Management)
9. Quản lý Khu vực (Area Management)
10. Quản lý Bàn (Table Management)
11. Quản lý Nhân viên (User Management)
12. Quản lý Ca làm việc (Shift Management)
13. Xem Dashboard (Dashboard View)
14. Xem Báo cáo & Thống kê (Reports & Analytics)
15. Cấu hình hệ thống (System Configuration)
16. Quản lý Kho nguyên liệu (Inventory Management)
17. Quản lý Đơn hàng (Order Management)
18. Quản lý Khách hàng (Customer Management)
19. Quản lý Đánh giá (Review Management)
20. Quản lý Thanh toán (Payment Management)
21. Quản lý Báo cáo, Phiếu (Report Management)
22. Quản lý Quyền hạn (Permission Management)


**Đặc điểm:**
- Quyền hạn cao nhất
- Truy cập toàn bộ dữ liệu
- Có thể can thiệp vào mọi quy trình

#### 6.2.2. Nhóm Bán hàng (Cashier Module)
**Mục đích:** Xử lý giao dịch bán hàng

**Các chức năng:**
1. Đăng nhập (Login)
2. Mở ca làm việc (Open Shift)
3. Bán hàng POS (POS Sales)
4. Quản lý Bàn (Table Management)
5. Xem đơn hàng (View Orders)
6. Xem doanh thu ca (View Shift Revenue)
7. Đóng ca làm việc (Close Shift)

**Đặc điểm:**
- Giao diện thân thiện, dễ sử dụng
- Tối ưu cho màn hình cảm ứng
- Tính toán tự động, nhanh chóng
- Tích hợp in hóa đơn

#### 6.2.3. Nhóm Bếp (Kitchen Module)
**Mục đích:** Hiển thị và quản lý đơn hàng cho bếp

**Các chức năng:**
1. Đăng nhập (Login)
2. Xem đơn hàng realtime (KDS - Kitchen Display System)
3. Cập nhật trạng thái món (Update Order Status)
4. Hủy món (Cancel Item)
5. Nhập kho nguyên liệu (Import Inventory)
6. Kiểm kho (Inventory Audit)

**Đặc điểm:**
- Real-time với SignalR
- Giao diện lớn, rõ ràng
- Phân loại món theo trạng thái
- Âm thanh thông báo đơn mới

#### 6.2.4. Nhóm Khách hàng (Customer Module)
**Mục đích:** Phục vụ khách hàng đặt món online

**Các chức năng:**
1. Xem Menu trực tuyến (View Menu)
2. Xem Bàn trống (View Available Tables)
3. Đặt món qua QR Code (QR Code Ordering)
4. Theo dõi đơn hàng (Track Order)
5. Đặt món qua Web (Web Ordering - Takeaway)

**Đặc điểm:**
- Không cần đăng nhập, có thể đăng nhập/đăng ký nếu cần
- Giao diện mobile-friendly
- Real-time tracking
- Bảo mật với validation

---

**LƯU Ý:** Phần Use Case Diagram, Đặc tả Use Case, Sơ đồ tuần tự, và Sơ đồ quan hệ sẽ được trình bày chi tiết trong các file riêng biệt:
- `SO_DO_PHAN_TICH_HE_THONG.md` (cần remake)
- `DAC_TA_USE_CASE_CA_LAM_VIEC.md` (cần remake)
- `SO_DO_TUAN_TU.md` (cần tạo mới)
- `SO_DO_QUAN_HE.md` (cần tạo mới)
- `USECASE_CHI_TIET.md` (cần tạo mới)
- Các file PlantUML trong thư mục `diagrams/`

---

## VII. GIẢI PHÁP KỸ THUẬT CHO CÁC ĐIỂM CHẾT VÀ VẤN ĐỀ LOGIC

> **Tham khảo:** File phân tích chi tiết `PHAN_TICH_LOGIC_VA_DIEM_CHET.md`

### 7.1. Giải pháp cho Race Condition - Tồn kho

**Vấn đề:** Kiểm tra tồn kho khi đặt món → Thanh toán mới trừ kho → Có thể dẫn đến tồn kho âm

**Giải pháp áp dụng:**
1. **Thêm bảng InventoryReservation:**
   ```sql
   CREATE TABLE InventoryReservation (
       Id INT PRIMARY KEY IDENTITY,
       IngredientId INT FOREIGN KEY REFERENCES Ingredient(Id),
       OrderId INT FOREIGN KEY REFERENCES Order(Id),
       QuantityReserved DECIMAL(10,2),
       ReservedAt DATETIME DEFAULT GETDATE(),
       ExpiresAt DATETIME,
       Status VARCHAR(20) -- 'Reserved', 'Committed', 'Released'
   );
   ```

2. **Luồng xử lý mới:**
   - Đặt món → Lock tồn kho (Reserved)
   - Thanh toán → Commit trừ kho (Committed)
   - Hủy đơn → Release (Released)

### 7.2. Giải pháp cho Deadlock - Mở ca

**Vấn đề:** Không có timeout khi nhập mã quản lý → Có thể deadlock

**Giải pháp áp dụng:**
1. **Timeout 30 giây** cho mọi transaction
2. **Optimistic Locking** với Version column
3. **OTP thay vì mã cố định:**
   - Admin tạo OTP → Gửi SMS/Email
   - OTP expire sau 5 phút

### 7.3. Giải pháp cho Data Inconsistency - Đóng ca

**Vấn đề:** Đóng ca khi vẫn có đơn mới được tạo từ QR Code

**Giải pháp áp dụng:**
1. **Lock ca khi bắt đầu đóng:**
   - Status = "Closing" → Không nhận đơn mới
   - Kiểm tra đơn → Đóng ca → Status = "Closed"

2. **Disable QR Code** khi ca đang đóng

### 7.4. Giải pháp cho Concurrency - Bếp

**Vấn đề:** Nhiều chef cùng bấm "Bắt đầu" một món

**Giải pháp áp dụng:**
1. **Optimistic Locking với Version:**
   ```sql
   ALTER TABLE OrderDetail ADD Version INT DEFAULT 1;
   
   UPDATE OrderDetail 
   SET Status = 'Cooking', Version = Version + 1
   WHERE OrderDetailId = @id AND Version = @currentVersion;
   ```

2. **SignalR realtime sync** ngay lập tức

### 7.5. Giải pháp cho Logic Kiểm kho

**Vấn đề:** Không tự động điều chỉnh tồn kho sau kiểm kho

**Giải pháp áp dụng:**
1. **Workflow approve:**
   - Bếp kiểm → Tạo phiếu → Admin approve → Điều chỉnh tồn kho

2. **Tự động tính chênh lệch:**
   - Nếu |Chênh lệch| > 10% → Cảnh báo Admin

### 7.6. Giải pháp cho Thanh toán sau

**Vấn đề:** Khách không thanh toán → Tồn kho sai

**Giải pháp áp dụng:**
1. **Sử dụng InventoryReservation** (như 7.1)
2. **Timeout đơn hàng:**
   - Đơn chưa thanh toán sau 2 giờ → Auto cancel → Release kho

### 7.7. Giải pháp cho Security - Mã quản lý

**Vấn đề:** Mã quản lý có thể bị lộ

**Giải pháp áp dụng:**
1. **OTP (One-Time Password):**
   - Admin tạo OTP mới mỗi ca
   - Expire sau 5 phút
   - Gửi qua SMS/Email

### 7.8. Giải pháp cho Chênh lệch tiền

**Vấn đề:** Không giới hạn chênh lệch tối đa

**Giải pháp áp dụng:**
1. **Giới hạn chênh lệch:**
   - Nếu |Chênh lệch| > 10% Tiền lý thuyết → Block
   - Yêu cầu Admin approve

2. **Confirmation popup** khi chênh lệch > 50,000đ

### 7.9. Giải pháp cho Performance - Dự kiến hoàn thành

**Vấn đề:** Query nhiều mỗi lần đặt món

**Giải pháp áp dụng:**
1. **Redis Cache:**
   ```
   pending_orders_count = 5
   Increment khi đặt món
   Decrement khi hoàn thành
   ```

2. **Pre-calculate** thời gian trong Product table

### 7.10. Giải pháp cho Performance - Notification

**Vấn đề:** Broadcast đến tất cả Cashier → Overload

**Giải pháp áp dụng:**
1. **SignalR Groups:**
   ```csharp
   SignalR.Clients.Group("Cashiers").SendAsync("Alert", data);
   ```

2. **Throttle:** 1 notification / 5 phút cho cùng nguyên liệu

### 7.11. Giải pháp cho UX - Tự động ẩn món

**Vấn đề:** Không biết Cashier đã lấy món chưa

**Giải pháp áp dụng:**
1. **Cashier xác nhận:**
   - Món xong → Cashier bấm "Đã lấy món" → Ẩn

2. **Hoặc:** Không tự động ẩn, chỉ chuyển màu xám sau 5 phút

### 7.12. Giải pháp cho UX - Hủy đơn

**Vấn đề:** Hủy đơn cần Admin approve → Quá chậm

**Giải pháp áp dụng:**
1. **Phân quyền theo thời gian:**
   - Đơn < 2 phút → Cashier tự hủy
   - Đơn > 2 phút → Cần Admin approve

2. **Hoặc theo trạng thái:**
   - Status = Pending → Cashier tự hủy
   - Status = Cooking/Done → Cần Admin approve

---

## VIII. DATABASE SCHEMA BỔ SUNG

### 8.1. Bảng mới cần thêm

```sql
-- Bảng quản lý tồn kho tạm giữ
CREATE TABLE InventoryReservation (
    Id INT PRIMARY KEY IDENTITY,
    IngredientId INT FOREIGN KEY REFERENCES Ingredient(Id),
    OrderId INT FOREIGN KEY REFERENCES [Order](Id),
    QuantityReserved DECIMAL(10,2),
    ReservedAt DATETIME DEFAULT GETDATE(),
    ExpiresAt DATETIME,
    Status VARCHAR(20) CHECK (Status IN ('Reserved', 'Committed', 'Released')),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng OTP cho mở ca
CREATE TABLE ShiftOTP (
    Id INT PRIMARY KEY IDENTITY,
    OTPCode VARCHAR(6),
    AdminId INT FOREIGN KEY REFERENCES [User](Id),
    CreatedAt DATETIME DEFAULT GETDATE(),
    ExpiresAt DATETIME,
    IsUsed BIT DEFAULT 0,
    UsedAt DATETIME NULL
);
```

### 8.2. Cột bổ sung cho bảng hiện có

```sql
-- Thêm Version cho Optimistic Locking
ALTER TABLE OrderDetail ADD Version INT DEFAULT 1;
ALTER TABLE Shift ADD Version INT DEFAULT 1;
ALTER TABLE Ingredient ADD Version INT DEFAULT 1;

-- Thêm trạng thái cho Shift
ALTER TABLE Shift ADD Status VARCHAR(20) DEFAULT 'Open' 
    CHECK (Status IN ('Open', 'Closing', 'Closed'));

-- Thêm timeout cho Order
ALTER TABLE [Order] ADD ExpiresAt DATETIME NULL;
ALTER TABLE [Order] ADD AutoCancelledAt DATETIME NULL;
```

---

## IX. BUSINESS RULES BỔ SUNG

### 9.1. Quy tắc quản lý tồn kho

1. **Khi đặt món:**
   - Lock tồn kho (Reserved)
   - Tạo InventoryReservation
   - ExpiresAt = Now + 2 giờ

2. **Khi thanh toán:**
   - Commit trừ kho (Committed)
   - Cập nhật InventoryReservation.Status = 'Committed'

3. **Khi hủy/timeout:**
   - Release kho (Released)
   - Hoàn lại InventoryAvailable

### 9.2. Quy tắc quản lý ca

1. **Mở ca:**
   - Yêu cầu OTP từ Admin
   - OTP expire sau 5 phút
   - Timeout transaction = 30 giây

2. **Đóng ca:**
   - Lock ca (Status = 'Closing')
   - Disable QR Code
   - Kiểm tra đơn chưa thanh toán
   - Giới hạn chênh lệch <= 10%

### 9.3. Quy tắc concurrency

1. **Optimistic Locking:**
   - Tất cả UPDATE phải check Version
   - Nếu Version không khớp → Retry hoặc báo lỗi

2. **SignalR Realtime:**
   - Broadcast ngay khi có thay đổi
   - Latency < 500ms

### 9.4. Quy tắc hủy đơn

1. **Cashier tự hủy:**
   - Đơn < 2 phút
   - Status = Pending

2. **Cần Admin approve:**
   - Đơn > 2 phút
   - Status = Cooking/Done

---

**Ngày cập nhật:** 26/12/2025  
**Người thực hiện:** Nguyễn Hữu Hạnh  
**Trạng thái:** ✅ ĐÃ BỔ SUNG GIẢI PHÁP KỸ THUẬT
