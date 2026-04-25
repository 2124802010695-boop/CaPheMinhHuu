# 📚 TỪ ĐIỂN THUẬT NGỮ DỰ ÁN CÀ PHÊ MINH HỮU

## 📅 Ngày cập nhật: 10/12/2025

---

## 1️⃣ THUẬT NGỮ QUẢN LÝ KHO

### A. Nguyên liệu (Ingredient)

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **Ingredient** | Nguyên liệu | Vật liệu thô dùng để chế biến sản phẩm (cà phê hạt, sữa, đường...) |
| **Ingredient Category** | Danh mục nguyên liệu | Nhóm phân loại nguyên liệu (VD: Cà phê hạt & Bột, Trà & Hoa Khô) |
| **Base Unit** | Đơn vị cơ bản | Đơn vị nhỏ nhất để tính toán (g, ml, kg, lít) |
| **SKU** | Mã định danh | Stock Keeping Unit - Mã duy nhất của nguyên liệu (VD: CF-ROB-001) |
| **Min Stock** | Tồn kho tối thiểu | Mức cảnh báo khi nguyên liệu sắp hết |
| **Max Stock** | Tồn kho tối đa | Mức cảnh báo khi nguyên liệu dư thừa |
| **Default Shelf Life Days** | Hạn sử dụng mặc định | Số ngày sử dụng tiêu chuẩn của nguyên liệu |

---

### B. Lô hàng (Batch)

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **Inventory Batch** | Lô hàng trong kho | Một đợt nhập hàng cụ thể với ngày nhập và giá nhập riêng |
| **Batch Code** | Mã lô hàng | Mã định danh của lô hàng (VD: BATCH-2025-001) |
| **Current Quantity** | Số lượng hiện tại | Số lượng còn lại trong lô hàng |
| **Initial Quantity** | Số lượng ban đầu | Số lượng khi mới nhập kho |
| **Import Price Per Base Unit** | Giá nhập/đơn vị cơ bản | Giá vốn tính theo đơn vị nhỏ nhất (VD: 30đ/g) |
| **Import Date** | Ngày nhập hàng | Ngày nhập nguyên liệu vào kho |
| **Manufacture Date** | Ngày sản xuất | Ngày sản xuất của nhà cung cấp |
| **Expiry Date** | Hạn sử dụng | Ngày hết hạn sử dụng |
| **Location** | Vị trí lưu trữ | Khu vực trong kho (VD: Kệ A1, Tủ lạnh B2) |

---

### C. Đơn vị quy đổi (Unit Conversion)

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **Ingredient Unit** | Đơn vị nguyên liệu | Các đơn vị khác nhau của cùng 1 nguyên liệu |
| **Unit Name** | Tên đơn vị | Tên gọi của đơn vị (túi, gói, chai, hộp, thùng) |
| **Conversion Rate** | Tỷ lệ quy đổi | Tỷ lệ chuyển đổi sang đơn vị cơ bản (VD: 1 túi = 500g) |
| **Is Base Unit** | Là đơn vị cơ bản | Đánh dấu đơn vị cơ bản (true/false) |

---

### D. Loại hàng hóa (Đề xuất thêm)

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **PACKAGED** | Hàng đóng gói | Hàng bán theo đơn vị đóng sẵn (túi, gói, chai, hộp) |
| **BULK** | Hàng rời/cân | Hàng bán theo trọng lượng (kg, g) |
| **LIQUID** | Hàng lỏng | Hàng bán theo dung tích (lít, ml) |
| **Package Unit** | Đơn vị đóng gói | Loại bao bì (túi, gói, chai, hộp, lon, thùng, bao) |
| **Package Size** | Quy cách đóng gói | Trọng lượng/dung tích mỗi đơn vị (VD: 500g/túi) |
| **Package Size Unit** | Đơn vị quy cách | Đơn vị đo quy cách (g, ml, kg, l) |

---

## 2️⃣ THUẬT NGỮ QUẢN LÝ SẢN PHẨM

