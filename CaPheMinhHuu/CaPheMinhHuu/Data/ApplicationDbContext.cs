using Microsoft.EntityFrameworkCore;
using CaPheMinhHuu.Models;
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
                entity.Property(e => e.RowVersion).IsRowVersion();
                entity.Property(e => e.CurrentQuantity).HasPrecision(18, 3);
                entity.Property(e => e.InitialQuantity).HasPrecision(18, 3);
                entity.Property(e => e.ImportPricePerBaseUnit).HasPrecision(18, 2);

                // Index unique cho BatchCode
                entity.HasIndex(b => b.BatchCode).IsUnique();

                // Index để query nhanh
                entity.HasIndex(b => new { b.IngredientId, b.ExpiryDate });
            });

            // --- Cấu hình Recipe (Công thức) ---
            modelBuilder.Entity<Recipe>(entity =>
            {
                entity.HasIndex(r => new { r.ProductId, r.IngredientId }).IsUnique();
                entity.HasIndex(r => r.ProductId);
                entity.Property(e => e.QuantityRequired).HasColumnType("decimal(18, 4)");

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
                entity.HasIndex(o => o.OrderDate); // THÊM DÒNG NÀY
                entity.HasIndex(o => o.Status); // THÊM DÒNG NÀY (để filter nhanh)
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(e => e.PriceAtOrder).HasColumnType("decimal(18, 2)");
            });
            modelBuilder.Entity<Order>()
            .HasQueryFilter(o => !o.IsDeleted);
            modelBuilder.Entity<User>()
                .HasQueryFilter(u => !u.IsDeleted);
            modelBuilder.Entity<OrderItem>()
                .HasQueryFilter(oi => !oi.Order.IsDeleted);
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
        }
        public DbSet<HolidayConfig> HolidayConfigs { get; set; }
        public DbSet<RequestTicket> RequestTickets { get; set; }  
        public DbSet<LoginHistory> LoginHistory { get; set; }
        public DbSet<Shift> Shifts { get; set; }
        public DbSet<Table> Tables { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

    }
}