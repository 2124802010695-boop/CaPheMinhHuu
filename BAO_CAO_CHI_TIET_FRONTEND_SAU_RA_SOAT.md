# 🔍 BÁO CÁO CHI TIẾT FRONTEND SAU RÀ SOÁT KỸ

**Ngày:** 10/12/2025  
**Rà soát lại:** QuanLyKho.jsx + ModalAddIngredient.jsx + ModalEditIngredient.jsx  
**Trạng thái:** 🔴 **CRITICAL - Không đồng bộ hoàn toàn với Backend mới**

---

## 📋 TÓM TẮT PHÁT HIỆN

Sau khi đọc kỹ code, tôi phát hiện:

### **QuanLyKho.jsx:**
- ✅ **ĐÃ SỬA MỘT PHẦN:** Dòng 143, 151, 156, 165 đã được cập nhật
- ❌ **VẪN CÒN LỖI:** Dòng 172-190, 232, 238, 244 vẫn đọc trường cũ
- ⚠️ **LOGIC SAI:** Hàm `checkExpiry()` vẫn nhận `expiryDate` thay vì `batches`

### **ModalAddIngredient.jsx:**
- 🔴 **HOÀN TOÀN SAI:** Gửi cấu trúc DTO CŨ, không khớp với Backend MỚI
- ❌ Không gửi `sku`, `minStock`, `maxStock`, `defaultShelfLifeDays`
- ❌ Không gửi `units[]` array
- ❌ Không gửi `initialBatch{}` object

### **ModalEditIngredient.jsx:**
- 🔴 **HOÀN TOÀN SAI:** Đọc và gửi cấu trúc DTO CŨ
- ❌ Đọc `ingredient.unit`, `ingredient.stockQuantity`, `ingredient.costPrice` (đã xóa)
- ❌ Không đọc `ingredient.baseUnit`, `ingredient.currentStock`, `ingredient.batches`

---

## 🔴 PHẦN 1: QuanLyKho.jsx - CHI TIẾT LỖI

### **✅ ĐÃ SỬA ĐÚNG (4 chỗ):**

```jsx
// Dòng 143: ✅ ĐÚNG
<Chip label={row.currentStock} />

// Dòng 151: ✅ ĐÚNG
<TableCell>{row.baseUnit}</TableCell>

// Dòng 156: ✅ ĐÚNG
{row.batches?.[0]?.importPricePerBaseUnit?.toLocaleString() || '0'} đ/{row.baseUnit}

// Dòng 165: ✅ ĐÚNG
{formatDate(row.batches?.[0]?.importDate)}
```

---

### **❌ VẪN CÒN LỖI (4 chỗ):**

#### **Lỗi 1: Dòng 172-190 - Kiểm tra HSD**
```jsx
// SAI (đọc row.expiryDate - đã xóa):
{row.expiryDate ? (
    <Tooltip title={
        checkExpiry(row.expiryDate) === 'error'
            ? 'Đã hết hạn!'
            : checkExpiry(row.expiryDate) === 'warning'
                ? 'Sắp hết hạn (< 7 ngày)'
                : 'Còn hạn sử dụng'
    }>
        <Chip
            icon={checkExpiry(row.expiryDate) !== 'success' ? <WarningIcon /> : undefined}
            label={formatDate(row.expiryDate)}
            color={checkExpiry(row.expiryDate)}
            size="small"
            variant={checkExpiry(row.expiryDate) === 'error' ? 'filled' : 'outlined'}
        />
    </Tooltip>
) : (
    <Typography variant="caption" color="text.secondary">-</Typography>
)}

// ĐÚNG (đọc từ batches):
{row.batches && row.batches.length > 0 && row.batches[0].expiryDate ? (
    <Tooltip title={
        checkExpiry(row.batches[0].expiryDate) === 'error'
            ? 'Đã hết hạn!'
            : checkExpiry(row.batches[0].expiryDate) === 'warning'
                ? 'Sắp hết hạn (< 7 ngày)'
                : 'Còn hạn sử dụng'
    }>
        <Chip
            icon={checkExpiry(row.batches[0].expiryDate) !== 'success' ? <WarningIcon /> : undefined}
            label={formatDate(row.batches[0].expiryDate)}
            color={checkExpiry(row.batches[0].expiryDate)}
            size="small"
            variant={checkExpiry(row.batches[0].expiryDate) === 'error' ? 'filled' : 'outlined'}
        />
    </Tooltip>
) : (
    <Typography variant="caption" color="text.secondary">-</Typography>
)}
```

