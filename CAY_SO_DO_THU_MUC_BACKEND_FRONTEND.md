# 🌳 CÂY SƠ ĐỒ THƯ MỤC - BACKEND & FRONTEND

**Ngày tạo:** 09/12/2025  
**Dự án:** Hệ thống Quản lý Quán Cà phê Minh Hữu  
**Phiên bản:** 1.0 - Chi tiết đầy đủ

---

## 📂 TỔNG QUAN DỰ ÁN

```
CaPheMinhHuu/
│
├── 📁 CaPheMinhHuu/                    # ⚙️ BACKEND (ASP.NET Core 8.0)
│   ├── CaPheMinhHuu.sln
│   └── CaPheMinhHuu/
│       ├── Controllers/
│       ├── Services/
│       ├── Repositories/
│       ├── Interfaces/
│       ├── Models/
│       ├── DTOs/
│       ├── Data/
│       ├── Migrations/
│       └── ...
│
└── 📁 capheminhhuu.ui/                 # 🎨 FRONTEND (React 18 + Vite)
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   ├── layouts/
    │   └── utils/
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ PHẦN 1: BACKEND (ASP.NET Core)

### 🌳 Cây thư mục đầy đủ

```
CaPheMinhHuu/
│
├── 📄 CaPheMinhHuu.sln                 # Solution file
│
└── 📁 CaPheMinhHuu/                    # Main project
    │
    ├── 📁 Controllers/                 # 🎮 API Controllers (7 files)
    │   ├── 📄 AuthController.cs                    # 1,635 bytes
    │   ├── 📄 CategoryController.cs                # 1,434 bytes
    │   ├── 📄 IngredientCategoryController.cs      # 1,354 bytes ⚠️
    │   ├── 📄 IngredientController.cs              # 2,195 bytes
    │   ├── 📄 ProductController.cs                 # 2,819 bytes
    │   ├── 📄 RecipeController.cs                  # 1,709 bytes
    │   └── 📄 WeatherForecastController.cs         # 1,079 bytes ⚠️
    │
    ├── 📁 Services/                    # 💼 Business Logic
    │   └── 📁 Implements/              # (5 files)
    │       ├── 📄 AuthService.cs                   # 2,638 bytes
    │       ├── 📄 CategoryService.cs               # 1,570 bytes
    │       ├── 📄 IngredientService.cs             # 8,558 bytes ⭐
    │       ├── 📄 ProductService.cs                # 1,811 bytes
    │       └── 📄 RecipeService.cs                 # 2,179 bytes
    │
    ├── 📁 Repositories/                # 🗄️ Data Access
    │   └── 📁 Implements/              # (7 files)
    │       ├── 📄 CategoryRepository.cs            # 1,484 bytes
    │       ├── 📄 IngredientRepository.cs          # 1,638 bytes
    │       ├── 📄 IngredientUnitRepository.cs      # 1,798 bytes
    │       ├── 📄 InventoryBatchRepository.cs      # 1,883 bytes
    │       ├── 📄 ProductRepository.cs             # 1,132 bytes
    │       ├── 📄 RecipeRepository.cs              # 1,458 bytes
    │       └── 📄 UserRepository.cs                # 878 bytes
    │
    ├── 📁 Interfaces/                  # 📋 Contracts (12 files)
    │   ├── 📄 IAuthService.cs
    │   ├── 📄 ICategoryRepository.cs
    │   ├── 📄 ICategoryService.cs
    │   ├── 📄 IIngredientRepository.cs
    │   ├── 📄 IIngredientService.cs
    │   ├── 📄 IIngredientUnitRepository.cs
    │   ├── 📄 IInventoryBatchRepository.cs
    │   ├── 📄 IProductRepository.cs
    │   ├── 📄 IProductService.cs
    │   ├── 📄 IRecipeRepository.cs
    │   ├── 📄 IRecipeService.cs
    │   └── 📄 IUserRepository.cs
    │
    ├── 📁 Models/                      # 🏗️ Entity Models (11 files)
    │   ├── 📄 BaseEntity.cs                        # 463 bytes
    │   ├── 📄 Category.cs                          # 489 bytes
    │   ├── 📄 Ingredient.cs                        # 1,115 bytes
    │   ├── 📄 IngredientCategory.cs                # 489 bytes
    │   ├── 📄 IngredientUnit.cs                    # 572 bytes ⚠️
    │   ├── 📄 InventoryBatch.cs                    # 963 bytes ⚠️
    │   ├── 📄 Order.cs                             # 690 bytes
    │   ├── 📄 OrderItem.cs                         # 433 bytes ⚠️
    │   ├── 📄 Product.cs                           # 1,055 bytes
    │   ├── 📄 Recipe.cs                            # 698 bytes
    │   └── 📄 User.cs                              # 476 bytes
    │
    ├── 📁 DTOs/                        # 📦 Data Transfer Objects
    │   │
    │   ├── 📁 Auth/
    │   │   ├── 📄 LoginRequest.cs
    │   │   └── 📄 LoginResponse.cs
    │   │
    │   ├── 📁 Category/
    │   │   ├── 📄 CategoryCreateDto.cs
    │   │   ├── 📄 CategoryUpdateDto.cs
    │   │   └── 📄 CategoryViewDto.cs
    │   │
    │   ├── 📁 Product/
    │   │   ├── 📄 ProductCreateDto.cs
    │   │   ├── 📄 ProductUpdateDto.cs
    │   │   └── 📄 ProductViewDto.cs
    │   │
    │   ├── 📁 Ingredient/
    │   │   ├── 📄 IngredientCreateDto.cs
    │   │   ├── 📄 IngredientUpdateDto.cs
    │   │   ├── 📄 IngredientViewDto.cs
    │   │   ├── 📄 IngredientUnitDto.cs
    │   │   └── 📄 InventoryBatchDto.cs
    │   │
    │   ├── 📁 Recipe/
    │   │   ├── 📄 RecipeCreateDto.cs
    │   │   ├── 📄 RecipeDetailDto.cs
    │   │   └── 📄 RecipeViewDto.cs
    │   │
    │   └── 📁 [6 folders khác...]
    │
    ├── 📁 Data/                        # 🗃️ Database Context
    │   └── 📄 ApplicationDbContext.cs              # 6,143 bytes
    │
    ├── 📁 Migrations/                  # 🔄 EF Core Migrations (21 files)
    │   ├── 📄 20251118081156_InitialCreate.cs
    │   ├── 📄 20251118081156_InitialCreate.Designer.cs
    │   ├── 📄 20251118083233_AddUserDatHang.cs
    │   ├── 📄 20251118083233_AddUserDatHang.Designer.cs
    │   ├── 📄 20251119061812_AddCategoryAndProductDetails.cs
    │   ├── 📄 20251119061812_AddCategoryAndProductDetails.Designer.cs
    │   ├── 📄 20251124070256_AddBOMTables.cs
    │   ├── 📄 20251124070256_AddBOMTables.Designer.cs
    │   ├── 📄 20251124075811_AddAuditFields.cs
    │   ├── 📄 20251124075811_AddAuditFields.Designer.cs
    │   ├── 📄 20251124081114_ConfigBOMAndAudit.cs
    │   ├── 📄 20251124081114_ConfigBOMAndAudit.Designer.cs
    │   ├── 📄 20251125064420_AddIngredientGroup.cs
    │   ├── 📄 20251125064420_AddIngredientGroup.Designer.cs
    │   ├── 📄 20251128032642_UpdateLogicKho.cs
    │   ├── 📄 20251128032642_UpdateLogicKho.Designer.cs
    │   ├── 📄 20251128081850_AddDateToIngredient.cs
    │   ├── 📄 20251128081850_AddDateToIngredient.Designer.cs
    │   ├── 📄 20251203031057_AddPackagingInfo.cs
    │   ├── 📄 20251203031057_AddPackagingInfo.Designer.cs
    │   └── 📄 ApplicationDbContextModelSnapshot.cs
    │
    ├── 📁 wwwroot/                     # 🌐 Static Files
    │   └── 📁 uploads/
    │       └── 📁 products/
    │           ├── 🖼️ product1.jpg
    │           ├── 🖼️ product2.jpg
    │           └── 🖼️ ...
    │
    ├── 📁 Properties/
    │   └── 📄 launchSettings.json
    │
    ├── 📁 bin/                         # Build output
    ├── 📁 obj/                         # Build intermediate
    │
    ├── 📄 Program.cs                               # 4,199 bytes
    ├── 📄 appsettings.json                         # 472 bytes
    ├── 📄 appsettings.Development.json             # 127 bytes
    ├── 📄 CaPheMinhHuu.csproj                      # 1,034 bytes
    ├── 📄 CaPheMinhHuu.http                        # 137 bytes
    └── 📄 WeatherForecast.cs                       # 292 bytes ⚠️
