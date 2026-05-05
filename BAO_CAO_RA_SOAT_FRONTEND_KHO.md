# 🔍 BÁO CÁO RÀ SOÁT FRONTEND - QUẢN LÝ KHO

**Ngày:** 10/12/2025  
**Phân tích từ:** 2 hình lỗi console + code frontend  
**Trạng thái:** ⚠️ **CẦN SỬA - Không đồng bộ với Backend mới**

---

## 📸 PHÂN TÍCH 2 HÌNH LỖI

### **Hình 1: Trang trắng (localhost:5173/admin/quanlykho)**
- ❌ Trang hiển thị trắng hoàn toàn
- ❌ Không có nội dung nào render

### **Hình 2: Console Error**
```
Uncaught TypeError: Cannot read properties of undefined (reading 'toLocaleString')
at QuanLyKho.jsx:156:38
```

**Dòng 156 trong QuanLyKho.jsx:**
```jsx
{row.costPrice.toLocaleString()} đ
```

**Nguyên nhân:**
- ❌ `row.costPrice` là `undefined`
- ❌ Backend mới đã **XÓA** trường `costPrice` khỏi `Ingredients`
- ❌ Frontend vẫn đang cố đọc trường này → **CRASH**

---

## 🔍 PHÂN TÍCH CHI TIẾT

### **1. Cấu trúc dữ liệu Backend MỚI (sau migration)**

```csharp
// IngredientViewDto (Backend trả về)
{
    "id": 1,
    "name": "Cà phê Robusta",
    "baseUnit": "g",                    // ✅ MỚI (đổi từ "unit")
    "sku": "CF-ROB-001",                // ✅ MỚI (đổi từ "packagingUnit")
    "ingredientCategoryId": 1,
    "categoryName": "Cafe",
    "minStock": 500,                    // ✅ MỚI
    "maxStock": 5000,                   // ✅ MỚI
    "defaultShelfLifeDays": 180,        // ✅ MỚI
    "currentStock": 10000,              // ✅ MỚI (tính từ Batches)
    "stockStatus": "OK",                // ✅ MỚI
    
    // ❌ ĐÃ XÓA:
    // "unit": "g",                     // → baseUnit
    // "stockQuantity": 10000,          // → currentStock
    // "costPrice": 500000,             // → Chuyển sang Batches
    // "importDate": "2025-12-10",      // → Chuyển sang Batches
    // "expiryDate": "2026-06-10",      // → Chuyển sang Batches
    // "packagingUnit": "Bao",          // → sku
    // "quantityPerUnit": 5000,         // → Chuyển sang Units
    
    "units": [                          // ✅ MỚI - Mảng đơn vị quy đổi
        {
            "id": 1,
            "unitName": "g",
            "conversionRate": 1,
            "isBaseUnit": true
        },
        {
            "id": 2,
            "unitName": "kg",
            "conversionRate": 1000,
            "isBaseUnit": false
        }
    ],
    
    "batches": [                        // ✅ MỚI - Mảng lô hàng
        {
            "id": 1,
            "batchCode": "BATCH-0001-20251210",
            "currentQuantity": 10000,
            "initialQuantity": 10000,
            "importPricePerBaseUnit": 0.5,  // ✅ Giá nhập/đơn vị cơ bản
            "importDate": "2025-12-10",
            "expiryDate": "2026-06-10",
            "daysUntilExpiry": 182,
            "expiryStatus": "Fresh"
        }
    ]
}
```

---

### **2. Code Frontend HIỆN TẠI (QuanLyKho.jsx)**

#### **❌ VẤN ĐỀ 1: Đọc trường đã bị xóa**