### A. Sản phẩm (Product)

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **Product** | Sản phẩm | Món đồ uống/ăn bán cho khách (Cà phê đen, Trà sữa...) |
| **Category** | Danh mục sản phẩm | Nhóm phân loại sản phẩm (Cà phê, Trà sữa, Đồ ăn vặt) |
| **Price** | Giá bán | Giá bán cho khách hàng |
| **Cost** | Giá vốn | Chi phí nguyên liệu để làm sản phẩm |
| **Description** | Mô tả | Thông tin chi tiết về sản phẩm |
| **Image URL** | Đường dẫn hình ảnh | Link ảnh sản phẩm |

---

### B. Công thức (Recipe/BOM)

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **Recipe** | Công thức | Công thức chế biến sản phẩm |
| **BOM** | Bill of Materials | Danh sách nguyên liệu cần dùng |
| **Recipe Item** | Nguyên liệu trong công thức | 1 nguyên liệu cụ thể trong công thức |
| **Quantity** | Số lượng | Lượng nguyên liệu cần dùng |
| **Unit** | Đơn vị | Đơn vị đo lường (g, ml, muỗng...) |

---

## 3️⃣ ĐỊA ĐIỂM & KHU VỰC

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **Location** | Vị trí/Khu vực | Vị trí lưu trữ trong kho |
| **Storage Area** | Khu vực lưu trữ | Khu vực cụ thể (Kệ, Tủ lạnh, Kho đông...) |

---

## 4️⃣ THUẬT NGỮ GIAO DIỆN (UI/UX)

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **Dashboard** | Bảng điều khiển | Trang tổng quan hệ thống |
| **Sidebar** | Thanh menu bên | Menu điều hướng |
| **Modal** | Hộp thoại | Cửa sổ popup để nhập/sửa dữ liệu |
| **Dropdown** | Menu thả xuống | Danh sách lựa chọn |
| **Checkbox** | Ô chọn | Nút tick chọn |
| **Toggle** | Nút chuyển đổi | Nút bật/tắt |
| **Button** | Nút bấm | Nút thực hiện hành động |
| **Table** | Bảng | Hiển thị dữ liệu dạng bảng |
| **Form** | Biểu mẫu | Form nhập liệu |
| **Input** | Ô nhập liệu | Ô để nhập dữ liệu |
| **Label** | Nhãn | Tiêu đề của ô nhập liệu |
| **Placeholder** | Gợi ý nhập | Văn bản mờ trong ô nhập (VD: "Nhập tên...") |

---

## 5️⃣ ĐƠN VỊ ĐO LƯỜNG

### A. Trọng lượng (Weight)

| Ký hiệu | Tiếng Anh | Tiếng Việt |
|---------|-----------|------------|
| **g** | gram | gam |
| **kg** | kilogram | kilôgam |
| **mg** | milligram | miligam |

### B. Dung tích (Volume)

| Ký hiệu | Tiếng Anh | Tiếng Việt |
|---------|-----------|------------|
| **ml** | milliliter | mililít |
| **l** | liter | lít |
| **cl** | centiliter | centilít |

### C. Đơn vị đóng gói (Packaging)

| Tiếng Anh | Tiếng Việt | Ví dụ |
|-----------|------------|-------|
| **Bag** | Túi | Túi cà phê 500g |
| **Pack** | Gói | Gói đường 1kg |
| **Bottle** | Chai | Chai sữa 1 lít |
| **Box** | Hộp | Hộp trà 100g |
| **Can** | Lon | Lon nước ngọt 330ml |
| **Carton** | Thùng | Thùng sữa 12 hộp |
| **Sack** | Bao | Bao cà phê 50kg |

---

## 6️⃣ TRẠNG THÁI & CẢNH BÁO

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **In Stock** | Còn hàng | Nguyên liệu còn trong kho |
| **Out of Stock** | Hết hàng | Nguyên liệu đã hết |
| **Low Stock** | Sắp hết hàng | Dưới mức tồn tối thiểu |
| **Overstock** | Dư thừa | Vượt mức tồn tối đa |
| **Expired** | Hết hạn | Đã quá hạn sử dụng |
| **Near Expiry** | Sắp hết hạn | Gần đến ngày hết hạn |

---

