# 🌳 CÂY SƠ ĐỒ THƯ MỤC DỰ ÁN - HỆ THỐNG QUẢN LÝ QUÁN CÀ PHÊ MINH HỮU

**Ngày cập nhật:** 03/12/2025

---

## 📁 TỔNG QUAN CẤU TRÚC

```
D:\BaoCaoTotNghiep_2026\CaPheMinhHuu\
│
├── 📂 CaPheMinhHuu/                          # BACKEND (.NET Core 8.0 Web API)
│   ├── 📂 .config/                           # Cấu hình IDE
│   ├── 📂 .vs/                               # Visual Studio settings
│   ├── 📄 CaPheMinhHuu.sln                   # Solution file
│   │
│   └── 📂 CaPheMinhHuu/                      # Main Project
│       ├── 📄 CaPheMinhHuu.csproj            # Project file
│       ├── 📄 Program.cs                     # Entry point + DI Configuration
│       ├── 📄 appsettings.json               # App configuration
│       ├── 📄 appsettings.Development.json   # Dev environment config
│       │
│       ├── 📂 Controllers/                   # API Controllers (7 files)
│       │   ├── 📄 AuthController.cs          # Login/Register
│       │   ├── 📄 CategoryController.cs      # Quản lý Danh mục
│       │   ├── 📄 ProductController.cs       # Quản lý Sản phẩm
│       │   ├── 📄 IngredientController.cs    # Quản lý Nguyên liệu
│       │   ├── 📄 IngredientCategoryController.cs  # Nhóm nguyên liệu
│       │   ├── 📄 RecipeController.cs        # Công thức pha chế
│       │   └── 📄 WeatherForecastController.cs  # Demo controller
│       │
│       ├── 📂 Models/                        # Domain Models (9 files)
│       │   ├── 📄 BaseEntity.cs              # Base class (Audit fields)
│       │   ├── 📄 User.cs                    # Người dùng
│       │   ├── 📄 Category.cs                # Danh mục sản phẩm
│       │   ├── 📄 Product.cs                 # Sản phẩm
│       │   ├── 📄 Ingredient.cs              # Nguyên liệu
│       │   ├── 📄 IngredientCategory.cs      # Nhóm nguyên liệu
│       │   ├── 📄 Recipe.cs                  # Công thức
│       │   ├── 📄 RecipeIngredient.cs        # Chi tiết công thức
│       │   └── 📄 UnitConversion.cs          # Quy đổi đơn vị
│       │
│       ├── 📂 DTOs/                          # Data Transfer Objects (10 files)
│       │   ├── 📂 Auth/
│       │   │   ├── 📄 LoginRequest.cs
│       │   │   └── 📄 LoginResponse.cs
│       │   ├── 📂 Category/
│       │   │   ├── 📄 CategoryDto.cs
│       │   │   └── 📄 CategoryCreateDto.cs
│       │   ├── 📂 Product/
│       │   │   ├── 📄 ProductViewDto.cs
│       │   │   └── 📄 ProductCreateDto.cs
│       │   ├── 📂 Ingredient/
│       │   │   ├── 📄 IngredientViewDto.cs
│       │   │   └── 📄 IngredientCreateDto.cs
│       │   └── 📂 Recipe/
│       │       ├── 📄 RecipeViewDto.cs
│       │       └── 📄 RecipeCreateDto.cs
│       │
│       ├── 📂 Interfaces/                    # Service & Repository Interfaces (10 files)
│       │   ├── 📄 IAuthService.cs
│       │   ├── 📄 IUserRepository.cs
│       │   ├── 📄 ICategoryService.cs
│       │   ├── 📄 ICategoryRepository.cs
│       │   ├── 📄 IProductService.cs
│       │   ├── 📄 IProductRepository.cs
│       │   ├── 📄 IIngredientService.cs
│       │   ├── 📄 IIngredientRepository.cs
│       │   ├── 📄 IRecipeService.cs
│       │   └── 📄 IRecipeRepository.cs
│       │
│       ├── 📂 Services/                      # Business Logic (5 files)
│       │   ├── 📄 AuthService.cs             # Authentication logic
│       │   ├── 📄 CategoryService.cs         # Category business logic
│       │   ├── 📄 ProductService.cs          # Product business logic
│       │   ├── 📄 IngredientService.cs       # Ingredient business logic
│       │   └── 📄 RecipeService.cs           # Recipe business logic
│       │
│       ├── 📂 Repositories/                  # Data Access Layer (5 files)
│       │   ├── 📄 UserRepository.cs          # User data access
│       │   ├── 📄 CategoryRepository.cs      # Category data access
│       │   ├── 📄 ProductRepository.cs       # Product data access
│       │   ├── 📄 IngredientRepository.cs    # Ingredient data access
│       │   └── 📄 RecipeRepository.cs        # Recipe data access
│       │
│       ├── 📂 Data/                          # Database Context
│       │   └── 📄 ApplicationDbContext.cs    # EF Core DbContext
│       │
│       ├── 📂 Migrations/                    # EF Core Migrations (10 migrations)
│       │   ├── 📄 20251118081156_InitialCreate.cs
│       │   ├── 📄 20251118083233_AddUserDatHang.cs
│       │   ├── 📄 20251119061812_AddCategoryAndProductDetails.cs
│       │   ├── 📄 20251124070256_AddBOMTables.cs
│       │   ├── 📄 20251124075811_AddAuditFields.cs
│       │   ├── 📄 20251124081114_ConfigBOMAndAudit.cs
│       │   ├── 📄 20251125064420_AddIngredientGroup.cs
│       │   ├── 📄 20251128032642_UpdateLogicKho.cs
│       │   ├── 📄 20251128081850_AddDateToIngredient.cs
│       │   └── 📄 ApplicationDbContextModelSnapshot.cs
│       │
│       ├── 📂 Properties/
│       │   └── 📄 launchSettings.json        # Debug settings
│       │
│       ├── 📂 wwwroot/                       # Static files (Images)
│       │   └── 📂 images/
│       │       └── 📂 products/
│       │
│       ├── 📂 bin/                           # Build output
│       └── 📂 obj/                           # Intermediate files
│
├── 📂 capheminhhuu.ui/                       # FRONTEND (React + Vite)
│   ├── 📄 package.json                       # NPM dependencies
│   ├── 📄 package-lock.json                  # Lock file
│   ├── 📄 vite.config.js                     # Vite configuration
│   ├── 📄 tailwind.config.js                 # Tailwind CSS config
│   ├── 📄 postcss.config.js                  # PostCSS config
│   ├── 📄 eslint.config.js                   # ESLint rules
│   ├── 📄 index.html                         # HTML entry point
│   ├── 📄 README.md                          # Frontend documentation
│   ├── 📄 .gitignore                         # Git ignore rules
│   │
│   ├── 📂 node_modules/                      # NPM packages
│   │
│   ├── 📂 public/                            # Public assets
│   │   └── 📄 vite.svg                       # Vite logo
│   │
│   └── 📂 src/                               # Source code
│       ├── 📄 main.jsx                       # React entry point
│       ├── 📄 App.jsx                        # Root component
│       ├── 📄 index.css                      # Global styles
│       │
│       ├── 📂 assets/                        # Static assets
│       │   └── 📄 react.svg                  # React logo
│       │
│       ├── 📂 components/                    # Reusable Components (6 files)
│       │   ├── 📄 Navbar.jsx                 # Top navigation bar
│       │   ├── 📄 Sidebar.jsx                # Left sidebar menu
│       │   ├── 📄 ModalAddCategory.jsx       # Modal thêm danh mục
│       │   ├── 📄 ModalAddProduct.jsx        # Modal thêm sản phẩm
│       │   ├── 📄 ModalAddIngredient.jsx     # Modal thêm nguyên liệu
│       │   └── 📄 ModalRecipe.jsx            # Modal cấu hình công thức
│       │
│       ├── 📂 layouts/                       # Layout Components
│       │   └── 📄 LayoutAdmin.jsx            # Admin layout (Navbar + Sidebar)
│       │
│       ├── 📂 pages/                         # Page Components (5 files)
│       │   ├── 📄 DangNhap.jsx               # Login page
│       │   ├── 📄 QuanLyDanhMuc.jsx          # Quản lý Danh mục
│       │   ├── 📄 QuanLySanPham.jsx          # Quản lý Sản phẩm
│       │   ├── 📄 QuanLyKho.jsx              # Quản lý Kho nguyên liệu
│       │   └── 📄 KDS_Bep.jsx                # Màn hình bếp (KDS)
│       │
│       ├── 📂 services/                      # API Services (5 files)
│       │   ├── 📄 authService.js             # Authentication API
│       │   ├── 📄 categoryService.js         # Category API
│       │   ├── 📄 productService.js          # Product API
│       │   ├── 📄 ingredientService.js       # Ingredient API
│       │   └── 📄 recipeService.js           # Recipe API
│       │
│       └── 📂 utils/                         # Utilities
│           └── 📄 axiosCustomize.js          # Axios interceptor (Token refresh)
│
├── 📄 CSDL.docx                              # Tài liệu Cơ sở dữ liệu
├── 📄 capheminhhuu.docx                      # Tài liệu dự án
├── 📄 CaPheMinhHuu_Project.mpp               # MS Project Plan
├── 📄 MODAL_IMPROVEMENTS_REPORT.md           # Báo cáo cải thiện Modal
├── 📄 TestReport_FashionStore.csv            # Test report (mẫu)
├── 📄 trasuatraden.jpg                       # Hình ảnh sản phẩm mẫu
├── 📄 DANH_GIA_DU_AN_TOT_NGHIEP.md          # Báo cáo đánh giá dự án (MỚI)
└── 📄 CAY_SO_DO_THU_MUC.md                  # File này

```