---

#### **Lỗi 2: Dòng 232 - Thống kê sắp hết hạn**
```jsx
// SAI:
{ingredients.filter(i => checkExpiry(i.expiryDate) === 'warning').length}

// ĐÚNG:
{ingredients.filter(i => 
    i.batches && i.batches.length > 0 && 
    i.batches[0].expiryDate &&
    checkExpiry(i.batches[0].expiryDate) === 'warning'
).length}
```

---

#### **Lỗi 3: Dòng 238 - Thống kê đã hết hạn**
```jsx
// SAI:
{ingredients.filter(i => checkExpiry(i.expiryDate) === 'error').length}

// ĐÚNG:
{ingredients.filter(i => 
    i.batches && i.batches.length > 0 && 
    i.batches[0].expiryDate &&
    checkExpiry(i.batches[0].expiryDate) === 'error'
).length}
```

---

#### **Lỗi 4: Dòng 244 - Thống kê tồn kho thấp**
```jsx
// SAI:
{ingredients.filter(i => i.stockQuantity < 5).length}

// ĐÚNG:
{ingredients.filter(i => i.currentStock < i.minStock).length}
```

---

## 🔴 PHẦN 2: ModalAddIngredient.jsx - SAI HOÀN TOÀN

### **Cấu trúc DTO Backend MỚI yêu cầu:**

```typescript
// IngredientCreateDto (Backend mới)
{
    // Master Data
    "name": "Cà phê Robusta",
    "sku": "CF-ROB-001",                    // ✅ BẮT BUỘC (nullable)
    "baseUnit": "g",                        // ✅ BẮT BUỘC
    "ingredientCategoryId": 1,              // ✅ BẮT BUỘC
    "minStock": 500,                        // ✅ BẮT BUỘC
    "maxStock": 5000,                       // ✅ BẮT BUỘC
    "defaultShelfLifeDays": 180,            // ✅ BẮT BUỘC
    
    // Units (Optional)
    "units": [                              // ✅ Array of IngredientUnitCreateDto
        {
            "unitName": "kg",
            "conversionRate": 1000,
            "isBaseUnit": false
        },
        {
            "unitName": "bao",
            "conversionRate": 5000,
            "isBaseUnit": false
        }
    ],
    
    // Initial Batch (Optional)
    "initialBatch": {                       // ✅ InventoryBatchCreateDto
        "batchCode": null,                  // Auto-generate
        "quantity": 10000,                  // Số lượng nhập (theo baseUnit)
        "importPricePerBaseUnit": 0.5,      // Giá/đơn vị cơ bản
        "importDate": "2025-12-10",
        "manufactureDate": null,
        "expiryDate": "2026-06-10",
        "locationId": null
    }
}
```

---

### **Cấu trúc DTO Frontend HIỆN TẠI (SAI):**

```jsx
// Dòng 93-105: SAI HOÀN TOÀN
await createIngredientAPI({
    name: formValues.name,
    ingredientCategoryId: Number(formValues.ingredientCategoryId),
    unit: formValues.baseUnit,              // ❌ SAI - Backend không nhận "unit"
    stockQuantity: totalStock,              // ❌ SAI - Backend không nhận "stockQuantity"
    costPrice: Number(formValues.costPricePerUnit) || 0,  // ❌ SAI - Backend không nhận "costPrice"
    importDate: formValues.importDate,      // ❌ SAI - Backend không nhận "importDate"
    expiryDate: formValues.expiryDate ? formValues.expiryDate : null,  // ❌ SAI
    packagingUnit: formValues.packagingUnit,  // ❌ SAI - Backend không nhận "packagingUnit"
    quantityPerUnit: Number(formValues.capacity)  // ❌ SAI - Backend không nhận "quantityPerUnit"
});
```

---

### **Cấu trúc ĐÚNG cần sửa:**

```jsx
await createIngredientAPI({
    // Master Data
    name: formValues.name,
    sku: null,  // Hoặc tự động generate từ name
    baseUnit: formValues.baseUnit,  // ✅ ĐÚNG
    ingredientCategoryId: Number(formValues.ingredientCategoryId),
    minStock: 0,  // Hoặc cho user nhập
    maxStock: 0,  // Hoặc cho user nhập
    defaultShelfLifeDays: 180,  // Mặc định 6 tháng
    
    // Units (Optional - nếu có đơn vị quy đổi)
    units: [
        {
            unitName: formValues.packagingUnit,  // "hop", "thung", "bao"
            conversionRate: Number(formValues.capacity),  // 500, 5000...
            isBaseUnit: false
        }
    ],
    
    // Initial Batch (Optional - nếu nhập luôn)
    initialBatch: {
        batchCode: null,  // Auto-generate
        quantity: Number(formValues.importQuantity) * Number(formValues.capacity),  // Tổng số lượng theo baseUnit
        importPricePerBaseUnit: Number(formValues.costPricePerUnit) / Number(formValues.capacity),  // Giá/g hoặc /ml
        importDate: formValues.importDate,
        manufactureDate: null,
        expiryDate: formValues.expiryDate || null,
        locationId: null
    }
});
```

