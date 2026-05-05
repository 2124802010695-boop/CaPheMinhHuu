# 📊 BÁO CÁO RÀ SOÁT CẤU TRÚC KHO & NGHIỆP VỤ F&B

**Ngày thực hiện:** 10/12/2025  
**Người thực hiện:** AI Assistant  
**Mục đích:** Rà soát cấu trúc kho mới, đánh giá khả năng làm việc, và đối chiếu với nghiệp vụ F&B chuẩn

---

## 📸 PHÂN TÍCH 4 HÌNH SQL QUERY

### **Hình 1: Danh sách bảng trong Database**
```sql
SELECT t.NAME AS TableName, s.Name AS SchemaName
FROM sys.tables t
JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE t.NAME NOT LIKE '__EFMigrationsHistory'
ORDER BY t.NAME;
```

**Kết quả:**
| TableName | SchemaName |
|-----------|------------|
| Categories | dbo |
| IngredientCategories | dbo |
| Ingredients | dbo |
| OrderItems | dbo |
| Orders | dbo |
| Products | dbo |
| Recipes | dbo |
| Users | dbo |

**✅ Đánh giá:**
- Có đầy đủ bảng nghiệp vụ F&B cơ bản
- **⚠️ THIẾU:** Bảng `IngredientUnits` và `InventoryBatches` không xuất hiện
- **⚠️ THIẾU:** Bảng `Suppliers` (Nhà cung cấp)
- **⚠️ THIẾU:** Bảng `PurchaseOrders` (Phiếu nhập kho)
- **⚠️ THIẾU:** Bảng `StockMovements` (Lịch sử xuất nhập)

---

### **Hình 2: Migration History**
```sql
SELECT TOP 5 MigrationId, ProductVersion
FROM __EFMigrationsHistory
ORDER BY MigrationId DESC;
```

**Kết quả:**
| MigrationId | ProductVersion |
|-------------|----------------|
| 20251203031057_AddPackagingInfo | 8.0.22 |
| 20251112801850_AddDateToIngredient | 8.0.22 |
| 20251128032642_UpdateLogicKho | 8.0.22 |
| 20251125064420_AddIngredientGroup | 8.0.22 |
| 20251124081114_ConfigBOMAndAudit | 8.0.22 |

**✅ Đánh giá:**
- Migration gần nhất: `AddPackagingInfo` (03/12/2025)
- Có migration về `IngredientGroup` và `UpdateLogicKho`
- **⚠️ VẤN ĐỀ:** Không thấy migration tạo `IngredientUnits` và `InventoryBatches`

---

### **Hình 3: Foreign Keys**
```sql
SELECT 
    OBJECT_NAME(f.parent_object_id) AS TableName,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
    OBJECT_NAME(f.referenced_object_id) AS ReferenceTableName,
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ForeignKeyName,
    f.delete_referential_action_desc AS DeleteAction
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc ON f.OBJECT_ID = fc.constraint_object_id
ORDER BY TableName;
```

**Kết quả:**
| TableName | ColumnName | ReferenceTableName | ForeignKeyName | DeleteAction |
|-----------|------------|-------------------|----------------|--------------|
| Ingredients | IngredientCategoryId | IngredientCategories | FK_Ingredients_IngredientCategories_IngredientCategoryId | NO_ACTION |
| OrderItems | ProductId | Products | FK_OrderItems_Products_ProductId | CASCADE |
| OrderItems | OrderId | Orders | FK_OrderItems_Orders_OrderId | CASCADE |
| Orders | UserId | Users | FK_Orders_Users_UserId | NO_ACTION |
| Products | CategoryId | Categories | FK_Products_Categories_CategoryId | SET_NULL |
| Recipes | IngredientId | Ingredients | FK_Recipes_Ingredients_IngredientId | NO_ACTION |
| Recipes | ProductId | Products | FK_Recipes_Products_ProductId | CASCADE |

**✅ Đánh giá:**
- Quan hệ cơ bản đã đúng
- **⚠️ THIẾU:** FK từ `IngredientUnits` → `Ingredients`
- **⚠️ THIẾU:** FK từ `InventoryBatches` → `Ingredients`
- **⚠️ VẤN ĐỀ:** `Ingredients.IngredientCategoryId` có `NO_ACTION` → Nên là `SET_NULL`

