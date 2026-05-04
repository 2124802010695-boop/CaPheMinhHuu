namespace CaPheMinhHuu.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (InvalidOperationException ex)
            {
                // Business logic errors (VD: "Không đủ nguyên liệu", "Ca đang mở")
                _logger.LogWarning(ex, "Business error: {Message}", ex.Message);
                context.Response.StatusCode = 400;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized: {Message}", ex.Message);
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Không có quyền truy cập"
                });
            }
            catch (Exception ex)
            {
                // Unexpected errors — log đầy đủ, trả generic message
                _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."
                });
            }
        }
    }
}