---

## 🔴 PHẦN 3: ModalEditIngredient.jsx - SAI HOÀN TOÀN

### **Đọc dữ liệu SAI (Dòng 44-54):**

```jsx
// SAI:
setFormValues({
    name: ingredient.name || '',
    unit: ingredient.unit || '',                    // ❌ ingredient.unit = undefined
    stockQuantity: ingredient.stockQuantity || 0,   // ❌ ingredient.stockQuantity = undefined
    costPrice: ingredient.costPrice || 0,           // ❌ ingredient.costPrice = undefined
    ingredientCategoryId: ingredient.ingredientCategoryId || '',
    importDate: ingredient.importDate ? ingredient.importDate.split('T')[0] : '',  // ❌ undefined
    expiryDate: ingredient.expiryDate ? ingredient.expiryDate.split('T')[0] : '',  // ❌ undefined
    packagingUnit: ingredient.packagingUnit || '',  // ❌ undefined
    quantityPerUnit: ingredient.quantityPerUnit || 0  // ❌ undefined
});

// ĐÚNG:
setFormValues({
    name: ingredient.name || '',
    baseUnit: ingredient.baseUnit || '',  // ✅ ĐÚNG
    currentStock: ingredient.currentStock || 0,  // ✅ ĐÚNG
    sku: ingredient.sku || '',  // ✅ ĐÚNG
    minStock: ingredient.minStock || 0,  // ✅ ĐÚNG
    maxStock: ingredient.maxStock || 0,  // ✅ ĐÚNG
    defaultShelfLifeDays: ingredient.defaultShelfLifeDays || 180,  // ✅ ĐÚNG
    ingredientCategoryId: ingredient.ingredientCategoryId || '',
    
    // Lấy từ batch đầu tiên (nếu có)
    importDate: ingredient.batches?.[0]?.importDate 
        ? ingredient.batches[0].importDate.split('T')[0] 
        : '',
    expiryDate: ingredient.batches?.[0]?.expiryDate 
        ? ingredient.batches[0].expiryDate.split('T')[0] 
        : '',
    importPricePerBaseUnit: ingredient.batches?.[0]?.importPricePerBaseUnit || 0,
    
    // Lấy từ units (nếu có)
    units: ingredient.units || []
});
```

---

### **Gửi dữ liệu SAI (Dòng 69-79):**

```jsx
// SAI:
await updateIngredientAPI(ingredient.id, {
    name: formValues.name,
    unit: formValues.unit,  // ❌ Backend không nhận
    stockQuantity: Number(formValues.stockQuantity),  // ❌ Backend không nhận
    costPrice: Number(formValues.costPrice),  // ❌ Backend không nhận
    ingredientCategoryId: Number(formValues.ingredientCategoryId),
    importDate: formValues.importDate || null,  // ❌ Backend không nhận
    expiryDate: formValues.expiryDate || null,  // ❌ Backend không nhận
    packagingUnit: formValues.packagingUnit || null,  // ❌ Backend không nhận
    quantityPerUnit: Number(formValues.quantityPerUnit) || null  // ❌ Backend không nhận
});

// ĐÚNG (IngredientUpdateDto):
await updateIngredientAPI(ingredient.id, {
    name: formValues.name,
    sku: formValues.sku,
    baseUnit: formValues.baseUnit,  // ✅ ĐÚNG
    ingredientCategoryId: Number(formValues.ingredientCategoryId),
    minStock: Number(formValues.minStock),
    maxStock: Number(formValues.maxStock),
    defaultShelfLifeDays: Number(formValues.defaultShelfLifeDays)
    
    // ⚠️ LƯU Ý: Backend chỉ update Master Data
    // Không update Units và Batches qua API này
});
```

---

## 📊 BẢNG TỔNG HỢP LỖI

