 Đây là cây thư mục dự án (đã bỏ node_modules, bin, obj, .git, Migrations, .vs, dist, wwwroot):

  D:\BaoCaoTotNghiep_2026\CaPheMinhHuu/
  |-- .gitignore
  |-- (các file .md, .docx, .mpp tài liệu...)
  |
  +-- .github/
  |   +-- workflows/
  |
  +-- CaPheMinhHuu/                          ← Backend (.NET 8)
  |   |-- CaPheMinhHuu.sln
  |   +-- .config/
  |   |   |-- dotnet-tools.json
  |   +-- CaPheMinhHuu/
  |       |-- appsettings.json
  |       |-- appsettings.Development.json
  |       |-- CaPheMinhHuu.csproj
  |       |-- Program.cs
  |       |
  |       +-- Controllers/
  |       |   |-- AuthController.cs
  |       |   |-- CategoryController.cs
  |       |   |-- DashboardController.cs
  |       |   |-- IngredientCategoryController.cs
  |       |   |-- IngredientController.cs
  |       |   |-- OrderController.cs
  |       |   |-- ProductController.cs
  |       |   |-- RecipeController.cs
  |       |   |-- ShiftController.cs
  |       |   |-- StaffController.cs
  |       |   |-- TableController.cs
  |       |
  |       +-- Data/
  |       |   |-- ApplicationDbContext.cs
  |       |
  |       +-- DTOs/
  |       |   +-- Auth/
  |       |   |   |-- AdminLoginRequest.cs, LoginRequest.cs, LoginResponse.cs
  |       |   |   |-- ChangePasswordRequest.cs, CreateStaffRequest.cs
  |       |   |   |-- RefreshTokenRequest.cs, StaffLoginRequest.cs
  |       |   |   |-- PasswordValidationAttribute.cs
  |       |   +-- Category/
  |       |   |   |-- CategoryCreateDto.cs, CategoryDto.cs, CategoryUpdateDto.cs
  |       |   +-- Dashboard/
  |       |   |   |-- DashboardStatsDto.cs
  |       |   +-- Email/
  |       |   |   |-- OrderEmailDto.cs, OrderItemInfo.cs
  |       |   +-- Ingredient/
  |       |   |   |-- BatchDto.cs, IngredientCreateDto.cs, IngredientUpdateDto.cs
  |       |   |   |-- IngredientViewDto.cs, StockCheckResult.cs
  |       |   +-- IngredientCategory/
  |       |   |   |-- IngredientCategoryCreateDto.cs, ...UpdateDto.cs, ...ViewDto.cs
  |       |   +-- Order/
  |       |   |   |-- OrderCreateDto.cs, OrderViewDto.cs
  |       |   |   |-- OrderItemDto.cs, OrderItemViewDto.cs
  |       |   +-- Product/
  |       |   |   |-- ProductCreateDto.cs, ProductUpdateDto.cs, ProductViewDto.cs
  |       |   +-- Recipe/
  |       |   |   |-- RecipeCreateDto.cs, RecipeViewDto.cs
  |       |   +-- Shift/
  |       |   |   |-- ShiftOpenDto.cs, ShiftCloseDto.cs, ShiftRejectDto.cs
  |       |   |   |-- ShiftViewDto.cs, ZReportDto.cs
  |       |   +-- Staff/
  |       |   |   |-- UpdateStaffRequest.cs
  |       |   +-- Table/
  |       |       |-- CreateTableDto.cs, UpdateTableDto.cs, TableResponseDto.cs
  |       |
  |       +-- Hubs/
  |       |   |-- KitchenHub.cs
  |       |   |-- ShiftHub.cs
  |       |
  |       +-- Interfaces/
  |       |   |-- IRepository.cs
  |       |   |-- IAuthService.cs, IEmailService.cs, IOtpService.cs
  |       |   |-- ICategoryRepository.cs, ICategoryService.cs
  |       |   |-- IDashboardRepository.cs, IDashboardService.cs
  |       |   |-- IIngredientRepository.cs, IIngredientService.cs
  |       |   |-- IIngredientCategoryRepository.cs, IIngredientCategoryService.cs
  |       |   |-- IIngredientUnitRepository.cs, IInventoryBatchRepository.cs
  |       |   |-- IOrderRepository.cs, IOrderService.cs
  |       |   |-- IProductRepository.cs, IProductService.cs
  |       |   |-- IRecipeRepository.cs, IRecipeService.cs
  |       |   |-- IShiftRepository.cs, IShiftService.cs
  |       |   |-- IStaffService.cs
  |       |   |-- ITableRepository.cs, ITableService.cs
  |       |   |-- IUserRepository.cs, ILoginHistoryRepository.cs
  |       |   |-- IRefreshTokenRepository.cs, IAuditLogRepository.cs
  |       |
  |       +-- Middleware/
  |       |   |-- GlobalExceptionMiddleware.cs
  |       |
  |       +-- Models/
  |       |   |-- BaseEntity.cs
  |       |   |-- User.cs, Area.cs, Table.cs
  |       |   |-- Category.cs, Product.cs, Recipe.cs
  |       |   |-- Ingredient.cs, IngredientCategory.cs, IngredientUnit.cs
  |       |   |-- InventoryBatch.cs
  |       |   |-- Order.cs, OrderItem.cs, Payment.cs
  |       |   |-- Shift.cs
  |       |   |-- AuditLog.cs, LoginHistory.cs, RefreshToken.cs
  |       |   |-- OtpCode.cs, Coupon.cs, HolidayConfig.cs
  |       |   |-- RequestTicket.cs, Reservation.cs
  |       |
  |       +-- Properties/
  |       |   |-- launchSettings.json
  |       |
  |       +-- Repositories/
  |       |   +-- Implements/
  |       |       |-- AuditLogRepository.cs, CategoryRepository.cs
  |       |       |-- DashboardRepository.cs
  |       |       |-- IngredientRepository.cs, IngredientCategoryRepository.cs
  |       |       |-- IngredientUnitRepository.cs, InventoryBatchRepository.cs
  |       |       |-- LoginHistoryRepository.cs, OrderRepository.cs
  |       |       |-- ProductRepository.cs, RecipeRepository.cs
  |       |       |-- RefreshTokenRepository.cs, ShiftRepository.cs
  |       |       |-- TableRepository.cs, UserRepository.cs
  |       |
  |       +-- Services/
  |           +-- Implements/
  |               |-- AuditLogActionFilter.cs, AuthService.cs
  |               |-- CategoryService.cs, DashboardService.cs
  |               |-- EmailService.cs
  |               |-- IngredientService.cs, IngredientCategoryService.cs
  |               |-- OrderService.cs, ProductService.cs, RecipeService.cs
  |               |-- ShiftService.cs, StaffService.cs, TableService.cs
  |
  +-- capheminhhuu.ui/                       ← Frontend (React + Vite)
  |   |-- index.html, package.json, vite.config.js
  |   |-- tailwind.config.js, postcss.config.js, eslint.config.js
  |   +-- public/
  |   |   |-- vite.svg
  |   +-- src/
  |       |-- App.jsx, main.jsx, index.css
  |       +-- assets/
  |       +-- common/
  |       |   +-- components/
  |       |   |   |-- ProtectedRoute.jsx
  |       |   +-- context/
  |       |   |   |-- ThemeContext.jsx
  |       |   +-- services/
  |       |   |   |-- authService.js
  |       |   +-- utils/
  |       |       |-- axiosCustomize.js
  |       |       |-- signalRConnection.js
  |       +-- modules/
  |           +-- admin/
  |           |   +-- components/
  |           |   |   |-- ModalAddBatch.jsx, ModalAddCategory.jsx
  |           |   |   |-- ModalAddIngredient.jsx, ModalAddIngredientCategory.jsx
  |           |   |   |-- ModalAddProduct.jsx, ModalEditIngredient.jsx
  |           |   |   |-- ModalIngredientDetail.jsx, ModalRecipe.jsx
  |           |   |   |-- Navbar.jsx, Sidebar.jsx
  |           |   +-- layout/
  |           |   |   |-- LayoutAdmin.jsx
  |           |   +-- pages/
  |           |   |   |-- AdminDashboard.jsx
  |           |   |   |-- QuanLyCaLamViec.jsx, QuanLyDanhMuc.jsx
  |           |   |   |-- QuanLyDanhMucNguyenLieu.jsx, QuanLyKho.jsx
  |           |   |   |-- QuanLyNhanVien.jsx, QuanLySanPham.jsx
  |           |   |   |-- SecurityDashboard.jsx
  |           |   +-- services/
  |           |       |-- batchService.js, categoryService.js
  |           |       |-- dashboardService.js, ingredientCategoryService.js
  |           |       |-- ingredientService.js, productService.js
  |           |       |-- recipeService.js, staffService.js
  |           |
  |           +-- auth/
  |           |   |-- AdminLogin.jsx, StaffLogin.jsx
  |           |   |-- PortalSelection.jsx, ChangePassword.jsx
  |           |
  |           +-- cashier/
  |           |   +-- components/
  |           |   |   |-- CartPanel.jsx, CategoryTabs.jsx
  |           |   |   |-- PaymentPanel.jsx, ProductGrid.jsx
  |           |   +-- layout/
  |           |   |   |-- LayoutCashier.jsx
  |           |   +-- pages/
  |           |   |   |-- CashierPOS.jsx, OrderDetail.jsx, OrderList.jsx
  |           |   |   |-- ShiftOpen.jsx, ShiftClose.jsx, ShiftReport.jsx
  |           |   |   |-- TableManagement.jsx
  |           |   +-- services/
  |           |       |-- orderService.js, shiftService.js, tableService.js
  |           |
  |           +-- kitchen/
  |               +-- pages/
  |                   |-- KDS_Bep.jsx
  |
 

  Tổng quan kiến trúc:
  - Backend (CaPheMinhHuu/): ASP.NET Core 8, pattern Repository + Service + Interface, SignalR Hubs cho kitchen/shift
  realtime.
  - Frontend (capheminhhuu.ui/): React + Vite + Tailwind, chia module theo portal: admin, cashier, kitchen, auth.