---

### **Hình 4: Cột đặc biệt trong các bảng**
```sql
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME IN ('BaseUnit', 'Unit', 'Description', 'IsDeleted')
AND TABLE_NAME IN ('Ingredients', 'Recipes', 'IngredientCategories', 'InventoryBatches')
ORDER BY TABLE_NAME, COLUMN_NAME;
```

**Kết quả:**
| TABLE_NAME | COLUMN_NAME | DATA_TYPE | IS_NULLABLE |
|------------|-------------|-----------|-------------|
| IngredientCategories | Description | nvarchar | YES |
| IngredientCategories | IsDeleted | bit | NO |
| Ingredients | IsDeleted | bit | NO |
| Ingredients | Unit | nvarchar | NO |
| Recipes | IsDeleted | bit | NO |

**✅ Đánh giá:**
- Có `IsDeleted` (Soft Delete) ✅
- **⚠️ VẤN ĐỀ:** `Ingredients.Unit` tồn tại → Trùng với `BaseUnit` trong code
- **⚠️ THIẾU:** Không thấy `InventoryBatches` trong kết quả

---

## 🏗️ CẤU TRÚC KHO HIỆN TẠI (THEO CODE)

### **1. Models (Entity Framework)**

#### **1.1. Ingredient (Nguyên liệu - Master Data)**
```csharp
public class Ingredient : BaseEntity
{
    public string Name { get; set; }              // Tên nguyên liệu
    public string? SKU { get; set; }              // Mã SKU
    public string BaseUnit { get; set; }          // Đơn vị cơ bản (g, ml, cái)
    public int IngredientCategoryId { get; set; } // Nhóm nguyên liệu
    public decimal MinStock { get; set; }         // Tồn tối thiểu
    public decimal MaxStock { get; set; }         // Tồn tối đa
    public int DefaultShelfLifeDays { get; set; } // Hạn sử dụng mặc định
    
    // Navigation Properties
    public IngredientCategory? IngredientCategory { get; set; }
    public ICollection<IngredientUnit> Units { get; set; }
    public ICollection<InventoryBatch> Batches { get; set; }
}
```

**✅ Ưu điểm:**
- Cấu trúc rõ ràng, phân tách Master Data
- Có MinStock/MaxStock để cảnh báo tồn kho
- Có DefaultShelfLifeDays để quản lý HSD

**⚠️ Vấn đề:**
- Không có trường `CurrentStock` (tồn kho hiện tại)
- Không có `CostPrice` (giá vốn trung bình)

---

#### **1.2. IngredientUnit (Đơn vị quy đổi)**
```csharp
public class IngredientUnit : BaseEntity
{
    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }
    
    public string UnitName { get; set; }      // hộp, bao, thùng
    public decimal ConversionRate { get; set; } // 1 hộp = 500g
    public bool IsBaseUnit { get; set; }      // Đơn vị cơ bản?
}
```

**✅ Ưu điểm:**
- Hỗ trợ đa đơn vị tính (kg, hộp, bao...)
- Có `IsBaseUnit` để đánh dấu đơn vị chuẩn

**⚠️ Vấn đề:**
- **CHƯA CÓ TRONG DATABASE** (theo hình 1)

---

#### **1.3. InventoryBatch (Lô hàng)**
```csharp
[Index(nameof(BatchCode), IsUnique = true)]
public class InventoryBatch : BaseEntity
{
    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }
    
    public int? LocationId { get; set; }              // Vị trí lưu trữ
    public string BatchCode { get; set; }             // Mã lô (unique)
    public decimal CurrentQuantity { get; set; }      // Tồn hiện tại
    public decimal InitialQuantity { get; set; }      // Tồn ban đầu
    public decimal ImportPricePerBaseUnit { get; set; } // Giá nhập/đơn vị
    public DateTime ImportDate { get; set; }          // Ngày nhập
    public DateTime? ManufactureDate { get; set; }    // NSX
    public DateTime? ExpiryDate { get; set; }         // HSD
}
```

**✅ Ưu điểm:**
- Quản lý lô hàng chi tiết (FIFO)
- Có ImportPrice để tính giá vốn
- Có ExpiryDate để cảnh báo hết hạn

