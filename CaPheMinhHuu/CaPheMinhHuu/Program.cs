using CaPheMinhHuu.Data;
using CaPheMinhHuu.Filters;
using CaPheMinhHuu.Hubs;
using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Repositories.Implements;
using CaPheMinhHuu.Services.Implements;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using CaPheMinhHuu.Middleware;


var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// CORS
var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:5173" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .WithMethods("GET", "POST", "PUT", "DELETE", "PATCH")  // Thêm PATCH cho Order status + Table status
              .AllowCredentials();
    });
});

// DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// HttpContextAccessor — Cho phép Service layer truy cập Request context (VD: build full image URL)
builder.Services.AddHttpContextAccessor();

// User & Auth
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<ILoginHistoryRepository, LoginHistoryRepository>();

// Category
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// Product
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

// Ingredient (MỚI - 4 dòng)
builder.Services.AddScoped<IIngredientRepository, IngredientRepository>();
builder.Services.AddScoped<IIngredientUnitRepository, IngredientUnitRepository>();
builder.Services.AddScoped<IInventoryBatchRepository, InventoryBatchRepository>();
builder.Services.AddScoped<IIngredientService, IngredientService>();

// Recipe
builder.Services.AddScoped<IRecipeRepository, RecipeRepository>();
builder.Services.AddScoped<IRecipeService, RecipeService>();
builder.Services.AddScoped<IIngredientCategoryRepository, IngredientCategoryRepository>();
builder.Services.AddScoped<IIngredientCategoryService, IngredientCategoryService>();
// Table
builder.Services.AddScoped<ITableRepository, TableRepository>();
builder.Services.AddScoped<ITableService, TableService>();
// Staff 
builder.Services.AddScoped<IStaffService, StaffService>();
// Order
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();
// Shift
builder.Services.AddScoped<IShiftRepository, ShiftRepository>();
builder.Services.AddScoped<IShiftService, ShiftService>();
// Dashboard
builder.Services.AddScoped<IDashboardService, DashboardService>();
// Controllers (gộp JsonOptions + AuditLog filter — chỉ gọi 1 lần duy nhất)
builder.Services.AddControllers(options =>
{
    options.Filters.AddService<AuditLogActionFilter>();
})
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
// SignalR
builder.Services.AddSignalR();
// Email Service
builder.Services.AddScoped<IEmailService, EmailService>();

// Rate Limiting - Global
builder.Services.AddRateLimiter(options =>
{
    // Global: 100 request/phút cho MỌI API, phân vùng theo IP
    // (SPA + React StrictMode dev mode gọi nhiều lần → 30 quá thấp)
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
    // Riêng login: siết chặt 10 request/phút
    options.AddFixedWindowLimiter("LoginLimit", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
    // Response khi bị chặn
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});
// Thêm vào middleware pipeline (sau UseHttpsRedirection, trước UseCors):


// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "CaPheMinhHuu API", Version = "v1" });

    option.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Vui lòng nhập Token vào đây theo cú pháp: Bearer {token}",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    option.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});
// Thêm HSTS config (trước var app = builder.Build())
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(30);
    options.IncludeSubDomains = true;
});

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})

.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});
// Đăng ký AuditLogActionFilter
builder.Services.AddScoped<AuditLogActionFilter>();
builder.Services.AddHttpContextAccessor();


var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
// Thêm vào pipeline (trước UseHttpsRedirection)
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseHttpsRedirection();
// === Security Headers ===
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();
app.MapHub<KitchenHub>("/kitchenHub");
app.MapHub<ShiftHub>("/shiftHub");
app.UseStaticFiles();



app.Run();