```jsx
// Dòng 143: stockQuantity → ĐÃ XÓA
<Chip
    label={row.stockQuantity}           // ❌ UNDEFINED
    color={row.stockQuantity < 5 ? "error" : "success"}
/>

// Dòng 151: unit → ĐÃ XÓA (đổi thành baseUnit)
<TableCell>{row.unit}</TableCell>       // ❌ UNDEFINED

// Dòng 156: costPrice → ĐÃ XÓA
<Typography>
    {row.costPrice.toLocaleString()} đ  // ❌ CRASH!
</Typography>

// Dòng 165: importDate → ĐÃ XÓA (chuyển sang Batches)
{formatDate(row.importDate)}            // ❌ UNDEFINED

// Dòng 182: expiryDate → ĐÃ XÓA (chuyển sang Batches)
{formatDate(row.expiryDate)}            // ❌ UNDEFINED

// Dòng 244: stockQuantity → ĐÃ XÓA
{ingredients.filter(i => i.stockQuantity < 5).length}  // ❌ UNDEFINED
```

---

#### **❌ VẤN ĐỀ 2: Không hiển thị dữ liệu mới**

```jsx
// ✅ CẦN THÊM: Hiển thị Units (đơn vị quy đổi)
// Ví dụ: g, kg, bao

// ✅ CẦN THÊM: Hiển thị Batches (lô hàng)
// Ví dụ: Lô 1: 5000g, Lô 2: 5000g

// ✅ CẦN THÊM: Hiển thị SKU
// Ví dụ: CF-ROB-001

// ✅ CẦN THÊM: Hiển thị MinStock/MaxStock
// Ví dụ: 500 - 5000g
```

---

## 🔧 DANH SÁCH CÁC LỖI CẦN SỬA

### **Lỗi CRITICAL (Gây crash):**

| Dòng | Code hiện tại | Vấn đề | Sửa thành |
|------|---------------|--------|-----------|
| 143 | `row.stockQuantity` | ❌ Undefined | `row.currentStock` |
| 151 | `row.unit` | ❌ Undefined | `row.baseUnit` |
| 156 | `row.costPrice.toLocaleString()` | ❌ **CRASH** | Tính từ `row.batches` |
| 165 | `row.importDate` | ❌ Undefined | Lấy từ `row.batches[0]?.importDate` |
| 182 | `row.expiryDate` | ❌ Undefined | Lấy từ `row.batches[0]?.expiryDate` |
| 244 | `i.stockQuantity < 5` | ❌ Undefined | `i.currentStock < i.minStock` |

---

### **Lỗi WARNING (Không crash nhưng hiển thị sai):**

| Vấn đề | Mô tả |
|--------|-------|
| Không hiển thị SKU | Backend có `sku` nhưng frontend không hiển thị |
| Không hiển thị Units | Backend có `units[]` nhưng frontend không hiển thị |
| Không hiển thị Batches | Backend có `batches[]` nhưng frontend không hiển thị |
| Không hiển thị MinStock/MaxStock | Backend có nhưng frontend không dùng |
| Không hiển thị StockStatus | Backend có `stockStatus` nhưng frontend tự tính |

---

## 📊 BẢNG ĐỐI CHIẾU TRƯỜNG DỮ LIỆU

| Trường Frontend (Cũ) | Trường Backend (Mới) | Trạng thái | Cách sửa |
|----------------------|---------------------|------------|----------|
| `row.stockQuantity` | `row.currentStock` | ⚠️ Đổi tên | Đổi tên biến |
| `row.unit` | `row.baseUnit` | ⚠️ Đổi tên | Đổi tên biến |
| `row.costPrice` | `row.batches[0]?.importPricePerBaseUnit` | 🔴 Cấu trúc khác | Tính lại logic |
| `row.importDate` | `row.batches[0]?.importDate` | 🔴 Chuyển sang mảng | Lấy từ batch đầu tiên |
| `row.expiryDate` | `row.batches[0]?.expiryDate` | 🔴 Chuyển sang mảng | Lấy từ batch đầu tiên |
| `row.packagingUnit` | `row.sku` | ⚠️ Đổi tên | Đổi tên biến |
| `row.quantityPerUnit` | `row.units[1]?.conversionRate` | 🔴 Chuyển sang mảng | Lấy từ units |
| ❌ Không có | `row.minStock` | ✅ Mới | Thêm hiển thị |
| ❌ Không có | `row.maxStock` | ✅ Mới | Thêm hiển thị |
| ❌ Không có | `row.stockStatus` | ✅ Mới | Thêm hiển thị |
| ❌ Không có | `row.units[]` | ✅ Mới | Thêm hiển thị |
| ❌ Không có | `row.batches[]` | ✅ Mới | Thêm hiển thị |