**⚠️ Vấn đề:**
- **CHƯA CÓ TRONG DATABASE** (theo hình 1)
- `LocationId` chưa có bảng `Locations` tương ứng

---

#### **1.4. IngredientCategory (Nhóm nguyên liệu)**
```csharp
public class IngredientCategory : BaseEntity
{
    public string Name { get; set; }        // Trái cây, Siro, Bao bì
    public string? Description { get; set; }
    public ICollection<Ingredient> Ingredients { get; set; }
}
```

**✅ Ưu điểm:**
- Đơn giản, dễ quản lý
- Đã có trong database ✅

---

### **2. DTOs (Data Transfer Objects)**

#### **2.1. IngredientCreateDto**
```csharp
public class IngredientCreateDto
{
    // Master Data
    public string Name { get; set; }
    public string? SKU { get; set; }
    public string BaseUnit { get; set; }
    public int IngredientCategoryId { get; set; }
    public decimal MinStock { get; set; }
    public decimal MaxStock { get; set; }
    public int DefaultShelfLifeDays { get; set; }
    
    // Đơn vị quy đổi (Optional)
    public List<IngredientUnitCreateDto>? Units { get; set; }
    
    // Lô hàng đầu tiên (Optional)
    public InventoryBatchCreateDto? InitialBatch { get; set; }
}
```

**✅ Ưu điểm:**
- **FULL OPTION** - Tạo 1 lần được: Master + Units + Batch
- Giảm số lần gọi API
- Logic nghiệp vụ rõ ràng

**⚠️ Vấn đề:**
- Phức tạp cho người dùng mới
- Cần validation kỹ để tránh lỗi

---

### **3. Service Layer**

#### **3.1. IngredientService.CreateAsync()**
```csharp
public async Task<IngredientViewDto> CreateAsync(IngredientCreateDto dto)
{
    // 1. Tạo Ingredient (Master)
    var ingredient = new Ingredient { ... };
    await _ingredientRepo.AddAsync(ingredient);
    
    // 2. Tạo BaseUnit (đơn vị cơ bản)
    var baseUnit = new IngredientUnit {
        UnitName = dto.BaseUnit,
        ConversionRate = 1,
        IsBaseUnit = true
    };
    await _unitRepo.AddAsync(baseUnit);
    
    // 3. Tạo các đơn vị quy đổi khác (nếu có)
    if (dto.Units != null) {
        foreach (var unit in dto.Units) {
            await _unitRepo.AddAsync(new IngredientUnit { ... });
        }
    }
    
    // 4. Tạo lô hàng đầu tiên (nếu có)
    if (dto.InitialBatch != null) {
        var batch = new InventoryBatch {
            BatchCode = GenerateBatchCode(),
            CurrentQuantity = dto.InitialBatch.Quantity,
            InitialQuantity = dto.InitialBatch.Quantity,
            ...
        };
        await _batchRepo.AddAsync(batch);
    }
    
    return MapToViewDto(ingredient);
}
```

**✅ Ưu điểm:**
- Transaction tự động (EF Core)
- Logic rõ ràng, dễ maintain
- Tự động tạo BatchCode

**⚠️ Vấn đề:**
- Không có rollback thủ công nếu bước giữa lỗi
- Không kiểm tra trùng SKU

---

#### **3.2. IngredientService.GetAllAsync()**
```csharp
public async Task<IEnumerable<IngredientViewDto>> GetAllAsync()
{
    var items = await _ingredientRepo.GetAllAsync();
    return items.Select(x => MapToViewDto(x));
}

private IngredientViewDto MapToViewDto(Ingredient ingredient)
{
    // Tính tồn kho realtime từ tất cả lô hàng
    var batches = await _batchRepo.GetByIngredientIdAsync(ingredient.Id);
    var currentStock = batches.Sum(b => b.CurrentQuantity);
    
    return new IngredientViewDto {
        Id = ingredient.Id,
        Name = ingredient.Name,
        BaseUnit = ingredient.BaseUnit,
        CurrentStock = currentStock,  // ⭐ Tính realtime
        StockStatus = GetStockStatus(currentStock, ingredient.MinStock, ingredient.MaxStock),
        Batches = batches.Select(b => new InventoryBatchViewDto { ... })
    };
}
```