## 7️⃣ HÀNH ĐỘNG (Actions)

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **Create** | Tạo mới | Thêm dữ liệu mới |
| **Read/View** | Xem | Xem thông tin |
| **Update/Edit** | Cập nhật/Sửa | Chỉnh sửa dữ liệu |
| **Delete** | Xóa | Xóa dữ liệu |
| **Import** | Nhập kho | Nhập nguyên liệu vào kho |
| **Export** | Xuất kho | Xuất nguyên liệu ra khỏi kho |
| **Search** | Tìm kiếm | Tìm dữ liệu |
| **Filter** | Lọc | Lọc dữ liệu theo điều kiện |
| **Sort** | Sắp xếp | Sắp xếp dữ liệu |
| **Validate** | Kiểm tra | Kiểm tra tính hợp lệ |

---

## 8️⃣ THUẬT NGỮ KỸ THUẬT

### A. Backend (C# .NET)

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **Model** | Mô hình dữ liệu | Class đại diện cho bảng trong DB |
| **DTO** | Data Transfer Object | Đối tượng truyền dữ liệu giữa layers |
| **Repository** | Kho dữ liệu | Layer truy cập database |
| **Service** | Dịch vụ | Layer xử lý logic nghiệp vụ |
| **Controller** | Bộ điều khiển | Layer xử lý HTTP requests |
| **Migration** | Di chuyển DB | File thay đổi cấu trúc database |
| **Entity** | Thực thể | Đối tượng trong database |

### B. Frontend (React)

| Tiếng Anh | Tiếng Việt | Giải thích |
|-----------|------------|------------|
| **Component** | Thành phần | Khối UI có thể tái sử dụng |
| **Props** | Thuộc tính | Dữ liệu truyền vào component |
| **State** | Trạng thái | Dữ liệu nội bộ của component |
| **Hook** | Hook | Hàm đặc biệt của React (useState, useEffect...) |
| **API** | Giao diện lập trình | Endpoint để gọi backend |
| **Service** | Dịch vụ | File chứa các hàm gọi API |

---

## 9️⃣ CÁC CỤM TỪ THƯỜNG DÙNG

| Tiếng Anh | Tiếng Việt |
|-----------|------------|
| **Add Ingredient** | Thêm nguyên liệu |
| **Edit Ingredient** | Sửa nguyên liệu |
| **Delete Ingredient** | Xóa nguyên liệu |
| **Import Stock** | Nhập kho |
| **Export Stock** | Xuất kho |
| **Stock Level** | Mức tồn kho |
| **Total Stock** | Tổng tồn kho |
| **Unit Price** | Đơn giá |
| **Total Price** | Tổng giá |
| **Expiry Date** | Hạn sử dụng |
| **Manufacture Date** | Ngày sản xuất |
| **Import Date** | Ngày nhập |
| **Shelf Life** | Thời hạn sử dụng |
| **Storage Location** | Vị trí lưu trữ |
| **Inner Unit** | Đơn vị nhỏ bên trong |
| **Packaging Unit** | Đơn vị đóng gói |
| **Conversion Rate** | Tỷ lệ quy đổi |

---

## 🔟 GHI CHÚ QUAN TRỌNG

### Quy tắc đặt tên:
1. **Database**: PascalCase (VD: `IngredientCategory`, `InventoryBatch`)
2. **API Endpoint**: PascalCase (VD: `/Ingredient`, `/IngredientCategory`)
3. **Frontend Component**: PascalCase (VD: `ModalAddIngredient`)
4. **Frontend Service**: camelCase (VD: `getIngredientsAPI`)
5. **Props/State**: camelCase (VD: `ingredientCategoryId`)

### Phân biệt 2 loại danh mục:
- **Category** = Danh mục SẢN PHẨM (bán cho khách)
- **IngredientCategory** = Danh mục NGUYÊN LIỆU (quản lý kho)

---

## 📝 LƯU Ý KHI THÊM THUẬT NGỮ MỚI

Khi thêm tính năng mới, hãy:
1. Chọn thuật ngữ tiếng Anh chuẩn
2. Dịch sang tiếng Việt rõ ràng
3. Cập nhật vào file này
4. Đảm bảo nhất quán trong toàn bộ dự án

---

**Cập nhật lần cuối**: 10/12/2025 - 12:03
**Người cập nhật**: AI Assistant
