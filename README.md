# CaPheMinhHuu — Cấu Trúc Dự Án (Đã cập nhật sau N-Tier refactor)

> **Hệ thống POS quán cà phê** — Báo cáo tốt nghiệp 2026
> ASP.NET Core 8 + React Vite + SQL Server
> **Cập nhật:** 2026-05-04 — ApplicationDbContext chỉ tồn tại trong Repositories

---

## 🔒 N-Tier Dependency Rule

```
✅ Controller  →  IService       (không biết DbContext)
✅ Service     →  IRepository    (không biết DbContext)
✅ Filter      →  IRepository    (không inject DbContext trực tiếp)
✅ Repository  →  DbContext      (DUY NHẤT được dùng ApplicationDbContext)
```

---

## 🔙 Backend — Cây thư mục

```
CaPheMinhHuu/
├── Program.cs                             ← DI, middleware pipeline
├── appsettings.json
│
├── Controllers/ (11)
│   ├── AuthController.cs                  ← Login Admin/Staff, Refresh, ChangePassword
│   ├── DashboardController.cs
│   ├── CategoryController.cs / ProductController.cs
│   ├── IngredientController.cs            ← CRUD + lô kho FEFO
│   ├── IngredientCategoryController.cs
│   ├── RecipeController.cs                ← BOM
│   ├── OrderController.cs                 ← Tạo đơn + cập nhật status
│   ├── TableController.cs / ShiftController.cs
│   └── StaffController.cs
│
├── DTOs/ (12 module)
│   ├── Auth/ Category/ Dashboard/ Email/
│   ├── Ingredient/ IngredientCategory/ Order/
│   └── Product/ Recipe/ Shift/ Staff/ Table/
│
├── Models/ (23)
│   ├── BaseEntity.cs                      ← Id, CreatedDate, UpdatedDate, IsDeleted
│   ├── User.cs / Product.cs / Category.cs
│   ├── Order.cs / OrderItem.cs
│   ├── Table.cs / Area.cs / Shift.cs
│   ├── Ingredient.cs / IngredientCategory.cs / IngredientUnit.cs
│   ├── InventoryBatch.cs                  ← FEFO
│   ├── Recipe.cs                          ← Product ↔ Ingredient
│   ├── RefreshToken.cs / LoginHistory.cs / AuditLog.cs
│   └── Payment.cs / Coupon.cs / OtpCode.cs / Reservation.cs / RequestTicket.cs / HolidayConfig.cs
│
├── Interfaces/ (29)
│   │
│   ├── REPOSITORY (16):
│   │   IRepository.cs (generic base)
│   │   IUserRepository.cs                 ← GetByUsername, GetById, Add, Update, SaveChanges, GetStaffList
│   │   ICategoryRepository.cs / IProductRepository.cs
│   │   IIngredientRepository.cs / IIngredientCategoryRepository.cs / IIngredientUnitRepository.cs
│   │   IInventoryBatchRepository.cs       ← GetAvailableFIFOAsync, GetTotalStockAsync, BeginTransaction
│   │   IRecipeRepository.cs / IOrderRepository.cs
│   │   ITableRepository.cs / IShiftRepository.cs
│   │   IRefreshTokenRepository.cs         ← GetActiveByTokenAsync (Include User)
│   │   ILoginHistoryRepository.cs / IAuditLogRepository.cs (AddAsync, append-only)
│   │   IDashboardRepository.cs            ← GetRevenueSum, GetOrderCount, GetLowStock, GetTopProducts
│   │
│   └── SERVICE (13):
│       IAuthService.cs / ICategoryService.cs / IDashboardService.cs / IEmailService.cs
│       IIngredientCategoryService.cs / IIngredientService.cs / IOrderService.cs
│       IOtpService.cs / IProductService.cs / IRecipeService.cs
│       IShiftService.cs / IStaffService.cs / ITableService.cs
│
├── Services/Implements/ (12 + 1 filter)
│   ├── AuthService.cs                     ← inject IRefreshTokenRepo + ILoginHistoryRepo
│   ├── DashboardService.cs                ← inject IDashboardRepository
│   ├── CategoryService.cs / ProductService.cs / RecipeService.cs
│   ├── IngredientService.cs               ← FEFO batch + auto trừ kho
│   ├── IngredientCategoryService.cs
│   ├── OrderService.cs                    ← CheckStock + DeductStock
│   ├── ShiftService.cs                    ← Z-Report
│   ├── StaffService.cs                    ← inject IUserRepository
│   ├── TableService.cs / EmailService.cs
│   └── AuditLogActionFilter.cs            ← inject IAuditLogRepository (không inject DbContext)
│
├── Repositories/Implements/ (15)
│   │   ApplicationDbContext CHỈ được dùng ở đây
│   ├── UserRepository.cs                  ← GetById, Add, Update, SaveChanges, GetStaffList
│   ├── CategoryRepository.cs / ProductRepository.cs
│   ├── IngredientRepository.cs / IngredientCategoryRepository.cs / IngredientUnitRepository.cs
│   ├── InventoryBatchRepository.cs        ← GetAvailableFIFOAsync, GetTotalStockAsync, BeginTransaction
│   ├── RecipeRepository.cs / OrderRepository.cs
│   ├── ShiftRepository.cs / TableRepository.cs
│   ├── RefreshTokenRepository.cs          ← GetActiveByTokenAsync (Include User)
│   ├── LoginHistoryRepository.cs
│   ├── AuditLogRepository.cs              ← Append-only, không QueryFilter
│   └── DashboardRepository.cs             ← LINQ aggregate queries
│
├── Data/
│   └── ApplicationDbContext.cs            ← DbContext + Fluent API + SaveChanges override
│
├── Hubs/
│   ├── KitchenHub.cs                      ← Push đơn → KDS
│   └── ShiftHub.cs                        ← Notify shift events
│
├── Middleware/
│   └── GlobalExceptionMiddleware.cs
│
├── Migrations/
└── wwwroot/images/
```