**✅ Ưu điểm:**
- Tồn kho tính realtime từ lô hàng
- Trả về đầy đủ thông tin Units + Batches

**⚠️ Vấn đề:**
- **N+1 Query Problem** - Gọi DB nhiều lần
- Performance kém khi có nhiều nguyên liệu

---

## 🔍 ĐÁNH GIÁ KHẢNĂNG LÀM VIỆC

### **✅ ĐIỂM MẠNH**

#### 1. **Cấu trúc N-Tier chuẩn**
- Controller → Service → Repository → DbContext
- Tách biệt rõ ràng giữa các layer
- Dễ test, dễ maintain

#### 2. **Quản lý đa đơn vị tính**
- Hỗ trợ quy đổi: g → kg, hộp, bao
- Linh hoạt cho nghiệp vụ F&B

#### 3. **Quản lý lô hàng (Batch)**
- Theo dõi từng lô nhập
- Hỗ trợ FIFO (First In First Out)
- Quản lý HSD chi tiết

#### 4. **Tính tồn kho realtime**
- Không lưu `CurrentStock` cứng
- Tính từ tổng các lô hàng
- Đảm bảo tính chính xác

#### 5. **Soft Delete**
- Không xóa vật lý
- Giữ lại lịch sử
- Có thể khôi phục

---

### **⚠️ ĐIỂM YẾU**

#### 1. **Database chưa đồng bộ với Code**
**Vấn đề:**
- Code có `IngredientUnits` và `InventoryBatches`
- Database **KHÔNG CÓ** 2 bảng này (theo hình 1)

**Nguyên nhân:**
- Migration chưa chạy
- Hoặc migration bị lỗi

**Giải pháp:**
```bash
# Kiểm tra migration pending
dotnet ef migrations list

# Chạy migration
dotnet ef database update
```

---

#### 2. **Thiếu bảng Suppliers (Nhà cung cấp)**
**Vấn đề:**
- Không quản lý được nhà cung cấp
- Không biết nguyên liệu nhập từ đâu

**Đề xuất:**
```csharp
public class Supplier : BaseEntity
{
    public string Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
}
```

---

#### 3. **Thiếu bảng PurchaseOrders (Phiếu nhập kho)**
**Vấn đề:**
- Không có phiếu nhập kho chính thức
- Không quản lý được quy trình duyệt nhập

**Đề xuất:**
```csharp
public class PurchaseOrder : BaseEntity
{
    public string PONumber { get; set; }          // Số phiếu
    public int SupplierId { get; set; }           // NCC
    public DateTime OrderDate { get; set; }       // Ngày đặt
    public DateTime? ReceivedDate { get; set; }   // Ngày nhận
    public string Status { get; set; }            // Pending, Received, Cancelled
    public decimal TotalAmount { get; set; }      // Tổng tiền
    
    public ICollection<PurchaseOrderItem> Items { get; set; }
}

public class PurchaseOrderItem : BaseEntity
{
    public int PurchaseOrderId { get; set; }
    public int IngredientId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public int? InventoryBatchId { get; set; }    // Link đến lô hàng
}
```

---

#### 4. **Thiếu bảng StockMovements (Lịch sử xuất nhập)**
**Vấn đề:**
- Không theo dõi được lịch sử xuất/nhập
- Khó kiểm tra sai sót

**Đề xuất:**
```csharp
public class StockMovement : BaseEntity
{
    public int IngredientId { get; set; }
    public int? InventoryBatchId { get; set; }
    public string MovementType { get; set; }      // IN, OUT, ADJUST
    public decimal Quantity { get; set; }
    public string? Reason { get; set; }           // Lý do
    public int? ReferenceId { get; set; }         // OrderId, POId...
    public string? ReferenceType { get; set; }    // Order, PurchaseOrder...
}
```

---

#### 5. **Performance Issue - N+1 Query**
**Vấn đề:**
```csharp
// GetAllAsync() gọi DB nhiều lần
foreach (var ingredient in ingredients) {
    var batches = await _batchRepo.GetByIngredientIdAsync(ingredient.Id); // ❌
}
```

**Giải pháp:**
```csharp
// Sử dụng Include để load 1 lần
var ingredients = await _context.Ingredients
    .Include(i => i.Units)
    .Include(i => i.Batches)
    .Include(i => i.IngredientCategory)
    .ToListAsync();
```

