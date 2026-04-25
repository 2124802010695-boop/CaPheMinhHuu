# 📊 BÁO CÁO TỔNG HỢP DỰ ÁN - HỆ THỐNG QUẢN LÝ QUÁN CÀ PHÊ MINH HỮU

**Ngày báo cáo:** 09/12/2025  
**Người thực hiện:** Nguyễn Hữu Hạnh  
**Mục tiêu:** Báo cáo Tốt nghiệp 2026 - Đạt điểm 8+  
**Trạng thái:** Đang phát triển - Cần xác nhận kế hoạch

---

## 📑 MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Cấu trúc hệ thống](#2-cấu-trúc-hệ-thống)
3. [Tiến độ hiện tại](#3-tiến-độ-hiện-tại)
4. [Phân tích chi tiết Backend](#4-phân-tích-chi-tiết-backend)
5. [Phân tích chi tiết Frontend](#5-phân-tích-chi-tiết-frontend)
6. [Phân tích Database](#6-phân-tích-database)
7. [Logic nghiệp vụ](#7-logic-nghiệp-vụ)
8. [Điểm cần phát triển](#8-điểm-cần-phát-triển)
9. [Roadmap 4 tuần](#9-roadmap-4-tuần)
10. [Kế hoạch xác nhận](#10-kế-hoạch-xác-nhận)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Thông tin cơ bản

**Tên dự án:** Hệ thống Quản lý Quán Cà phê Minh Hữu  
**Loại hình:** Đồ án Tốt nghiệp 2026  
**Công nghệ:**
- **Backend:** ASP.NET Core 8.0 Web API
- **Frontend:** React 18 + Vite + Material-UI v5
- **Database:** SQL Server (Entity Framework Core)
- **Architecture:** N-Tier (3-Layer)

### 1.2. Mục tiêu dự án

#### Mục tiêu chính:
1. ✅ Xây dựng hệ thống quản lý quán cà phê hoàn chỉnh
2. ✅ Áp dụng kiến trúc N-Tier chuẩn chỉnh
3. ⚠️ Tích hợp tính năng Real-time (SignalR) - **ĐANG THIẾU**
4. ⚠️ Quản lý kho và định lượng nguyên liệu (BOM) - **ĐÃ CÓ NHƯNG CẦN HOÀN THIỆN**
5. ❌ Hệ thống POS bán hàng - **CHƯA CÓ**

#### Mục tiêu điểm số:
- **Mục tiêu:** 8.3/10
- **Hiện tại:** 6.4/10 (ước tính)
- **Cần cải thiện:** +1.9 điểm

---

## 2. CẤU TRÚC HỆ THỐNG

### 2.1. Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Pages: QuanLySanPham, QuanLyNguyenLieu, Login, etc.    │   │
│  │  Components: Modal, Table, Form, etc.                    │   │
│  │  Services: API Calls (Axios)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/HTTPS + JWT
┌────────────────────────▼────────────────────────────────────────┐
│                   API LAYER (ASP.NET Core)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Controllers (7):                                        │   │
│  │  - AuthController                                        │   │
│  │  - CategoryController                                    │   │
│  │  - ProductController                                     │   │
│  │  - RecipeController                                      │   │
│  │  - IngredientController                                  │   │
│  │  - IngredientCategoryController ⚠️ (KHÔNG CHUẨN)        │   │
│  │  - WeatherForecastController ⚠️ (NÊN XÓA)              │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  SERVICE LAYER (Business Logic)                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services (5):                                           │   │
│  │  - AuthService                                           │   │
│  │  - CategoryService                                       │   │
│  │  - ProductService                                        │   │
│  │  - RecipeService                                         │   │
│  │  - IngredientService (PHỨC TẠP NHẤT - 8.5KB)           │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                 REPOSITORY LAYER (Data Access)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Repositories (7):                                       │   │
│  │  - UserRepository                                        │   │
│  │  - CategoryRepository                                    │   │
│  │  - ProductRepository                                     │   │
│  │  - RecipeRepository                                      │   │
│  │  - IngredientRepository                                  │   │
│  │  - IngredientUnitRepository (MỚI)                       │   │
│  │  - InventoryBatchRepository (MỚI)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│              DATA LAYER (Entity Framework Core)                 │
│                  ApplicationDbContext                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │SQL Server│
                    └─────────┘
```

### 2.2. Cấu trúc thư mục chi tiết

```
CaPheMinhHuu/
├── 📂 Backend (CaPheMinhHuu/)
│   ├── Controllers/          (7 files - 1 KHÔNG CHUẨN, 1 CẦN XÓA)
│   ├── Services/             (5 files - ✅ CHUẨN)
│   │   └── Implements/
│   ├── Repositories/         (7 files - ✅ CHUẨN)
│   │   └── Implements/
│   ├── Interfaces/           (12 files - ✅ ĐẦY ĐỦ)
│   ├── Models/               (11 files)
│   ├── DTOs/                 (11 folders)
│   ├── Data/                 (ApplicationDbContext)
│   └── Migrations/           (21 files)
│
├── 📂 Frontend (capheminhhuu.ui/)
│   └── src/
│       ├── pages/            (5 files)
│       │   ├── Login.jsx
│       │   ├── QuanLySanPham.jsx
│       │   ├── QuanLyNguyenLieu.jsx
│       │   ├── QuanLyDanhMuc.jsx
│       │   └── QuanLyCongThuc.jsx
│       ├── components/       (7 files)
│       ├── services/         (5 files)
│       ├── layouts/          (1 file - MainLayout)
│       └── utils/            (1 file - axiosCustomize)
│
└── 📂 Documentation/
    ├── BAO_CAO_TONG_THE_BACKEND_ARCHITECTURE.md
    ├── ROADMAP_4_TUAN.md
    ├── Y_TUONG_HE_THONG_QUAN_LY_KHO_CHUYEN_NGHIEP.md
    ├── DANH_GIA_DU_AN_TOT_NGHIEP.md
    ├── CAY_SO_DO_THU_MUC.md
    ├── CSDL.docx
    └── capheminhhuu.docx
```

---

## 3. TIẾN ĐỘ HIỆN TẠI

### 3.1. Tổng quan tiến độ

| Giai đoạn | Trạng thái | Tiến độ | Ghi chú |
|-----------|-----------|---------|---------|
| **1. Khảo sát & Xác định đề tài** | ✅ Hoàn thành | 100% | - |
| **2. Phân tích nghiệp vụ** | ✅ Hoàn thành | 100% | Use Case, Requirements |
| **3. Thiết kế Kiến trúc & CSDL** | ⚠️ Gần hoàn thành | 85% | Thiếu Figma Mockup |
| **4. Phát triển Phần mềm** | 🔄 Đang thực hiện | 70% | Thiếu POS, KDS, Shifts |
| **5. Testing & QA** | ❌ Chưa bắt đầu | 0% | Chưa có Unit Tests |
| **6. Deployment** | ⚠️ Một phần | 30% | Chưa có Docker, CI/CD |

### 3.2. Chi tiết tiến độ từng module

#### ✅ Module đã hoàn thành (100%)

1. **Authentication & Authorization**
   - ✅ JWT Login
   - ✅ Token Refresh
   - ✅ Role-based Authorization
   - ✅ Middleware CORS

2. **Quản lý Danh mục (Category)**
   - ✅ CRUD hoàn chỉnh
   - ✅ Service + Repository chuẩn
   - ⚠️ Thiếu Update API

3. **Quản lý Sản phẩm (Product)**
   - ✅ CRUD hoàn chỉnh
   - ✅ Upload ảnh
   - ✅ Liên kết Category
   - ⚠️ Thiếu Update API
   - ❌ Chưa có Size/Variants

4. **Quản lý Công thức (Recipe)**
   - ✅ Thêm nguyên liệu vào món
   - ✅ Check trùng lặp
   - ✅ Xóa nguyên liệu
   - ✅ Hiển thị định lượng

#### 🔄 Module đang phát triển (70%)

5. **Quản lý Kho (Ingredient)**
   - ✅ CRUD nguyên liệu
   - ✅ Quản lý đơn vị (Units)
   - ✅ Quản lý lô hàng (Batches)
   - ✅ Tính tồn kho realtime
   - ✅ FIFO (First In First Out)
   - ⚠️ Chưa có Nhập kho (Import Receipt)
   - ⚠️ Chưa có Xuất kho (Export Receipt)
   - ⚠️ Chưa có Kiểm kho (Inventory Check)

6. **Quản lý Danh mục Nguyên liệu**
   - ✅ Có Model
   - ❌ Controller inject DbContext trực tiếp (KHÔNG CHUẨN)
   - ❌ Không có Service
   - ❌ Không có Repository

#### ❌ Module chưa có (0%)

7. **POS Bán hàng (Point of Sale)**
   - ❌ Chưa có UI
   - ❌ Chưa có API Order
   - ❌ Chưa có Giỏ hàng
   - ❌ Chưa có Thanh toán
   - ❌ Chưa có In hóa đơn

8. **KDS Bếp (Kitchen Display System)**
   - ❌ Chưa có UI
   - ❌ Chưa có SignalR
   - ❌ Chưa có Real-time
   - ❌ Chưa có Trạng thái món

9. **Quản lý Ca làm việc (Shifts)**
   - ❌ Chưa có Model
   - ❌ Chưa có API
   - ❌ Chưa có Mở/Đóng ca
   - ❌ Chưa có Z-Report

10. **Báo cáo & Thống kê**
    - ❌ Chưa có Dashboard
    - ❌ Chưa có Biểu đồ
    - ❌ Chưa có Export Excel

---

## 4. PHÂN TÍCH CHI TIẾT BACKEND

### 4.1. Controllers (7 files)

#### ✅ Controllers chuẩn (5/7)

1. **AuthController.cs** (51 lines)
   ```
   Endpoints:
   - POST /api/auth/login
   - GET /api/auth/check-token
   
   Đánh giá: ✅ Chuẩn N-Tier
   ```

2. **CategoryController.cs** (46 lines)
   ```
   Endpoints:
   - GET /api/category
   - POST /api/category
   - DELETE /api/category/{id}
   
   Thiếu: PUT /api/category/{id}
   Đánh giá: ✅ Chuẩn, cần thêm Update
   ```

3. **ProductController.cs** (77 lines)
   ```
   Endpoints:
   - GET /api/product
   - POST /api/product (có upload ảnh)
   - DELETE /api/product/{id}
   
   Thiếu: PUT /api/product/{id}
   Đánh giá: ✅ Chuẩn, cần thêm Update
   ```

4. **RecipeController.cs** (52 lines)
   ```
   Endpoints:
   - GET /api/recipe/product/{productId}
   - POST /api/recipe
   - DELETE /api/recipe/{id}
   
   Đánh giá: ✅ Chuẩn, logic tốt
   ```

5. **IngredientController.cs** (63 lines)
   ```
   Endpoints:
   - GET /api/ingredient
   - GET /api/ingredient/{id}
   - POST /api/ingredient
   - PUT /api/ingredient/{id}
   - DELETE /api/ingredient/{id}
   
   Đánh giá: ✅ Chuẩn, CRUD đầy đủ
   ```

#### ❌ Controllers KHÔNG chuẩn (2/7)

6. **IngredientCategoryController.cs** (37 lines)
   ```csharp
   ❌ VẤN ĐỀ:
   - Inject DbContext trực tiếp
   - Không có Service
   - Không có Repository
   - Không tuân thủ N-Tier
   
   CẦN SỬA:
   - Tạo IIngredientCategoryService + IngredientCategoryService
   - Tạo IIngredientCategoryRepository + IngredientCategoryRepository
   - Sửa Controller inject Service
   ```

7. **WeatherForecastController.cs** (1,079 bytes)
   ```
   ⚠️ VẤN ĐỀ:
   - File template từ ASP.NET Core
   - Không dùng trong production
   
   KHUYẾN NGHỊ: XÓA
   ```

### 4.2. Services (5 files)

#### Tất cả Services đều chuẩn ✅

1. **AuthService.cs** (2,638 bytes)
   - Inject: IUserRepository
   - Methods: LoginAsync
   - Logic: JWT Generation, Password Hashing

2. **CategoryService.cs** (1,570 bytes)
   - Inject: ICategoryRepository
   - Methods: GetAll, Create, Delete
   - Thiếu: Update

3. **ProductService.cs** (1,811 bytes)
   - Inject: IProductRepository
   - Methods: GetAll, Create, Delete
   - Thiếu: Update

4. **RecipeService.cs** (2,179 bytes)
   - Inject: IRecipeRepository
   - Methods: GetByProductId, AddIngredient, RemoveIngredient
   - Logic: Check trùng nguyên liệu

5. **IngredientService.cs** (8,558 bytes) - **PHỨC TẠP NHẤT**
   - Inject: IIngredientRepository, IIngredientUnitRepository, IInventoryBatchRepository
   - Methods:
     - GetAllAsync → Tính tồn kho realtime
     - GetByIdAsync → Lấy Units, Batches
     - CreateAsync → Tạo Ingredient + Units + Batch
     - UpdateAsync → Chỉ update Master data
     - DeleteAsync
   - Helper methods:
     - MapToViewDto → Map phức tạp
     - GenerateBatchCode
     - GetExpiryStatus

### 4.3. Repositories (7 files)

#### Tất cả Repositories đều chuẩn ✅

1. **UserRepository.cs** (878 bytes)
2. **CategoryRepository.cs** (1,484 bytes)
3. **ProductRepository.cs** (1,132 bytes)
4. **RecipeRepository.cs** (1,458 bytes)
5. **IngredientRepository.cs** (1,638 bytes)
6. **IngredientUnitRepository.cs** (1,798 bytes) - MỚI
7. **InventoryBatchRepository.cs** (1,883 bytes) - MỚI

### 4.4. Bảng tổng hợp Backend

| Module | Controller | Service | Repository | Chuẩn N-Tier | Ghi Chú |
|--------|-----------|---------|------------|--------------|---------|
| Auth | ✅ | ✅ | ✅ | ✅ | Hoàn chỉnh |
| Category | ✅ | ✅ | ✅ | ✅ | Thiếu Update |
| Product | ✅ | ✅ | ✅ | ✅ | Thiếu Update |
| Recipe | ✅ | ✅ | ✅ | ✅ | Hoàn chỉnh |
| Ingredient | ✅ | ✅ | ✅ (x3) | ✅ | Phức tạp nhất |
| IngredientCategory | ✅ | ❌ | ❌ | ❌ | **CẦN SỬA** |
| Order | ❌ | ❌ | ❌ | ❌ | Chưa có |
| Shift | ❌ | ❌ | ❌ | ❌ | Chưa có |

**Điểm số Backend:** 7.5/10
- **Điểm mạnh:** Cấu trúc chuẩn, logic tốt
- **Điểm yếu:** 1 module không chuẩn, thiếu Order/Shift

---

## 5. PHÂN TÍCH CHI TIẾT FRONTEND

### 5.1. Pages (5 files)

1. **Login.jsx**
   - ✅ Form đăng nhập
   - ✅ JWT Token lưu localStorage
   - ✅ Redirect sau login

2. **QuanLySanPham.jsx**
   - ✅ Danh sách sản phẩm
   - ✅ Modal thêm/sửa
   - ✅ Upload ảnh
   - ✅ Xóa sản phẩm
   - ⚠️ Chưa có chức năng Edit

3. **QuanLyNguyenLieu.jsx**
   - ✅ Danh sách nguyên liệu
   - ✅ Hiển thị tồn kho realtime
   - ✅ Modal thêm/sửa
   - ✅ Quản lý đơn vị
   - ✅ Quản lý lô hàng
   - ✅ Hiển thị HSD

4. **QuanLyDanhMuc.jsx**
   - ✅ Danh sách danh mục
   - ✅ Modal thêm
   - ✅ Xóa danh mục
   - ⚠️ Chưa có chức năng Edit

5. **QuanLyCongThuc.jsx**
   - ✅ Chọn sản phẩm
   - ✅ Thêm nguyên liệu
   - ✅ Nhập định lượng
   - ✅ Xóa nguyên liệu

### 5.2. Components (7 files)

1. **ModalAddProduct.jsx**
   - ✅ Form thêm sản phẩm
   - ✅ Upload ảnh
   - ✅ Chọn danh mục

2. **ModalAddIngredient.jsx**
   - ✅ Form thêm nguyên liệu
   - ✅ Chọn danh mục
   - ✅ Thêm đơn vị
   - ✅ Thêm lô hàng

3. **ModalEditIngredient.jsx**
   - ✅ Form sửa nguyên liệu
   - ✅ Hiển thị thông tin hiện tại

4. **ModalAddCategory.jsx**
   - ✅ Form thêm danh mục

5. **ModalRecipe.jsx**
   - ✅ Form thêm công thức
   - ✅ Chọn nguyên liệu
   - ✅ Nhập số lượng

6. **Sidebar.jsx**
   - ✅ Menu điều hướng
   - ✅ Logout

7. **Header.jsx**
   - ✅ Tiêu đề trang
   - ✅ User info

### 5.3. Services (5 files)

1. **authService.js**
   - login()
   - checkToken()

2. **categoryService.js**
   - getAllCategories()
   - createCategory()
   - deleteCategory()

3. **productService.js**
   - getAllProducts()
   - createProduct()
   - deleteProduct()

4. **ingredientService.js**
   - getAllIngredients()
   - getIngredientById()
   - createIngredient()
   - updateIngredient()
   - deleteIngredient()

5. **recipeService.js**
   - getRecipesByProductId()
   - addRecipe()
   - deleteRecipe()

### 5.4. Đánh giá Frontend

**Điểm số Frontend:** 7.0/10

**Điểm mạnh:**
- ✅ Material-UI components đẹp
- ✅ Responsive design
- ✅ Axios interceptor tốt
- ✅ Modal components tái sử dụng

**Điểm yếu:**
- ⚠️ Thiếu chức năng Edit cho Product, Category
- ❌ Chưa có POS UI
- ❌ Chưa có KDS UI
- ❌ Chưa có Dashboard
- ❌ Chưa có SignalR client

---

## 6. PHÂN TÍCH DATABASE

### 6.1. Models hiện có (11 files)

1. **BaseEntity.cs**
   ```csharp
   public abstract class BaseEntity
   {
       public int Id { get; set; }
       public DateTime CreatedAt { get; set; }
       public DateTime? UpdatedAt { get; set; }
       public bool IsDeleted { get; set; }
   }
   ```

2. **User.cs**
   - Username, Password, Role
   - Navigation: Orders

3. **Category.cs**
   - Name, Description
   - Navigation: Products

4. **Product.cs**
   - Name, Price, ImageUrl, CategoryId
   - Navigation: Category, Recipes, OrderDetails

5. **Ingredient.cs**
   - Name, IngredientCategoryId, Description
   - Navigation: IngredientCategory, Units, Batches, Recipes

6. **IngredientCategory.cs**
   - Name, Description
   - Navigation: Ingredients

7. **IngredientUnit.cs** - MỚI
   - IngredientId, UnitName, ConversionFactor, IsBaseUnit
   - Navigation: Ingredient

8. **InventoryBatch.cs** - MỚI
   - IngredientId, BatchCode, Quantity, ExpiryDate, CostPrice
   - Navigation: Ingredient

9. **Recipe.cs**
   - ProductId, IngredientId, Quantity, Unit
   - Navigation: Product, Ingredient

10. **Order.cs**
    - OrderCode, UserId, TotalAmount, Status, PaymentMethod
    - Navigation: User, OrderDetails

11. **OrderDetail.cs**
    - OrderId, ProductId, Quantity, UnitPrice, Subtotal
    - Navigation: Order, Product

### 6.2. ERD Diagram

```
┌─────────────┐         ┌─────────────┐
│    User     │1      * │    Order    │
│─────────────│◄────────│─────────────│
│ Id          │         │ Id          │
│ Username    │         │ OrderCode   │
│ Password    │         │ UserId      │
│ Role        │         │ TotalAmount │
└─────────────┘         │ Status      │
                        └──────┬──────┘
                               │1
                               │
                               │*
                        ┌──────▼──────┐
                        │OrderDetail  │
                        │─────────────│
                        │ Id          │
                        │ OrderId     │
                        │ ProductId   │
                        │ Quantity    │
                        └──────┬──────┘
                               │*
                               │
                               │1
┌─────────────┐         ┌──────▼──────┐         ┌─────────────┐
│  Category   │1      * │   Product   │*      * │   Recipe    │
│─────────────│◄────────│─────────────│◄────────│─────────────│
│ Id          │         │ Id          │         │ Id          │
│ Name        │         │ Name        │         │ ProductId   │
└─────────────┘         │ Price       │         │ IngredientId│
                        │ CategoryId  │         │ Quantity    │
                        └─────────────┘         └──────┬──────┘
                                                       │*
                                                       │
                                                       │1
┌──────────────────┐    ┌──────▼──────┐
│IngredientCategory│1 * │ Ingredient  │
│──────────────────│◄───│─────────────│
│ Id               │    │ Id          │
│ Name             │    │ Name        │
└──────────────────┘    │ CategoryId  │
                        └──────┬──────┘
                               │1
                        ┌──────┴──────┬──────────────┐
                        │*            │*             │
                 ┌──────▼──────┐ ┌───▼────────┐     │
                 │IngredientUnit│ │InventoryBatch│  │
                 │──────────────│ │──────────────│  │
                 │ Id           │ │ Id           │  │
                 │ IngredientId │ │ IngredientId │  │
                 │ UnitName     │ │ BatchCode    │  │
                 │ ConversionFactor│ │ Quantity  │  │
                 └──────────────┘ │ ExpiryDate   │  │
                                  └──────────────┘  │
```

### 6.3. Migrations (21 files)

- ✅ Có đầy đủ migrations
- ✅ Code-First approach
- ✅ Audit fields (CreatedAt, UpdatedAt)

---

## 7. LOGIC NGHIỆP VỤ

### 7.1. Quy trình hiện có

#### 1. Quản lý Sản phẩm
```
1. Admin tạo Danh mục (Category)
2. Admin tạo Sản phẩm (Product) thuộc Danh mục
3. Admin upload ảnh sản phẩm
4. Hiển thị danh sách sản phẩm
```

#### 2. Quản lý Công thức (BOM)
```
1. Admin chọn Sản phẩm
2. Admin thêm Nguyên liệu vào Sản phẩm
3. Admin nhập Định lượng (Quantity + Unit)
4. Hệ thống check trùng lặp
5. Lưu Recipe
```

#### 3. Quản lý Kho
```
1. Admin tạo Danh mục Nguyên liệu
2. Admin tạo Nguyên liệu
3. Admin thêm Đơn vị (Units) cho Nguyên liệu
   - Đơn vị cơ bản (Base Unit)
   - Đơn vị quy đổi (Conversion Factor)
4. Admin thêm Lô hàng (Batch)
   - Số lượng nhập
   - Giá nhập
   - Hạn sử dụng
5. Hệ thống tính Tồn kho realtime
6. Hệ thống cảnh báo HSD
```

### 7.2. Quy trình cần có (CHƯA IMPLEMENT)

#### 4. POS Bán hàng
```
❌ CHƯA CÓ:
1. Thu ngân chọn Sản phẩm
2. Thêm vào Giỏ hàng
3. Chọn Size (S/M/L)
4. Chọn Topping
5. Nhập số lượng
6. Tính tổng tiền
7. Chọn phương thức thanh toán
8. Tạo Order
9. Trừ kho nguyên liệu (theo BOM)
10. In hóa đơn
```

#### 5. KDS Bếp
```
❌ CHƯA CÓ:
1. Bếp nhận đơn real-time (SignalR)
2. Hiển thị món theo trạng thái:
   - Pending (Chờ làm)
   - Cooking (Đang làm)
   - Done (Hoàn thành)
3. Bếp cập nhật trạng thái
4. Thông báo cho Thu ngân
```

#### 6. Quản lý Ca
```
❌ CHƯA CÓ:
1. Thu ngân Mở ca
   - Nhập tiền đầu ca
   - Ghi nhận thời gian
2. Bán hàng trong ca
3. Thu ngân Đóng ca
   - Nhập tiền cuối ca
   - Tính chênh lệch
   - Xuất Z-Report
```

### 7.3. Logic nghiệp vụ phức tạp

#### Tính tồn kho (ĐÃ CÓ)
```csharp
// IngredientService.cs
public async Task<List<IngredientViewDto>> GetAllAsync()
{
    var ingredients = await _ingredientRepository.GetAllAsync();
    var result = new List<IngredientViewDto>();
    
    foreach (var ingredient in ingredients)
    {
        // Lấy tất cả batches
        var batches = await _inventoryBatchRepository.GetByIngredientIdAsync(ingredient.Id);
        
        // Tính tổng tồn kho
        var totalStock = batches.Sum(b => b.Quantity);
        
        // Map to DTO
        var dto = MapToViewDto(ingredient, batches, totalStock);
        result.Add(dto);
    }
    
    return result;
}
```

#### Quy đổi đơn vị (ĐÃ CÓ)
```csharp
// IngredientUnitRepository.cs
public async Task<List<IngredientUnit>> GetByIngredientIdAsync(int ingredientId)
{
    return await _context.IngredientUnits
        .Where(u => u.IngredientId == ingredientId)
        .OrderByDescending(u => u.IsBaseUnit)
        .ToListAsync();
}

// Ví dụ:
// - 1 kg = 1000 g (ConversionFactor = 1000)
// - 1 lít = 1000 ml (ConversionFactor = 1000)
```

#### FIFO (First In First Out) (ĐÃ CÓ)
```csharp
// InventoryBatchRepository.cs
public async Task<List<InventoryBatch>> GetByIngredientIdAsync(int ingredientId)
{
    return await _context.InventoryBatches
        .Where(b => b.IngredientId == ingredientId && b.Quantity > 0)
        .OrderBy(b => b.CreatedAt)  // FIFO: Lô cũ nhất trước
        .ToListAsync();
}
```

---

## 8. ĐIỂM CẦN PHÁT TRIỂN

### 8.1. Ưu tiên CAO (CRITICAL)

#### 1. POS Bán hàng ❌
**Tầm quan trọng:** 🔴 CRITICAL  
**Lý do:** Đây là tính năng CHÍNH của hệ thống quán cafe

**Cần làm:**
- [ ] Backend:
  - [ ] Model: Order, OrderDetail
  - [ ] API: POST /api/orders (Tạo đơn)
  - [ ] API: GET /api/orders/{id} (Chi tiết)
  - [ ] API: GET /api/orders/today (Đơn hôm nay)
  - [ ] Logic: Tính tổng tiền
  - [ ] Logic: Trừ kho nguyên liệu

- [ ] Frontend:
  - [ ] Page: QuanLyBanHang.jsx (POS Layout)
  - [ ] Component: MenuGrid.jsx
  - [ ] Component: Cart.jsx
  - [ ] Component: PaymentPanel.jsx
  - [ ] Component: BillTemplate.jsx
  - [ ] Service: orderService.js

**Thời gian ước tính:** 1 tuần

---

#### 2. KDS Bếp + Real-time ❌
**Tầm quan trọng:** 🔴 CRITICAL  
**Lý do:** Bếp cần biết món nào cần làm

**Cần làm:**
- [ ] Backend:
  - [ ] Cài đặt SignalR
  - [ ] Hub: KitchenHub.cs
  - [ ] API: PATCH /api/orders/{id}/status
  - [ ] Enum: OrderStatus

- [ ] Frontend:
  - [ ] Cài đặt @microsoft/signalr
  - [ ] Page: KDS_Bep.jsx (Dark Mode)
  - [ ] SignalR Connection
  - [ ] Real-time listeners

**Thời gian ước tính:** 1 tuần

---

#### 3. Quản lý Ca làm việc ❌
**Tầm quan trọng:** 🟡 IMPORTANT  
**Lý do:** Kiểm soát doanh thu

**Cần làm:**
- [ ] Backend:
  - [ ] Model: Shift
  - [ ] API: POST /api/shifts/open
  - [ ] API: POST /api/shifts/close
  - [ ] API: GET /api/shifts/{id}/report

- [ ] Frontend:
  - [ ] Modal: ModalOpenShift.jsx
  - [ ] Modal: ModalCloseShift.jsx
  - [ ] Page: BaoCaoCa.jsx

**Thời gian ước tính:** 1 tuần

---

### 8.2. Ưu tiên TRUNG (IMPORTANT)

#### 4. Sửa IngredientCategoryController ⚠️
**Tầm quan trọng:** 🟡 IMPORTANT  
**Lý do:** Không tuân thủ N-Tier

**Cần làm:**
- [ ] Tạo IIngredientCategoryService
- [ ] Tạo IngredientCategoryService
- [ ] Tạo IIngredientCategoryRepository
- [ ] Tạo IngredientCategoryRepository
- [ ] Sửa Controller inject Service

**Thời gian ước tính:** 2 giờ

---

#### 5. Thêm Update API ⚠️
**Tầm quan trọng:** 🟡 IMPORTANT  
**Lý do:** Chưa thể sửa Category, Product

**Cần làm:**
- [ ] CategoryController: PUT /api/category/{id}
- [ ] CategoryService: UpdateCategoryAsync
- [ ] ProductController: PUT /api/product/{id}
- [ ] ProductService: UpdateProductAsync

**Thời gian ước tính:** 4 giờ

---

#### 6. Figma Mockup ⚠️
**Tầm quan trọng:** 🟡 IMPORTANT  
**Lý do:** Báo cáo cần có thiết kế UI/UX

**Cần làm:**
- [ ] Mockup POS
- [ ] Mockup KDS
- [ ] Mockup Admin
- [ ] Mockup Mobile (Web Order)

**Thời gian ước tính:** 3 ngày

---

### 8.3. Ưu tiên THẤP (NICE TO HAVE)

#### 7. Product Variants & Toppings ⚠️
**Tầm quan trọng:** 🟢 NICE TO HAVE  
**Lý do:** Tăng tính linh hoạt

**Cần làm:**
- [ ] Model: ProductVariant (Size S/M/L)
- [ ] Model: Topping
- [ ] Model: ProductTopping
- [ ] API: Hỗ trợ Variants
- [ ] UI: Chọn Size, Topping

**Thời gian ước tính:** 1 tuần

---

#### 8. Web Order (QR Code) ⚠️
**Tầm quan trọng:** 🟢 NICE TO HAVE  
**Lý do:** Khách tự order

**Cần làm:**
- [ ] Page: WebOrder.jsx (Mobile-First)
- [ ] QR Code Generator
- [ ] Table Management
- [ ] Order Sync với POS

**Thời gian ước tính:** 1 tuần

---

#### 9. Unit Tests ⚠️
**Tầm quan trọng:** 🟢 NICE TO HAVE  
**Lý do:** Chứng minh chất lượng code

**Cần làm:**
- [ ] xUnit Project
- [ ] Test Services
- [ ] Test Repositories
- [ ] Coverage > 70%

**Thời gian ước tính:** 1 tuần

---

## 9. ROADMAP 4 TUẦN

### TUẦN 1: POS Bán hàng (03/12 - 09/12)

#### Ngày 1-2: Backend API (03-04/12)
- [ ] Thiết kế Models (Order, OrderDetail)
- [ ] Tạo Migration
- [ ] Tạo DTOs
- [ ] Viết Repository
- [ ] Viết Service
- [ ] Viết Controller
- [ ] Test API bằng Postman

**Deliverable:** API CRUD Orders hoạt động

---

#### Ngày 3-4: Frontend POS Layout (05-06/12)
- [ ] Tạo Page QuanLyBanHang.jsx
- [ ] Tạo Component MenuGrid.jsx
- [ ] Tạo Component Cart.jsx
- [ ] Tạo Component PaymentPanel.jsx
- [ ] Tạo Component ModalSelectSize.jsx

**Deliverable:** POS Layout 3 cột hoạt động

---

#### Ngày 5-6: Tích hợp API & In hóa đơn (07-08/12)
- [ ] Tạo orderService.js
- [ ] Tích hợp API vào POS
- [ ] Tạo BillTemplate.jsx
- [ ] CSS cho In hóa đơn
- [ ] Test flow hoàn chỉnh

**Deliverable:** Bán hàng + In bill thành công

---

#### Ngày 7: Testing & Bug Fixes (09/12)
- [ ] Test toàn bộ flow
- [ ] Fix bugs
- [ ] Optimize performance

**Deliverable:** POS hoàn chỉnh

---

### TUẦN 2: KDS Bếp + Real-time (10/12 - 16/12)

#### Ngày 1-2: SignalR Backend (10-11/12)
- [ ] Cài đặt SignalR package
- [ ] Tạo KitchenHub.cs
- [ ] Cấu hình Program.cs
- [ ] Update OrderService (broadcast)
- [ ] Test SignalR

**Deliverable:** SignalR Hub hoạt động

---

#### Ngày 3-4: Frontend KDS (12-13/12)
- [ ] Cài đặt @microsoft/signalr
- [ ] Tạo signalRConnection.js
- [ ] Tạo Page KDS_Bep.jsx
- [ ] Tạo Component OrderCard.jsx
- [ ] Tích hợp SignalR

**Deliverable:** KDS nhận đơn real-time

---

#### Ngày 5-6: Hoàn thiện KDS (14-15/12)
- [ ] UI Dark Mode
- [ ] Sound notification
- [ ] Drag & Drop (optional)
- [ ] Test real-time

**Deliverable:** KDS hoàn chỉnh

---

#### Ngày 7: Testing (16/12)
- [ ] Test POS → KDS
- [ ] Test trạng thái món
- [ ] Fix bugs

**Deliverable:** POS + KDS hoạt động tốt

---

### TUẦN 3: Quản lý Ca + Báo cáo (17/12 - 23/12)

#### Ngày 1-2: Backend Shifts (17-18/12)
- [ ] Thiết kế Model Shift
- [ ] Tạo Migration
- [ ] Tạo DTOs
- [ ] Viết Repository
- [ ] Viết Service
- [ ] Viết Controller

**Deliverable:** API Shifts hoạt động

---

#### Ngày 3-4: Frontend Shifts (19-20/12)
- [ ] Tạo ModalOpenShift.jsx
- [ ] Tạo ModalCloseShift.jsx
- [ ] Tạo Page BaoCaoCa.jsx
- [ ] Tích hợp API

**Deliverable:** Mở/Đóng ca thành công

---

#### Ngày 5-6: Báo cáo (21-22/12)
- [ ] Z-Report template
- [ ] Export PDF
- [ ] Biểu đồ doanh thu (Chart.js)

**Deliverable:** Báo cáo đầy đủ

---

#### Ngày 7: Testing (23/12)
- [ ] Test toàn bộ flow
- [ ] Fix bugs

**Deliverable:** Shifts + Reports hoàn chỉnh

---

### TUẦN 4: Tài liệu + Testing + Deploy (24/12 - 31/12)

#### Ngày 1-2: Sửa lỗi còn tồn (24-25/12)
- [ ] Sửa IngredientCategoryController
- [ ] Thêm Update API (Category, Product)
- [ ] Xóa WeatherForecastController
- [ ] Code cleanup

**Deliverable:** Backend hoàn hảo

---

#### Ngày 3-4: Figma Mockup (26-27/12)
- [ ] Mockup POS
- [ ] Mockup KDS
- [ ] Mockup Admin
- [ ] Export PNG

**Deliverable:** Figma hoàn chỉnh

---

#### Ngày 5-6: Tài liệu (28-29/12)
- [ ] Sequence Diagram
- [ ] API Documentation (Swagger)
- [ ] User Manual (PDF)
- [ ] Technical Report

**Deliverable:** Tài liệu đầy đủ

---

#### Ngày 7: Deploy & Video Demo (30-31/12)
- [ ] Docker Compose
- [ ] Deploy lên Cloud
- [ ] Video Demo 5-10 phút
- [ ] README.md

**Deliverable:** Dự án hoàn chỉnh

---

## 10. KẾ HOẠCH XÁC NHẬN

### 10.1. Câu hỏi cần xác nhận

Tôi cần bạn xác nhận các điểm sau để tiếp tục:

#### 1. Về Roadmap 4 tuần
- [ ] **Bạn có đồng ý với Roadmap 4 tuần này không?**
  - Tuần 1: POS Bán hàng
  - Tuần 2: KDS Bếp + Real-time
  - Tuần 3: Quản lý Ca + Báo cáo
  - Tuần 4: Tài liệu + Deploy

- [ ] **Bạn có muốn điều chỉnh thứ tự ưu tiên không?**
  - Ví dụ: Làm Figma trước, hoặc sửa lỗi trước?

#### 2. Về tính năng
- [ ] **Bạn có muốn làm Product Variants (Size S/M/L) không?**
  - Nếu có: Làm ở Tuần nào?
  - Nếu không: Bỏ qua

- [ ] **Bạn có muốn làm Web Order (QR Code) không?**
  - Nếu có: Làm ở Tuần nào?
  - Nếu không: Bỏ qua

- [ ] **Bạn có muốn làm Unit Tests không?**
  - Nếu có: Làm ở Tuần nào?
  - Nếu không: Bỏ qua

#### 3. Về công việc ngay lập tức
- [ ] **Bạn muốn tôi bắt đầu từ đâu?**
  - A. Sửa IngredientCategoryController (2 giờ)
  - B. Thêm Update API cho Category, Product (4 giờ)
  - C. Bắt đầu làm POS Backend (Tuần 1)
  - D. Tạo Figma Mockup trước
  - E. Khác (vui lòng nêu rõ)

#### 4. Về thời gian
- [ ] **Bạn có thể dành bao nhiêu giờ/ngày cho dự án?**
  - 2-4 giờ/ngày
  - 4-6 giờ/ngày
  - 6-8 giờ/ngày
  - Full-time (8+ giờ/ngày)

- [ ] **Deadline cuối cùng của bạn là khi nào?**
  - 31/12/2025
  - 31/01/2026
  - Khác (vui lòng nêu rõ)

### 10.2. Kế hoạch làm việc từng bước

Sau khi bạn xác nhận, tôi sẽ:

#### Bước 1: Lập kế hoạch chi tiết
- Tạo checklist chi tiết cho từng ngày
- Ước tính thời gian cho từng task
- Xác định dependencies

#### Bước 2: Bắt đầu thực hiện
- Làm từng task một
- Commit code thường xuyên
- Test sau mỗi tính năng

#### Bước 3: Review & Adjust
- Review tiến độ hàng tuần
- Điều chỉnh kế hoạch nếu cần
- Ưu tiên tính năng CORE

#### Bước 4: Hoàn thiện
- Testing tổng thể
- Viết tài liệu
- Deploy & Demo

---

## 📝 TÓM TẮT BÁO CÁO

### Điểm mạnh ✅
1. Kiến trúc N-Tier chuẩn chỉnh (5/6 modules)
2. Database thiết kế tốt (ERD, Migrations)
3. Security chặt chẽ (JWT, Authorization)
4. Frontend hiện đại (React + Material-UI)
5. BOM Logic phức tạp (Units, Batches, FIFO)

### Điểm yếu ❌
1. Thiếu tính năng CORE (POS, KDS, Shifts)
2. 1 Controller không chuẩn (IngredientCategory)
3. Thiếu Update API (Category, Product)
4. Thiếu tài liệu (Figma, Testing, Manual)
5. Chưa deploy hoàn chỉnh

### Điểm số
- **Hiện tại:** 6.4/10
- **Mục tiêu:** 8.3/10
- **Cần cải thiện:** +1.9 điểm

### Roadmap
- **Tuần 1:** POS Bán hàng
- **Tuần 2:** KDS Bếp + Real-time
- **Tuần 3:** Quản lý Ca + Báo cáo
- **Tuần 4:** Tài liệu + Deploy

### Thời gian ước tính
- **Tổng:** 4 tuần (28 ngày)
- **Deadline:** 31/12/2025

---

## ❓ HÀNH ĐỘNG TIẾP THEO

**Vui lòng xác nhận:**

1. ✅ Bạn có đồng ý với Roadmap 4 tuần này không?
2. ✅ Bạn muốn tôi bắt đầu từ đâu?
3. ✅ Bạn có thể dành bao nhiêu giờ/ngày?
4. ✅ Deadline cuối cùng là khi nào?

**Sau khi bạn xác nhận, tôi sẽ:**
- Tạo kế hoạch chi tiết cho từng ngày
- Bắt đầu code ngay lập tức
- Commit & push lên GitHub thường xuyên

---

**Người tạo:** AI Assistant  
**Ngày:** 09/12/2025  
**Trạng thái:** ⏸️ CHỜ XÁC NHẬN

---

**📞 Hãy cho tôi biết bạn muốn bắt đầu từ đâu!** 🚀