| File | Dòng | Loại lỗi | Mức độ | Mô tả |
|------|------|----------|--------|-------|
| **QuanLyKho.jsx** | 172-190 | Đọc trường cũ | 🔴 CRITICAL | `row.expiryDate` → `row.batches[0].expiryDate` |
| **QuanLyKho.jsx** | 232 | Đọc trường cũ | 🔴 CRITICAL | `i.expiryDate` → `i.batches[0].expiryDate` |
| **QuanLyKho.jsx** | 238 | Đọc trường cũ | 🔴 CRITICAL | `i.expiryDate` → `i.batches[0].expiryDate` |
| **QuanLyKho.jsx** | 244 | Đọc trường cũ | 🔴 CRITICAL | `i.stockQuantity` → `i.currentStock < i.minStock` |
| **ModalAddIngredient.jsx** | 93-105 | Gửi DTO sai | 🔴 CRITICAL | Gửi cấu trúc cũ, Backend không nhận |
| **ModalEditIngredient.jsx** | 44-54 | Đọc trường cũ | 🔴 CRITICAL | Đọc `unit`, `stockQuantity`, `costPrice` (undefined) |
| **ModalEditIngredient.jsx** | 69-79 | Gửi DTO sai | 🔴 CRITICAL | Gửi cấu trúc cũ, Backend không nhận |

---

## ✅ CHECKLIST SỬA LỖI ĐẦY ĐỦ

### **QuanLyKho.jsx:**
- [ ] Dòng 172-190: Sửa `row.expiryDate` → `row.batches[0].expiryDate`
- [ ] Dòng 232: Sửa filter sắp hết hạn
- [ ] Dòng 238: Sửa filter đã hết hạn
- [ ] Dòng 244: Sửa `i.stockQuantity < 5` → `i.currentStock < i.minStock`

### **ModalAddIngredient.jsx:**
- [ ] Dòng 23-37: Thêm fields: `sku`, `minStock`, `maxStock`, `defaultShelfLifeDays`
- [ ] Dòng 93-105: Sửa toàn bộ cấu trúc gửi API theo DTO mới
- [ ] Thêm UI cho user nhập `minStock`, `maxStock` (optional)
- [ ] Tính toán `importPricePerBaseUnit` = `costPricePerUnit / capacity`

### **ModalEditIngredient.jsx:**
- [ ] Dòng 18-28: Sửa formValues theo cấu trúc mới
- [ ] Dòng 44-54: Sửa đọc dữ liệu từ `ingredient` (baseUnit, currentStock, batches...)
- [ ] Dòng 69-79: Sửa gửi API theo `IngredientUpdateDto` mới
- [ ] Cân nhắc: Có cho phép edit Batches không? (Nếu có thì cần API riêng)

---

## 🎯 ƯU TIÊN SỬA

### **Ưu tiên 1 (NGAY LẬP TỨC):**
1. **QuanLyKho.jsx** - Dòng 244: Sửa tồn kho thấp (đang crash)
2. **QuanLyKho.jsx** - Dòng 172-190: Sửa hiển thị HSD
3. **QuanLyKho.jsx** - Dòng 232, 238: Sửa thống kê

### **Ưu tiên 2 (TRONG NGÀY):**
4. **ModalAddIngredient.jsx** - Sửa toàn bộ DTO gửi lên Backend
5. **ModalEditIngredient.jsx** - Sửa toàn bộ DTO đọc và gửi

### **Ưu tiên 3 (TUẦN SAU):**
6. Thêm UI hiển thị Units (đơn vị quy đổi)
7. Thêm UI hiển thị Batches (lô hàng)
8. Thêm chức năng nhập lô mới (không tạo ingredient mới)

---

## 📝 KẾT LUẬN

**Trạng thái:** 🔴 **CRITICAL**

**Vấn đề chính:**
1. QuanLyKho.jsx: ✅ Đã sửa 50% → ❌ Còn 50% chưa sửa
2. ModalAddIngredient.jsx: ❌ Sai hoàn toàn (0% đúng)
3. ModalEditIngredient.jsx: ❌ Sai hoàn toàn (0% đúng)

**Nguyên nhân:**
- Backend đã thay đổi cấu trúc sau migration
- Frontend chỉ sửa một phần, chưa đồng bộ hoàn toàn

**Thời gian sửa dự kiến:**
- QuanLyKho.jsx: 30 phút
- ModalAddIngredient.jsx: 1 giờ
- ModalEditIngredient.jsx: 1 giờ
- **Tổng:** ~2.5 giờ

---

**Người thực hiện:** AI Assistant  
**Ngày:** 10/12/2025  
**Phiên bản:** 2.0 - Sau rà soát kỹ