---

## 🛠️ HƯỚNG DẪN SỬA LỖI

### **Sửa 1: Đổi tên trường đơn giản**

```jsx
// TRƯỚC (SAI):
<Chip label={row.stockQuantity} />
<TableCell>{row.unit}</TableCell>

// SAU (ĐÚNG):
<Chip label={row.currentStock} />
<TableCell>{row.baseUnit}</TableCell>
```

---

### **Sửa 2: Tính giá vốn từ Batches**

```jsx
// TRƯỚC (SAI):
<Typography>
    {row.costPrice.toLocaleString()} đ  // ❌ CRASH
</Typography>

// SAU (ĐÚNG - Option 1: Giá vốn trung bình):
<Typography>
    {row.batches && row.batches.length > 0
        ? (row.batches.reduce((sum, b) => sum + (b.importPricePerBaseUnit * b.currentQuantity), 0) 
           / row.currentStock).toLocaleString()
        : '0'
    } đ/{row.baseUnit}
</Typography>

// SAU (ĐÚNG - Option 2: Giá lô gần nhất):
<Typography>
    {row.batches && row.batches.length > 0
        ? row.batches[0].importPricePerBaseUnit.toLocaleString()
        : '0'
    } đ/{row.baseUnit}
</Typography>
```

---

### **Sửa 3: Lấy ngày nhập/HSD từ Batch đầu tiên**

```jsx
// TRƯỚC (SAI):
{formatDate(row.importDate)}
{formatDate(row.expiryDate)}

// SAU (ĐÚNG):
{formatDate(row.batches?.[0]?.importDate)}
{formatDate(row.batches?.[0]?.expiryDate)}
```

---

### **Sửa 4: Kiểm tra tồn kho thấp**

```jsx
// TRƯỚC (SAI):
{ingredients.filter(i => i.stockQuantity < 5).length}

// SAU (ĐÚNG):
{ingredients.filter(i => i.currentStock < i.minStock).length}
```

---

### **Sửa 5: Kiểm tra HSD từ Batches**

```jsx
// TRƯỚC (SAI):
const checkExpiry = (expiryDate) => {
    if (!expiryDate) return 'default';
    // ...
}

// SAU (ĐÚNG):
const checkExpiry = (batches) => {
    if (!batches || batches.length === 0) return 'default';
    
    // Lấy batch sắp hết hạn nhất
    const nearestExpiry = batches
        .filter(b => b.expiryDate)
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0];
    
    if (!nearestExpiry) return 'default';
    
    const today = new Date();
    const expiry = new Date(nearestExpiry.expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'error';
    if (daysLeft <= 7) return 'warning';
    return 'success';
}

// Sử dụng:
checkExpiry(row.batches)
```

---

## 📋 CHECKLIST SỬA LỖI

### **CRITICAL (Phải sửa ngay):**
- [ ] Dòng 143: `row.stockQuantity` → `row.currentStock`
- [ ] Dòng 151: `row.unit` → `row.baseUnit`
- [ ] Dòng 156: `row.costPrice` → Tính từ `row.batches`
- [ ] Dòng 165: `row.importDate` → `row.batches?.[0]?.importDate`
- [ ] Dòng 182: `row.expiryDate` → `row.batches?.[0]?.expiryDate`
- [ ] Dòng 244: `i.stockQuantity < 5` → `i.currentStock < i.minStock`
- [ ] Dòng 61-70: Hàm `checkExpiry()` → Nhận `batches` thay vì `expiryDate`
- [ ] Dòng 125, 173-187: Gọi `checkExpiry(row.batches)` thay vì `checkExpiry(row.expiryDate)`