---

#### 6. **Thiếu Validation nghiệp vụ**
**Vấn đề:**
- Không check trùng SKU
- Không check MaxStock >= MinStock
- Không check ExpiryDate > ManufactureDate

**Đề xuất:**
```csharp
// Trong CreateAsync()
if (!string.IsNullOrEmpty(dto.SKU)) {
    var exists = await _ingredientRepo.ExistsBySKUAsync(dto.SKU);
    if (exists) throw new Exception("SKU đã tồn tại");
}

if (dto.MaxStock < dto.MinStock) {
    throw new Exception("Tồn tối đa phải >= Tồn tối thiểu");
}
```

---

## 📋 ĐỐI CHIẾU VỚI NGHIỆP VỤ F&B CHUẨN

### **1. Quy trình nhập kho F&B chuẩn**

#### **Bước 1: Đặt hàng (Purchase Order)**
- ❌ **THIẾU** - Không có bảng `PurchaseOrders`
- ❌ **THIẾU** - Không có workflow duyệt đơn

#### **Bước 2: Nhận hàng (Goods Receipt)**
- ✅ **CÓ** - Tạo `InventoryBatch` khi nhập
- ⚠️ **YẾU** - Không link với PO
- ⚠️ **YẾU** - Không có QC (Quality Check)

#### **Bước 3: Nhập kho (Stock In)**
- ✅ **CÓ** - `InventoryBatch.CurrentQuantity` tăng
- ❌ **THIẾU** - Không ghi log vào `StockMovements`

#### **Bước 4: Xuất kho (Stock Out)**
- ⚠️ **CHƯA RÕ** - Không thấy logic xuất kho
- ❌ **THIẾU** - Không có FIFO tự động

#### **Bước 5: Kiểm kê (Stock Take)**
- ❌ **THIẾU** - Không có chức năng kiểm kê
- ❌ **THIẾU** - Không có điều chỉnh tồn kho

---

### **2. Đơn vị nhập kho**

#### **Theo nghiệp vụ F&B:**
| Nguyên liệu | Đơn vị nhập | Đơn vị sử dụng | Quy đổi |
|-------------|-------------|----------------|---------|
| Cà phê | Bao 5kg | g | 1 bao = 5000g |
| Sữa tươi | Hộp 1L | ml | 1 hộp = 1000ml |
| Đường | Bao 50kg | g | 1 bao = 50000g |
| Ly nhựa | Thùng 1000 cái | cái | 1 thùng = 1000 cái |

#### **Khả năng hệ thống hiện tại:**
✅ **HỖ TRỢ** - Thông qua `IngredientUnit`

**Ví dụ:**
```json
{
  "name": "Cà phê Robusta",
  "baseUnit": "g",
  "units": [
    { "unitName": "g", "conversionRate": 1, "isBaseUnit": true },
    { "unitName": "kg", "conversionRate": 1000, "isBaseUnit": false },
    { "unitName": "bao", "conversionRate": 5000, "isBaseUnit": false }
  ],
  "initialBatch": {
    "quantity": 10000,  // 10kg = 2 bao
    "importPricePerBaseUnit": 0.5  // 0.5đ/g = 500đ/kg = 2500đ/bao
  }
}
```

---

### **3. Quản lý HSD (Hạn sử dụng)**

#### **Theo nghiệp vụ F&B:**
- ⚠️ **Cảnh báo sắp hết hạn:** < 7 ngày
- 🔴 **Cảnh báo đã hết hạn:** Quá HSD
- ✅ **Tươi:** > 30 ngày

#### **Khả năng hệ thống hiện tại:**
✅ **HỖ TRỢ** - Thông qua `GetExpiryStatus()`

```csharp
private string GetExpiryStatus(DateTime? expiryDate)
{
    if (expiryDate == null) return "NoExpiry";
    
    var daysUntilExpiry = (expiryDate.Value - DateTime.Now).Days;
    
    if (daysUntilExpiry < 0) return "Expired";      // Đã hết hạn
    if (daysUntilExpiry <= 7) return "NearExpiry";  // Sắp hết hạn
    return "Fresh";                                  // Còn tươi
}
```

---

