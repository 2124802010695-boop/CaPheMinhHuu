using CaPheMinhHuu.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;


namespace CaPheMinhHuu.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // 1. KHAI BÁO CÁC BẢNG (DbSet)
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<IngredientCategory> IngredientCategories { get; set; }
        
        // Các bảng mới cho Kho & BOM
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<IngredientUnit> IngredientUnits { get; set; }
        public DbSet<InventoryBatch> InventoryBatches { get; set; }
        public DbSet<Area> Areas { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<OtpCode> OtpCodes { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<UserCoupon> UserCoupons { get; set; }
        public DbSet<IngredientUsageLog> IngredientUsageLogs { get; set; }
        public DbSet<RecipeVersion> RecipeVersions { get; set; }
        public DbSet<RecipeVersionLine> RecipeVersionLines { get; set; }

        // 2. XỬ LÝ AUDIT LOG (Tự động điền ngày tạo/sửa)
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is BaseEntity && (
                        e.State == EntityState.Added ||
                        e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                var entity = (BaseEntity)entityEntry.Entity;

                if (entityEntry.State == EntityState.Added)
                {
                    entity.CreatedDate = DateTime.UtcNow;
                    entity.IsDeleted = false;
                }
                else
                {
                    entity.UpdatedDate = DateTime.UtcNow;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }

        // 3. CẤU HÌNH DATABASE NÂNG CAO (Fluent API)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>()
               .HasIndex(u => u.Email);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.GoogleId);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Role);
            // LoginHistory indexes
            modelBuilder.Entity<LoginHistory>()
                .HasIndex(l => l.UserId);

            modelBuilder.Entity<LoginHistory>()
                .HasIndex(l => l.LoginTime);
            // --- Cấu hình Product ---
            modelBuilder.Entity<Product>(entity =>
            {
                entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");

                entity.HasOne(p => p.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(p => p.CategoryId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // ========== CẤU HÌNH MỚI: INGREDIENT SYSTEM ==========

            // --- Ingredient (Nguyên liệu) ---
            modelBuilder.Entity<Ingredient>(entity =>
            {
                // Precision cho các trường decimal
                entity.Property(e => e.MinStock).HasPrecision(18, 3);
                entity.Property(e => e.MaxStock).HasPrecision(18, 3);

                // Quan hệ với IngredientCategory
                entity.HasOne(i => i.IngredientCategory)
                      .WithMany(c => c.Ingredients)
                      .HasForeignKey(i => i.IngredientCategoryId)
                      .OnDelete(DeleteBehavior.Restrict); // Không cho xóa Category nếu còn Ingredient

                // Quan hệ với IngredientUnit (1-N)
                entity.HasMany(i => i.Units)
                      .WithOne(u => u.Ingredient)
                      .HasForeignKey(u => u.IngredientId)
                      .OnDelete(DeleteBehavior.Cascade); // Xóa Ingredient → Xóa Units

                // Quan hệ với InventoryBatch (1-N)
                entity.HasMany(i => i.Batches)
                      .WithOne(b => b.Ingredient)
                      .HasForeignKey(b => b.IngredientId)
                      .OnDelete(DeleteBehavior.Cascade); // Xóa Ingredient → Xóa Batches
            });

            // --- IngredientUnit (Đơn vị quy đổi) ---
            modelBuilder.Entity<IngredientUnit>(entity =>
            {
                entity.Property(e => e.ConversionRate).HasPrecision(18, 3);

                // Index để tìm nhanh
                entity.HasIndex(u => new { u.IngredientId, u.UnitName });
            });

            // --- InventoryBatch (Lô hàng) ---
            modelBuilder.Entity<InventoryBatch>(entity =>
            {
                entity.Property(e => e.RowVersion).IsConcurrencyToken()
                      .ValueGeneratedOnAddOrUpdate();
                entity.Property(e => e.CurrentQuantity).HasPrecision(18, 3);
                entity.Property(e => e.InitialQuantity).HasPrecision(18, 3);
                entity.Property(e => e.ImportPricePerBaseUnit).HasPrecision(18, 2);
                entity.Property(e => e.PurchaseQuantity).HasPrecision(18, 3);

                // Index unique cho BatchCode
                entity.HasIndex(b => b.BatchCode).IsUnique();

                // Index để query nhanh
                entity.HasIndex(b => new { b.IngredientId, b.ExpiryDate });

                // FK PurchaseUnit — NoAction vì project dùng soft delete
                // Không bao giờ hard delete IngredientUnit
                // SQL Server constraint chỉ trigger khi hard delete
                entity.HasOne(b => b.PurchaseUnit)
                      .WithMany()
                      .HasForeignKey(b => b.PurchaseUnitId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // --- Cấu hình Recipe (Công thức) ---
            modelBuilder.Entity<Recipe>(entity =>
            {
                // QueryFilter đồng bộ với Product — fix EF Core warning 10622
                entity.HasQueryFilter(r => !r.IsDeleted && !r.Product!.IsDeleted);

                entity.HasIndex(r => new { r.ProductId, r.IngredientId }).IsUnique();
                entity.HasIndex(r => r.ProductId);
                entity.Property(e => e.QuantityRequired).HasColumnType("decimal(18, 4)");
                entity.Property(e => e.YieldFactor).HasColumnType("decimal(5, 4)").HasDefaultValue(1.0m);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.Version).HasDefaultValue(1);

                entity.HasOne(r => r.Product)
                      .WithMany(p => p.Recipes)
                      .HasForeignKey(r => r.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Ingredient)
                      .WithMany()
                      .HasForeignKey(r => r.IngredientId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // --- Cấu hình Order & OrderItem ---
            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");
                entity.HasIndex(o => o.OrderDate); 
                entity.HasIndex(o => o.Status);
                entity.HasOne(o => o.Table)
                        .WithMany(t => t.Orders)
                        .HasForeignKey(o => o.TableId)
                        .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(e => e.PriceAtOrder).HasColumnType("decimal(18, 2)");
            });

            // --- Topping ---
            modelBuilder.Entity<Topping>(entity =>
            {
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.Property(e => e.PortionSize).HasPrecision(18, 3);
                entity.HasQueryFilter(t => !t.IsDeleted);

                entity.HasOne(t => t.Ingredient)
                      .WithMany()
                      .HasForeignKey(t => t.IngredientId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // --- ProductSize ---
            modelBuilder.Entity<ProductSize>(entity =>
            {
                entity.Property(e => e.PriceExtra).HasColumnType("decimal(18,2)");
                entity.Property(e => e.RecipeMultiplier).HasColumnType("decimal(18,2)");
                entity.HasQueryFilter(ps => !ps.IsDeleted);

                entity.HasOne(ps => ps.Product)
                      .WithMany(p => p.Sizes)
                      .HasForeignKey(ps => ps.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Index: 1 product không có 2 size cùng label
                entity.HasIndex(ps => new { ps.ProductId, ps.Label }).IsUnique();
            });

            // --- OrderItemTopping ---
            modelBuilder.Entity<OrderItemTopping>(entity =>
            {
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.Property(e => e.LineTotal).HasColumnType("decimal(18,2)");
                entity.HasQueryFilter(oit => !oit.IsDeleted);

                entity.HasOne(oit => oit.OrderItem)
                      .WithMany(oi => oi.Toppings)
                      .HasForeignKey(oit => oit.OrderItemId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oit => oit.Topping)
                      .WithMany(t => t.OrderItemToppings)
                      .HasForeignKey(oit => oit.ToppingId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // --- IngredientUsageLog — Inventory Movement Ledger ---
            modelBuilder.Entity<IngredientUsageLog>(entity =>
            {
                entity.Property(e => e.CostPerBaseUnit).HasColumnType("decimal(18,4)");
                entity.Property(e => e.DeductedQty).HasColumnType("decimal(18,4)");
                entity.Property(e => e.TotalCost).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TheoreticalQty).HasColumnType("decimal(18,4)");
                entity.Property(e => e.Variance).HasColumnType("decimal(18,4)");

                // QueryFilter — immutable ledger, soft delete vẫn giữ nguyên
                entity.HasQueryFilter(l => !l.IsDeleted);

                // Nullable FK → batch xóa thì log vẫn sống
                entity.HasOne(l => l.Batch)
                      .WithMany()
                      .HasForeignKey(l => l.BatchId)
                      .OnDelete(DeleteBehavior.SetNull);

                // Indexes cho analytics queries
                entity.HasIndex(l => l.OrderId);
                entity.HasIndex(l => l.IngredientId);
                entity.HasIndex(l => l.OrderDate);
                entity.HasIndex(l => l.BatchId);
                entity.HasIndex(l => new { l.IngredientId, l.OrderDate });
                entity.HasIndex(l => new { l.OrderId, l.IngredientId });
            });

            // --- RecipeVersion — BOM Version History ---
            modelBuilder.Entity<RecipeVersion>(entity =>
            {
                entity.HasQueryFilter(v => !v.IsDeleted);

                entity.HasOne(v => v.Product)
                      .WithMany()
                      .HasForeignKey(v => v.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(v => v.ProductId);
                entity.HasIndex(v => new { v.ProductId, v.IsCurrent });
                entity.HasIndex(v => new { v.ProductId, v.VersionNumber }).IsUnique();
            });

            // --- RecipeVersionLine — BOM Version Line ---
            modelBuilder.Entity<RecipeVersionLine>(entity =>
            {
                entity.Property(e => e.QuantityRequired).HasColumnType("decimal(18,4)");
                entity.Property(e => e.YieldFactor).HasColumnType("decimal(5,4)");
                entity.Property(e => e.UnitCostSnapshot).HasColumnType("decimal(18,4)");

                entity.HasQueryFilter(l => !l.IsDeleted);

                entity.HasOne(l => l.RecipeVersion)
                      .WithMany(v => v.Lines)
                      .HasForeignKey(l => l.RecipeVersionId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(l => l.RecipeVersionId);
                entity.HasIndex(l => new { l.RecipeVersionId, l.IngredientId });
            });

            // --- OrderItem thêm decimal precision ---
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(e => e.SizeExtraPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SizeMultiplier).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ToppingTotal).HasColumnType("decimal(18,2)");
            });

            // --- OrderItemIngredientSnapshot — BOM Snapshot ---
            modelBuilder.Entity<OrderItemIngredientSnapshot>(entity =>
            {
                entity.Property(e => e.QuantityRequired).HasColumnType("decimal(18,4)");
                entity.Property(e => e.YieldFactor).HasColumnType("decimal(5,4)");
                entity.Property(e => e.SizeMultiplier).HasColumnType("decimal(18,4)");
                entity.Property(e => e.ActualDeducted).HasColumnType("decimal(18,4)");

                // QueryFilter đồng bộ với OrderItem — tránh EF Core warning 10622
                entity.HasQueryFilter(s => !s.IsDeleted && !s.OrderItem.IsDeleted);

                // Cascade delete: xóa OrderItem → xóa snapshots
                entity.HasOne(s => s.OrderItem)
                      .WithMany(oi => oi.IngredientSnapshots)
                      .HasForeignKey(s => s.OrderItemId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Index để query nhanh theo OrderItem và IngredientId
                entity.HasIndex(s => s.OrderItemId);
                entity.HasIndex(s => new { s.OrderItemId, s.IngredientId });
            });
            modelBuilder.Entity<Product>()
                .HasQueryFilter(p => !p.IsDeleted);
            modelBuilder.Entity<Category>()
                .HasQueryFilter(c => !c.IsDeleted);
            modelBuilder.Entity<Order>()
            .HasQueryFilter(o => !o.IsDeleted);
            modelBuilder.Entity<User>()
                .HasQueryFilter(u => !u.IsDeleted);
            modelBuilder.Entity<OrderItem>()
                .HasQueryFilter(oi => !oi.Order.IsDeleted);

            // --- Query Filters cho các entity liên quan tới User ---
            modelBuilder.Entity<HolidayConfig>()
                .HasQueryFilter(h => !h.Creator.IsDeleted);
            modelBuilder.Entity<LoginHistory>()
                .HasQueryFilter(l => !l.User.IsDeleted);
            modelBuilder.Entity<RefreshToken>()
                .HasQueryFilter(r => !r.User.IsDeleted);
            modelBuilder.Entity<Shift>()
                .HasQueryFilter(s => !s.IsDeleted);

            // --- Payment ---
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.Property(e => e.Amount).HasPrecision(18, 2);
            });
            modelBuilder.Entity<Payment>()
                .HasQueryFilter(p => !p.Order!.IsDeleted);

            // --- Coupon ---
            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.Property(e => e.DiscountValue).HasPrecision(18, 2);
                entity.Property(e => e.MinOrderAmount).HasPrecision(18, 2);
                entity.Property(e => e.MaxDiscountAmount).HasPrecision(18, 2);
            });

            // --- RefreshToken ---
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasIndex(r => r.Token).IsUnique();
                entity.HasIndex(r => r.UserId);
                entity.HasOne(r => r.User)
                      .WithMany()
                      .HasForeignKey(r => r.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // --- ActiveSession ---
            modelBuilder.Entity<ActiveSession>(entity =>
            {
                entity.HasIndex(a => a.TabId);
                entity.HasIndex(a => new { a.UserId, a.IsActive });
                entity.HasOne(a => a.User)
                      .WithMany()
                      .HasForeignKey(a => a.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<ActiveSession>()
                .HasQueryFilter(a => !a.User.IsDeleted);

            // --- Order.ShiftId ---
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasOne(o => o.Shift)
                      .WithMany()
                      .HasForeignKey(o => o.ShiftId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // --- UserCoupon ---
            modelBuilder.Entity<UserCoupon>(entity =>
            {
                entity.HasOne(uc => uc.User)
                      .WithMany()
                      .HasForeignKey(uc => uc.UserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(uc => uc.Coupon)
                      .WithMany()
                      .HasForeignKey(uc => uc.CouponId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasIndex(uc => new { uc.UserId, uc.CouponId });
            });
            modelBuilder.Entity<UserCoupon>()
                .HasQueryFilter(uc => !uc.IsDeleted);
        }
        public DbSet<HolidayConfig> HolidayConfigs { get; set; }
        public DbSet<RequestTicket> RequestTickets { get; set; }  
        public DbSet<LoginHistory> LoginHistory { get; set; }
        public DbSet<Shift> Shifts { get; set; }
        public DbSet<Table> Tables { get; set; }
        public DbSet<ActiveSession> ActiveSessions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Topping> Toppings { get; set; }
        public DbSet<ProductSize> ProductSizes { get; set; }
        public DbSet<OrderItemTopping> OrderItemToppings { get; set; }
        public DbSet<OrderItemIngredientSnapshot> OrderItemIngredientSnapshots { get; set; }

    }
}