### **OPTIONAL (Nên thêm):**
- [ ] Hiển thị SKU (`row.sku`)
- [ ] Hiển thị danh sách Units (`row.units`)
- [ ] Hiển thị danh sách Batches (`row.batches`)
- [ ] Hiển thị MinStock/MaxStock
- [ ] Hiển thị StockStatus
- [ ] Thêm cột "Số lô hàng"
- [ ] Thêm tooltip hiển thị chi tiết lô hàng

---

## 🎯 ĐỀ XUẤT CẤU TRÚC BẢNG MỚI

### **Bảng cơ bản (Hiện tại):**
```
| ID | Tên | Tồn Kho | Đơn Vị | Giá Vốn | Ngày Nhập | HSD | Ngày Tạo | Hành động |
```

### **Bảng nâng cao (Đề xuất):**
```
| ID | SKU | Tên | Nhóm | Tồn Kho | Min-Max | Đơn Vị | Số Lô | Giá TB | HSD Gần Nhất | Hành động |
```

**Chi tiết:**
- **SKU:** Mã nguyên liệu (CF-ROB-001)
- **Nhóm:** Tên category (Cafe, Siro...)
- **Tồn Kho:** `currentStock` với màu theo `stockStatus`
- **Min-Max:** `500 - 5000g` (cảnh báo nếu < min hoặc > max)
- **Đơn Vị:** `baseUnit` (g, ml, cái)
- **Số Lô:** Số lượng batches (có tooltip hiển thị chi tiết)
- **Giá TB:** Giá vốn trung bình từ tất cả lô
- **HSD Gần Nhất:** HSD của lô sắp hết hạn nhất

---

## 🔍 KIỂM TRA MODAL (ModalAddIngredient, ModalEditIngredient)

### **Cần kiểm tra:**
1. ✅ Modal có gửi đúng cấu trúc DTO mới không?
2. ✅ Modal có nhập được Units không?
3. ✅ Modal có nhập được Batch đầu tiên không?
4. ✅ Modal có hiển thị SKU, MinStock, MaxStock không?

**Sẽ kiểm tra trong báo cáo tiếp theo nếu cần.**

---

## 📊 TỔNG KẾT

### **Trạng thái hiện tại:**
- 🔴 **CRITICAL:** Frontend crash do đọc trường đã xóa
- ⚠️ **WARNING:** Không hiển thị dữ liệu mới (Units, Batches, SKU...)
- ❌ **KHÔNG ĐỒNG BỘ:** Frontend cũ vs Backend mới

### **Mức độ nghiêm trọng:**
- **Crash:** 🔴 CRITICAL (6 lỗi)
- **Hiển thị sai:** ⚠️ WARNING (5 vấn đề)
- **Thiếu tính năng:** 🟡 MEDIUM (7 tính năng)

### **Thời gian sửa dự kiến:**
- **Sửa crash:** 30 phút
- **Sửa hiển thị:** 1 giờ
- **Thêm tính năng mới:** 2-3 giờ

### **Ưu tiên:**
1. **Ngay lập tức:** Sửa 6 lỗi CRITICAL để trang không crash
2. **Trong ngày:** Sửa hiển thị sai
3. **Tuần sau:** Thêm tính năng mới (Units, Batches...)

---

## 📝 KẾT LUẬN

**Frontend KHÔNG ĐỒNG BỘ với Backend sau migration!**

**Nguyên nhân:**
- Backend đã thay đổi cấu trúc dữ liệu (xóa trường cũ, thêm trường mới)
- Frontend vẫn đọc trường cũ → Crash

**Giải pháp:**
- Cập nhật frontend để đọc đúng trường mới
- Thêm logic xử lý Batches và Units
- Cải thiện UX với thông tin chi tiết hơn

**Không sửa vội, cần:**
1. Review kỹ code
2. Test từng thay đổi
3. Đảm bảo không phá vỡ tính năng khác

---

**Người thực hiện:** AI Assistant  
**Ngày:** 10/12/2025  
**Phiên bản:** 1.0