### **4. Tính giá vốn (COGS - Cost of Goods Sold)**

#### **Theo nghiệp vụ F&B:**
- **FIFO:** Xuất lô cũ trước
- **Weighted Average:** Giá vốn trung bình

#### **Khả năng hệ thống hiện tại:**
✅ **HỖ TRỢ FIFO** - Thông qua `OrderBy(b => b.ExpiryDate)`

```csharp
public async Task<IEnumerable<InventoryBatch>> GetByIngredientIdAsync(int ingredientId)
{
    return await _context.InventoryBatches
        .Where(b => b.IngredientId == ingredientId && !b.IsDeleted)
        .OrderBy(b => b.ExpiryDate)  // ⭐ FIFO
        .ToListAsync();
}
```

⚠️ **VẤN ĐỀ:**
- Chỉ sắp xếp, chưa có logic xuất kho tự động
- Không tính giá vốn trung bình

---

### **5. Báo cáo kho**

#### **Theo nghiệp vụ F&B cần:**
- 📊 Tồn kho theo nhóm
- 📈 Lịch sử nhập/xuất
- 💰 Giá trị tồn kho
- ⚠️ Cảnh báo tồn thấp
- 🔴 Cảnh báo hết hạn

#### **Khả năng hệ thống hiện tại:**
- ✅ Tồn kho realtime
- ✅ Cảnh báo tồn thấp (MinStock/MaxStock)
- ✅ Cảnh báo hết hạn (ExpiryStatus)
- ❌ **THIẾU:** Lịch sử nhập/xuất
- ❌ **THIẾU:** Giá trị tồn kho

---

## 📊 BẢNG TỔNG KẾT KHẢNĂNG

| Tính năng | Nghiệp vụ F&B | Hệ thống hiện tại | Trạng thái |
|-----------|---------------|-------------------|------------|
| **Quản lý nguyên liệu** | ✅ | ✅ | ✅ Đầy đủ |
| **Phân nhóm nguyên liệu** | ✅ | ✅ | ✅ Đầy đủ |
| **Đa đơn vị tính** | ✅ | ✅ | ⚠️ Code có, DB thiếu |
| **Quản lý lô hàng** | ✅ | ✅ | ⚠️ Code có, DB thiếu |
| **Quản lý HSD** | ✅ | ✅ | ✅ Đầy đủ |
| **Cảnh báo tồn kho** | ✅ | ✅ | ✅ Đầy đủ |
| **Quản lý NCC** | ✅ | ❌ | ❌ Thiếu |
| **Phiếu nhập kho** | ✅ | ❌ | ❌ Thiếu |
| **Lịch sử xuất nhập** | ✅ | ❌ | ❌ Thiếu |
| **FIFO tự động** | ✅ | ⚠️ | ⚠️ Có logic, chưa tự động |
| **Kiểm kê** | ✅ | ❌ | ❌ Thiếu |
| **Báo cáo giá trị tồn** | ✅ | ❌ | ❌ Thiếu |

---

## 🚨 VẤN ĐỀ NGHIÊM TRỌNG

### **1. Database không đồng bộ với Code**
**Mức độ:** 🔴 **CRITICAL**

**Hiện tượng:**
- Code có `IngredientUnits` và `InventoryBatches`
- Database **KHÔNG CÓ** 2 bảng này

**Hậu quả:**
- Hệ thống sẽ **CRASH** khi chạy
- Không thể tạo nguyên liệu mới
- Không thể quản lý lô hàng

**Giải pháp:**
```bash
# 1. Kiểm tra migration
cd CaPheMinhHuu/CaPheMinhHuu
dotnet ef migrations list

# 2. Tạo migration mới (nếu chưa có)
dotnet ef migrations add AddIngredientUnitsAndBatches

# 3. Chạy migration
dotnet ef database update

# 4. Kiểm tra lại
SELECT name FROM sys.tables WHERE name IN ('IngredientUnits', 'InventoryBatches')
```

---

### **2. Trùng tên cột Unit vs BaseUnit**
**Mức độ:** ⚠️ **WARNING**

**Hiện tượng:**
- Code có `Ingredient.BaseUnit`
- Database có `Ingredients.Unit`

**Giải pháp:**
```sql
-- Rename cột
EXEC sp_rename 'Ingredients.Unit', 'BaseUnit', 'COLUMN';
```