```

---

## 🎨 PHẦN 2: FRONTEND (React + Vite)

### 🌳 Cây thư mục đầy đủ

```
capheminhhuu.ui/
│
├── 📁 node_modules/                    # 📦 Dependencies (~1000+ packages)
│   ├── react/
│   ├── react-dom/
│   ├── @mui/material/
│   ├── axios/
│   ├── vite/
│   └── ...
│
├── 📁 public/                          # 🌐 Static Assets
│   └── 🖼️ vite.svg
│
├── 📁 src/                             # 💻 Source Code
│   │
│   ├── 📁 pages/                       # 📄 Pages (5 files)
│   │   ├── 📄 Login.jsx                            # Đăng nhập
│   │   ├── 📄 QuanLyDanhMuc.jsx                    # Quản lý danh mục
│   │   ├── 📄 QuanLySanPham.jsx                    # Quản lý sản phẩm
│   │   ├── 📄 QuanLyNguyenLieu.jsx                 # Quản lý nguyên liệu ⭐
│   │   └── 📄 QuanLyCongThuc.jsx                   # Quản lý công thức
│   │
│   ├── 📁 components/                  # 🧩 Components (7 files)
│   │   ├── 📄 Header.jsx                           # Page header
│   │   ├── 📄 Sidebar.jsx                          # Navigation menu
│   │   ├── 📄 ModalAddCategory.jsx                 # Modal thêm danh mục
│   │   ├── 📄 ModalAddProduct.jsx                  # Modal thêm sản phẩm
│   │   ├── 📄 ModalAddIngredient.jsx               # Modal thêm nguyên liệu
│   │   ├── 📄 ModalEditIngredient.jsx              # Modal sửa nguyên liệu
│   │   └── 📄 ModalRecipe.jsx                      # Modal công thức
│   │
│   ├── 📁 services/                    # 🔌 API Services (5 files)
│   │   ├── 📄 authService.js                       # Authentication API
│   │   ├── 📄 categoryService.js                   # Category API
│   │   ├── 📄 productService.js                    # Product API
│   │   ├── 📄 ingredientService.js                 # Ingredient API
│   │   └── 📄 recipeService.js                     # Recipe API
│   │
│   ├── 📁 layouts/                     # 🎨 Layouts (1 file)
│   │   └── 📄 MainLayout.jsx                       # Main layout wrapper
│   │
│   ├── 📁 utils/                       # 🛠️ Utilities (1 file)
│   │   └── 📄 axiosCustomize.js                    # Axios interceptor
│   │
│   ├── 📁 assets/                      # 🖼️ Assets
│   │   └── 📄 react.svg
│   │
│   ├── 📄 App.jsx                                  # 1,082 bytes
│   ├── 📄 main.jsx                                 # 471 bytes
│   └── 📄 index.css                                # 22 bytes
│
├── 📄 index.html                                   # 364 bytes
├── 📄 package.json                                 # 964 bytes
├── 📄 package-lock.json                            # 159,221 bytes
├── 📄 vite.config.js                               # 161 bytes
├── 📄 tailwind.config.js                           # 191 bytes
├── 📄 postcss.config.js                            # 142 bytes
├── 📄 eslint.config.js                             # 758 bytes
├── 📄 .gitignore                                   # 253 bytes
└── 📄 README.md                                    # 1,157 bytes
```

---

## 📊 SƠ ĐỒ QUAN HỆ GIỮA CÁC THÀNH PHẦN

### Backend Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    (React Frontend)                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS + JWT
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLERS                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │AuthController│  │CategoryCtrl  │  │ProductCtrl   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐      │
│  │IngredientCtrl│  │RecipeCtrl    │  │IngredCatCtrl │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ Dependency Injection
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │AuthService   │  │CategorySvc   │  │ProductSvc    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│  ┌──────┴───────┐  ┌──────┴───────┐                        │
│  │IngredientSvc │  │RecipeService │                        │
│  └──────────────┘  └──────────────┘                        │
└────────────────────────┬────────────────────────────────────┘
                         │ Data Access
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   REPOSITORIES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │UserRepo      │  │CategoryRepo  │  │ProductRepo   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐      │
│  │IngredientRepo│  │IngredUnitRepo│  │InvBatchRepo  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│  ┌──────┴───────┐                                           │
│  │RecipeRepo    │                                           │
│  └──────────────┘                                           │
└────────────────────────┬────────────────────────────────────┘
                         │ Entity Framework Core
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ApplicationDbContext                           │
│                  (EF Core)                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    ┌─────────┐
                    │SQL Server│
                    └─────────┘
```

