# KỊCH BẢN KIỂM THỬ BẢO MẬT (9 CHỨC NĂNG LEVEL 5)

Dưới đây là 9 kịch bản kiểm thử bảo mật độc lập để trình bày trong báo cáo đồ án tốt nghiệp, tương ứng với 9 kỹ thuật bảo mật đã triển khai trong hệ thống Cà Phê Minh Hữu.

---

## 1. Kiểm thử JWT Authentication (Xác thực người dùng)
* **Chức năng:** Bảo vệ các API yêu cầu đăng nhập.
* **Mục tiêu:** Đảm bảo hệ thống từ chối các request không có token hoặc token không hợp lệ.
* **Các bước test:**
  1. Dùng Postman gọi API danh sách quyền hạn (ví dụ: `GET /api/staff`) mà **không truyền header Authorization**.
  2. Truyền một chuỗi ngẫu nhiên (hoặc Token đã hết hạn) vào header `Authorization: Bearer <chuỗi_bậy>`.
* **Kết quả kỳ vọng:** Cả 2 trường hợp hệ thống đều trả về mã lỗi HTTP `401 Unauthorized` ngay lập tức. API không thực hiện query database.

---

## 2. Kiểm thử Role-based Authorization (Phân quyền chức vụ)
* **Chức năng:** Ngăn chặn nhân viên truy cập chức năng của Quản lý/Admin.
* **Mục tiêu:** Khẳng định middleware `[Authorize(Roles="Admin")]` hoạt động tốt.
* **Các bước test:**
  1. Lấy JWT Token của một tài khoản có Role là `Employee`.
  2. Gắn Token này vào Postman, gọi API xóa tài khoản hoặc xem báo cáo doanh thu (`DELETE /api/staff/{id}`).
* **Kết quả kỳ vọng:** Hệ thống từ chối với mã lỗi HTTP `403 Forbidden` (Có đăng nhập nhưng không đủ thẩm quyền).

---

## 3. Kiểm thử Ownership Authorization (Sở hữu dữ liệu cá nhân)
* **Chức năng:** Không cho phép Nhân viên A xem/sửa thông tin bảo mật của Nhân viên B.
* **Mục tiêu:** Khẳng định logic check UserId trong Controller/Service hoạt động chính xác.
* **Các bước test:**
  1. Lấy Token của Nhân viên A (có `userId = 1`).
  2. Dùng Token của A gọi API lấy thông tin Profile hoặc đổi mật khẩu cho Nhân viên B (`PUT /api/users/2/password`).
* **Kết quả kỳ vọng:** Hệ thống kiểm tra ID trong Token không khớp với ID truyền vào, từ chối và trả về lỗi `403 Forbidden` hoặc `400 Bad Request` kèm thông báo không có quyền thao tác trên người dùng khác.

---

## 4. Kiểm thử Active Middleware (Real-time Account Lockout)
* **Chức năng:** Đẩy user văng ra ngay lập tức nếu tài khoản bị Admin vô hiệu hóa.
* **Mục tiêu:** Chứng minh hệ thống kiểm tra trạng thái hoạt động (Active status) trong mỗi Request.
* **Các bước test:**
  1. Mở trình duyệt ẩn danh, đăng nhập bằng tài khoản Nhân viên A, lấy Token và thao tác bình thường.
  2. Từ màn hình của Admin, đổi trạng thái của Nhân viên A thành `Inactive` (Ngừng hoạt động).
  3. Quay lại trình duyệt ẩn danh, dùng Token cũ của A tiếp tục nhấn F5 hoặc gọi bất kỳ API nào.
* **Kết quả kỳ vọng:** Yêu cầu bị chặn đứng, trả về lỗi `401` hoặc `403` và Frontend tự động chuyển hướng về trang Đăng nhập. Refresh Token bị vô hiệu hóa.

---