---

## 📊 THỐNG KÊ DỰ ÁN

### **Backend (.NET Core)**
| Thành phần | Số lượng | Trạng thái |
|------------|----------|------------|
| Controllers | 7 | ✅ Hoàn thành |
| Models | 9 | ✅ Hoàn thành |
| DTOs | 10 | ✅ Hoàn thành |
| Services | 5 | ✅ Hoàn thành |
| Repositories | 5 | ✅ Hoàn thành |
| Interfaces | 10 | ✅ Hoàn thành |
| Migrations | 10 | ✅ Hoàn thành |

**Tổng:** 56 files C#

### **Frontend (React)**
| Thành phần | Số lượng | Trạng thái |
|------------|----------|------------|
| Pages | 5 | ⚠️ Thiếu POS |
| Components | 6 | ✅ Hoàn thành |
| Services | 5 | ✅ Hoàn thành |
| Layouts | 1 | ✅ Hoàn thành |
| Utils | 1 | ✅ Hoàn thành |

**Tổng:** 18 files JSX/JS

### **Tài liệu**
| Loại | Số lượng | Trạng thái |
|------|----------|------------|
| Word Documents | 2 | ✅ Có |
| MS Project | 1 | ✅ Có |
| Markdown Reports | 3 | ✅ Có |
| Figma Mockup | 0 | ❌ Thiếu |
| Test Reports | 1 | ⚠️ Mẫu |