---

### Frontend Component Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      index.html                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      main.jsx                               │
│                   (Entry Point)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       App.jsx                               │
│                  (React Router)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MainLayout.jsx                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Sidebar.jsx  │  Header.jsx  │  Content Area        │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    PAGES     │  │  COMPONENTS  │  │   SERVICES   │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ Login        │  │ Modals       │  │ authService  │
│ QuanLySP     │  │ Header       │  │ categorySvc  │
│ QuanLyNL     │  │ Sidebar      │  │ productSvc   │
│ QuanLyDM     │  │ ...          │  │ ingredientSvc│
│ QuanLyCT     │  │              │  │ recipeService│
└──────┬───────┘  └──────────────┘  └──────┬───────┘
       │                                    │
       └────────────────┬───────────────────┘
                        │
                        ▼
                ┌───────────────┐
                │axiosCustomize │
                │ (Interceptor) │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │  Backend API  │
                └───────────────┘
```

---

## 📈 THỐNG KÊ CHI TIẾT

### Backend Files Count

```
Controllers/        7 files
Services/           5 files
Repositories/       7 files
Interfaces/        12 files
Models/            11 files
DTOs/              30+ files
Data/               1 file
Migrations/        21 files
─────────────────────────────
TỔNG:             ~94 files
```

### Frontend Files Count

```
pages/              5 files
components/         7 files
services/           5 files
layouts/            1 file
utils/              1 file
─────────────────────────────
TỔNG:              19 files
```

---

## 🎯 LEGEND (Chú thích)

### Biểu tượng

- 📁 Folder (Thư mục)
- 📄 File (Tệp tin)
- 🖼️ Image (Hình ảnh)
- ⭐ Important (Quan trọng)
- ⚠️ Warning (Cảnh báo - cần sửa)
- ✅ OK (Hoàn chỉnh)
- ❌ Error (Lỗi)

### Màu sắc logic

- 🎮 Controllers - API endpoints
- 💼 Services - Business logic
- 🗄️ Repositories - Data access
- 📋 Interfaces - Contracts
- 🏗️ Models - Entities
- 📦 DTOs - Data transfer
- 🗃️ Data - DbContext
- 🔄 Migrations - Database changes
- 🌐 Static - wwwroot
- 📄 Pages - React pages
- 🧩 Components - React components
- 🔌 Services - API calls
- 🎨 Layouts - Page layouts
- 🛠️ Utils - Utilities

---

## ⚠️ VẤN ĐỀ CẦN LƯU Ý

### Backend

1. **IngredientCategoryController.cs** ⚠️
   - Code trùng lặp
   - Không tuân thủ N-Tier
   - Cần sửa gấp

2. **WeatherForecastController.cs** ⚠️
   - File template
   - Nên xóa

3. **IngredientUnit.cs** ⚠️
   - Không kế thừa BaseEntity
   - Thiếu audit fields

4. **InventoryBatch.cs** ⚠️
   - IsDeleted trùng lặp
   - Conflict với BaseEntity

5. **OrderItem.cs** ⚠️
   - Không kế thừa BaseEntity
   - Thiếu audit fields

### Frontend

1. **Tất cả đều OK** ✅
   - Cấu trúc chuẩn
   - Components tái sử dụng tốt
   - Services gọi API đúng

---

## 📝 GHI CHÚ

### Backend Highlights

- **File lớn nhất:** IngredientService.cs (8,558 bytes)
- **Logic phức tạp nhất:** Ingredient module (Units + Batches + FIFO)
- **Migrations:** 10 migrations chính + 10 designers + 1 snapshot
- **Total Controllers:** 7 (5 OK, 1 cần sửa, 1 nên xóa)

### Frontend Highlights

- **Page phức tạp nhất:** QuanLyNguyenLieu.jsx
- **Component quan trọng:** axiosCustomize.js (JWT interceptor)
- **UI Framework:** Material-UI v5 + Tailwind CSS
- **Build Tool:** Vite (Fast HMR)

---

**Người tạo:** AI Assistant  
**Ngày:** 09/12/2025  
**Phiên bản:** 1.0 - Đầy đủ  
**Trạng thái:** ✅ Hoàn chỉnh