---

## 🖥️ Frontend — React + Vite

```
capheminhhuu.ui/src/
├── main.jsx / App.jsx / index.css
├── common/
│   ├── components/ProtectedRoute.jsx
│   ├── services/authService.js
│   └── utils/axiosCustomize.js / signalRConnection.js
│
└── modules/
    ├── auth/        PortalSelection, AdminLogin, StaffLogin, ChangePassword
    ├── admin/
    │   ├── components/  Navbar, Sidebar, Modal(Product/Category/Ingredient/Recipe)
    │   ├── pages/       AdminDashboard, QuanLySanPham, QuanLyDanhMuc, QuanLyKho,
    │   │                QuanLyDanhMucNguyenLieu, QuanLyNhanVien, QuanLyCaLamViec,
    │   │                SecurityDashboard
    │   └── services/    dashboardService, productService, categoryService,
    │                    ingredientService, batchService, recipeService, staffService
    ├── cashier/
    │   ├── layout/      LayoutCashier (Shift Gate)
    │   ├── components/  ProductGrid, CategoryTabs, CartPanel, PaymentPanel
    │   ├── pages/       CashierPOS, OrderList, OrderDetail,
    │   │                TableManagement, ShiftOpen, ShiftClose, ShiftReport
    │   └── services/    shiftService, orderService, tableService
    └── kitchen/
        └── pages/KDS_Bep.jsx  (SignalR real-time)
```

---

## 📊 Thống Kê

| Backend | Số lượng |
|---------|---------|
| Controllers | 11 |
| Models | 23 |
| DTOs | 12 modules |
| Interfaces | **29** (16 Repo + 13 Service) |
| Services | 12 + 1 Filter |
| Repositories | **15** |
| SignalR Hubs | 2 |

| Tech | Stack |
|------|-------|
| Backend | ASP.NET Core 8, EF Core 8, SQL Server |
| Auth | JWT 4h + Refresh Token Rotation 7d + BCrypt |
| Real-time | SignalR |
| Frontend | React 18 + Vite + MUI + TailwindCSS + Recharts |
| Security | Rate Limiting, HSTS, Security Headers, Audit Log |