---

## 🗂️ CHI TIẾT CHỨC NĂNG THEO THƯ MỤC

### **1. Backend Controllers (API Endpoints)**

#### **AuthController.cs**
```
POST   /api/auth/login          # Đăng nhập
POST   /api/auth/register       # Đăng ký
POST   /api/auth/refresh        # Refresh token
```

#### **CategoryController.cs**
```
GET    /api/categories          # Lấy danh sách danh mục
GET    /api/categories/{id}     # Lấy chi tiết danh mục
POST   /api/categories          # Tạo danh mục mới
PUT    /api/categories/{id}     # Cập nhật danh mục
DELETE /api/categories/{id}     # Xóa danh mục
```

#### **ProductController.cs**
```
GET    /api/products            # Lấy danh sách sản phẩm
GET    /api/products/{id}       # Lấy chi tiết sản phẩm
POST   /api/products            # Tạo sản phẩm mới
PUT    /api/products/{id}       # Cập nhật sản phẩm
DELETE /api/products/{id}       # Xóa sản phẩm
POST   /api/products/{id}/upload-image  # Upload ảnh
```

#### **IngredientController.cs**
```
GET    /api/ingredients         # Lấy danh sách nguyên liệu
GET    /api/ingredients/{id}    # Lấy chi tiết nguyên liệu
POST   /api/ingredients         # Tạo nguyên liệu mới
PUT    /api/ingredients/{id}    # Cập nhật nguyên liệu
DELETE /api/ingredients/{id}    # Xóa nguyên liệu
```