---

## ✅ KHUYẾN NGHỊ

### **1. Ngắn hạn (1-2 tuần)**

#### **A. Fix Database**
```bash
# Chạy migration
dotnet ef database update

# Kiểm tra lại cấu trúc
SELECT * FROM INFORMATION_SCHEMA.TABLES
```

#### **B. Thêm Validation**
```csharp
// Trong IngredientService.CreateAsync()
if (dto.MaxStock < dto.MinStock) {
    throw new ValidationException("MaxStock phải >= MinStock");
}

if (dto.InitialBatch?.ExpiryDate <= dto.InitialBatch?.ManufactureDate) {
    throw new ValidationException("HSD phải sau NSX");
}
```

#### **C. Fix Performance**
```csharp
// Trong GetAllAsync()
var ingredients = await _context.Ingredients
    .Include(i => i.Units)
    .Include(i => i.Batches)
    .Include(i => i.IngredientCategory)
    .Where(i => !i.IsDeleted)
    .ToListAsync();
```

---

### **2. Trung hạn (1-2 tháng)**

#### **A. Thêm bảng Suppliers**
```csharp
public class Supplier : BaseEntity
{
    public string Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
}
```

#### **B. Thêm bảng PurchaseOrders**
```csharp
public class PurchaseOrder : BaseEntity
{
    public string PONumber { get; set; }
    public int SupplierId { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public string Status { get; set; }
    public decimal TotalAmount { get; set; }
    
    public Supplier? Supplier { get; set; }
    public ICollection<PurchaseOrderItem> Items { get; set; }
}
```

#### **C. Thêm bảng StockMovements**
```csharp
public class StockMovement : BaseEntity
{
    public int IngredientId { get; set; }
    public int? InventoryBatchId { get; set; }
    public string MovementType { get; set; }  // IN, OUT, ADJUST
    public decimal Quantity { get; set; }
    public string? Reason { get; set; }
}
```

---

### **3. Dài hạn (3-6 tháng)**

#### **A. Tự động hóa FIFO**
```csharp
public async Task<bool> DeductStockAsync(int ingredientId, decimal quantity)
{
    var batches = await _batchRepo.GetByIngredientIdAsync(ingredientId);
    var remaining = quantity;
    
    foreach (var batch in batches.OrderBy(b => b.ExpiryDate)) {
        if (remaining <= 0) break;
        
        if (batch.CurrentQuantity >= remaining) {
            batch.CurrentQuantity -= remaining;
            remaining = 0;
        } else {
            remaining -= batch.CurrentQuantity;
            batch.CurrentQuantity = 0;
        }
        
        await _batchRepo.UpdateAsync(batch);
    }
    
    return remaining == 0;
}
```

#### **B. Báo cáo nâng cao**
- Giá trị tồn kho theo nhóm
- Lịch sử nhập/xuất theo khoảng thời gian
- Top nguyên liệu sắp hết hạn
- Dự báo nhu cầu nhập hàng

---

## 📝 KẾT LUẬN

### **✅ Điểm mạnh:**
1. Cấu trúc code tốt (N-Tier)
2. Logic nghiệp vụ rõ ràng
3. Hỗ trợ đa đơn vị tính
4. Quản lý lô hàng chi tiết
5. Tính tồn kho realtime

### **⚠️ Điểm yếu:**
1. **Database chưa đồng bộ** (CRITICAL)
2. Thiếu quản lý NCC
3. Thiếu phiếu nhập kho
4. Thiếu lịch sử xuất nhập
5. Performance chưa tối ưu

### **🎯 Đánh giá tổng thể:**
- **Khả năng làm việc:** 70/100
- **Độ hoàn thiện:** 60/100
- **Phù hợp nghiệp vụ F&B:** 65/100

### **💡 Khuyến nghị:**
1. **Ưu tiên cao nhất:** Fix database sync
2. **Ưu tiên cao:** Thêm Suppliers + PurchaseOrders
3. **Ưu tiên trung bình:** Tối ưu performance
4. **Ưu tiên thấp:** Báo cáo nâng cao

---

**Người thực hiện:** AI Assistant  
**Ngày hoàn thành:** 10/12/2025  
**Phiên bản:** 1.0