## 5. Kiểm thử Global Rate Limiting (Chống DDoS Toàn cục)
* **Chức năng:** Giới hạn 30 request / 1 phút / 1 IP cho tất cả các API.
* **Mục tiêu:** Chống các cuộc tấn công DDoS quy mô nhỏ hoặc lỗi vòng lặp gọi API quá mức (Spam).
* **Các bước test:**
  1. Sử dụng tính năng "Collection Runner" của Postman hoặc viết một đoạn code Javascript gửi liên tục 35 request `GET` vào `/api/products` trong vòng vài giây.
* **Kết quả kỳ vọng:** 30 request đầu tiên trả về `200 OK`. Bắt đầu từ request thứ 31, hệ thống chặn lại và trả về HTTP `429 Too Many Requests`.

---

## 6. Kiểm thử Login Rate Limiting (Chống Brute-force mật khẩu)
* **Chức năng:** Giới hạn riêng cho API Đăng nhập (10 request / 1 phút).
* **Mục tiêu:** Ngăn chặn hacker dò rỉ tự động (Brute-force) mật khẩu admin.
* **Các bước test:**
  1. Dùng Postman (hoặc bấm nút Execute trên Swagger) gửi liên tục 12 request `POST /api/auth/login` với thông tin mật khẩu random.
* **Kết quả kỳ vọng:** Chỉ có 10 request đầu tiên được hệ thống xử lý (báo sai mật khẩu 401). Từ request thứ 11, hệ thống không thèm check DB nữa mà trả thẳng lỗi `429 Too Many Requests`.

---

## 7. Kiểm thử CORS Hardening (Cross-Origin Block)
* **Chức năng:** Chỉ cho phép Frontend hợp lệ (localhost:5173) gọi API. Sinh ra lỗi chặn các trang web giả mạo lấy cắp dữ liệu.
* **Mục tiêu:** Đảm bảo chính sách `WithOrigins` hoạt động.
* **Các bước test:**
  1. Mở một trang web bất kỳ (ví dụ: baomoi.com). Nhấn F12 sang tab Console.
  2. Dán đoạn code sau để giả vờ Hacker gọi lén API:
     `fetch('https://localhost:7280/api/products', { method: 'GET' })`
* **Kết quả kỳ vọng:** Trình duyệt sẽ hiển thị thông báo lỗi màu đỏ **CORS policy: No 'Access-Control-Allow-Origin' header is present**. API từ chối phản hồi chi tiết do khác Origin.

---

## 8. Kiểm thử HTTPS/HSTS Enforcement
* **Chức năng:** Ép buộc các kết nối phải mã hóa HTTPS và báo cho trình duyệt luôn luôn dùng HTTPS ở các lần sau.
* **Mục tiêu:** Chống tấn công giải mã đường truyền (Man-In-The-Middle / Packet Sniffing).
* **Các bước test:**
  1. Thử truy cập API bằng cổng HTTP (`http://localhost:5037/api/products`).
  2. Bật Tab Network (F12) trên trình duyệt để kiểm tra cấu trúc Header của Response.
* **Kết quả kỳ vọng:** 
  - Yêu cầu HTTP tự động bị chuyển hướng mã `307 Temporary Redirect` (hoặc 308) văng sang URL `https://...`.
  - Trong header Response sẽ có field `Strict-Transport-Security: max-age=...`, yêu cầu trình duyệt nhớ phiên làm việc an toàn này.

---

## 9. Kiểm thử Hệ thống Ghi vết (Audit Trail)
* **Chức năng:** Lưu giữ mọi tác động nhạy cảm vào bảng nhật ký để quy trách nhiệm khi có sự cố.
* **Mục tiêu:** Middleware `AuditLogActionFilter` sẽ bắt được mọi hành vi thay đổi (POST, PUT, DELETE).
* **Các bước test:**
  1. Dùng tài khoản Admin gọi API Thêm một Nguyên liệu mới (`POST /api/ingredients`) hoặc Xóa một Bàn.
  2. Mở SQL Server Management Studio (SSMS), query bảng `AuditLogs`.
* **Kết quả kỳ vọng:** Có một dòng mới được sinh ra chứa: Tên tài khoản Admin, loại hành động (POST/DELETE), tên API `api/ingredients`, địa chỉ IP của Admin và Timestamp lúc thực hiện. Không ai xóa được lịch sử này.