#### **RecipeController.cs**
```
GET    /api/recipes             # Lấy danh sách công thức
GET    /api/recipes/product/{productId}  # Lấy công thức theo sản phẩm
POST   /api/recipes             # Tạo công thức mới
PUT    /api/recipes/{id}        # Cập nhật công thức
DELETE /api/recipes/{id}        # Xóa công thức
```

---

### **2. Frontend Pages (Màn hình)**

#### **DangNhap.jsx** - Trang đăng nhập
- ✅ Form login (Username/Password)
- ✅ JWT Token storage
- ✅ Redirect to Admin

#### **QuanLyDanhMuc.jsx** - Quản lý Danh mục
- ✅ Danh sách danh mục (Table)
- ✅ Thêm/Sửa/Xóa danh mục
- ✅ Modal thêm danh mục (Gradient Blue)

#### **QuanLySanPham.jsx** - Quản lý Sản phẩm
- ✅ Danh sách sản phẩm (Grid/Table)
- ✅ Thêm/Sửa/Xóa sản phẩm
- ✅ Upload ảnh sản phẩm
- ✅ Modal thêm sản phẩm (Gradient Pink)

#### **QuanLyKho.jsx** - Quản lý Kho nguyên liệu
- ✅ Danh sách nguyên liệu (Table)
- ✅ Thêm/Sửa/Xóa nguyên liệu
- ✅ Cấu hình công thức (BOM)
- ✅ Modal thêm nguyên liệu (Gradient Purple)
- ✅ Modal công thức (Gradient Pink-Yellow)

#### **KDS_Bep.jsx** - Màn hình bếp
- ⚠️ Đang trong quá trình phát triển
- ❌ Chưa có SignalR Real-time
- ❌ Chưa có cập nhật trạng thái món

---

### **3. Database Models (Entities)**

#### **BaseEntity.cs** - Base class cho tất cả entities
```csharp
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string UpdatedBy { get; set; }
}
```

#### **User.cs** - Người dùng
```csharp
- Id, Username, Password, FullName, Email, Phone
- Role (Admin/Staff)
- IsActive
```

#### **Category.cs** - Danh mục sản phẩm
```csharp
- Id, Name, Description
- Products (Navigation)
```

#### **Product.cs** - Sản phẩm
```csharp
- Id, Name, Description, Price, ImageUrl
- CategoryId (FK)
- IsAvailable
- Recipes (Navigation)
```

#### **Ingredient.cs** - Nguyên liệu
```csharp
- Id, Name, Unit, Quantity, MinQuantity
- IngredientCategoryId (FK)
- ExpiryDate, ImportDate
- RecipeIngredients (Navigation)
```

#### **Recipe.cs** - Công thức pha chế
```csharp
- Id, ProductId (FK)
- ServingSize
- RecipeIngredients (Navigation)
```

#### **RecipeIngredient.cs** - Chi tiết công thức
```csharp
- RecipeId (FK)
- IngredientId (FK)
- Quantity, Unit
```

---

## 🎨 CÔNG NGHỆ SỬ DỤNG

### **Backend Stack**
```
✅ .NET Core 8.0 Web API
✅ Entity Framework Core 8.0
✅ SQL Server (LocalDB)
✅ JWT Authentication
✅ AutoMapper (DTOs)
✅ Fluent Validation
✅ Swagger/OpenAPI
```

### **Frontend Stack**
```
✅ React 18
✅ Vite (Build tool)
✅ Material-UI (MUI)
✅ Axios (HTTP Client)
✅ React Router DOM
✅ Tailwind CSS
✅ ESLint
```

### **DevOps & Tools**
```
✅ Git/GitHub
✅ Visual Studio 2022
✅ VS Code
✅ MS Project
✅ Postman
⚠️ Docker (Chưa có)
❌ CI/CD (Chưa có)
```

---

## 📈 TIẾN ĐỘ PHÁT TRIỂN

### **Đã hoàn thành (70%)**
- ✅ Thiết kế Database (ERD)
- ✅ Backend API (CRUD cơ bản)
- ✅ Frontend Admin (Quản lý Danh mục, Sản phẩm, Kho)
- ✅ Authentication (JWT)
- ✅ BOM System (Định lượng nguyên liệu)
- ✅ Audit Log (Tự động tracking)

### **Đang làm (15%)**
- 🔄 KDS Bếp (UI đã có, chưa có Real-time)
- 🔄 Product Variants (ERD đã có, chưa implement)

### **Chưa làm (15%)**
- ❌ POS Bán hàng
- ❌ Quản lý Ca làm việc
- ❌ Báo cáo doanh thu
- ❌ Web Order (QR Code)
- ❌ RBAC động
- ❌ Unit Tests
- ❌ Figma Mockup

---

## 🚀 HƯỚNG PHÁT TRIỂN TIẾP THEO

### **Tuần 1: POS Bán hàng**
```
📂 Backend:
├── Models/Order.cs
├── Models/OrderDetail.cs
├── Models/Payment.cs
├── Controllers/OrderController.cs
├── Services/OrderService.cs
└── Repositories/OrderRepository.cs

📂 Frontend:
├── pages/QuanLyBanHang.jsx
├── components/MenuGrid.jsx
├── components/Cart.jsx
├── components/PaymentPanel.jsx
└── services/orderService.js
```

### **Tuần 2: KDS Bếp Real-time**
```
📂 Backend:
├── Hubs/KitchenHub.cs
├── Program.cs (Add SignalR)
└── Controllers/OrderController.cs (Update status)

📂 Frontend:
├── pages/KDS_Bep.jsx (Update with SignalR)
└── utils/signalRConnection.js
```

### **Tuần 3: Quản lý Ca & Báo cáo**
```
📂 Backend:
├── Models/Shift.cs
├── Controllers/ShiftController.cs
├── Services/ShiftService.cs
└── Services/ReportService.cs

📂 Frontend:
├── components/ModalOpenShift.jsx
├── components/ModalCloseShift.jsx
└── pages/BaoCaoCa.jsx
```

---

## 📝 GHI CHÚ

### **Quy ước đặt tên**
- **Backend:** PascalCase (C# convention)
- **Frontend:** camelCase (JavaScript convention)
- **Database:** PascalCase (EF Core convention)
- **API Routes:** kebab-case

### **Cấu trúc N-Tier**
```
Client (React)
    ↓
Controllers (API Endpoints)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Database (SQL Server)
```

### **Luồng dữ liệu**
```
User Input → Component → Service → API → Controller → Service → Repository → Database
                ↑                                                                  ↓
                └──────────────────── Response ←──────────────────────────────────┘
```

---

**Người tạo:** AI Assistant  
**Ngày:** 03/12/2025  
**Phiên bản:** 1.0  
**Trạng thái:** ✅ CẬP NHẬT MỚI NHẤT
