using CaPheMinhHuu.Interfaces;
using CaPheMinhHuu.Models;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace CaPheMinhHuu.Filters
{
    public class AuditLogActionFilter : IAsyncActionFilter
    {
        private readonly IAuditLogRepository _auditLogRepo;

        public AuditLogActionFilter(IAuditLogRepository auditLogRepo)
        {
            _auditLogRepo = auditLogRepo;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var httpMethod = context.HttpContext.Request.Method;
            // Chỉ log POST, PUT, DELETE (bỏ qua GET)
            if (httpMethod == "GET")
            {
                await next();
                return;
            }
            // Thực thi action trước
            var executedContext = await next();
            // Lấy thông tin user từ JWT claims
            var userId = context.HttpContext.User.FindFirst("id")?.Value;
            var username = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? context.HttpContext.User.FindFirst("sub")?.Value;
            // Tóm tắt request body (giới hạn 500 ký tự)
            string? requestBody = null;
            if (context.ActionArguments.Count > 0)
            {
                var bodyArg = context.ActionArguments.FirstOrDefault();
                requestBody = System.Text.Json.JsonSerializer.Serialize(bodyArg.Value);
                if (requestBody?.Length > 500)
                    requestBody = requestBody[..500] + "...";
            }
            var auditLog = new AuditLog
            {
                Timestamp = DateTime.Now,
                UserId = userId,
                Username = username,
                Action = httpMethod,
                Endpoint = context.HttpContext.Request.Path.ToString(),
                IpAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString(),
                StatusCode = executedContext.HttpContext.Response.StatusCode,
                RequestBody = requestBody,
                UserAgent = context.HttpContext.Request.Headers["User-Agent"].ToString()
            };
            await _auditLogRepo.AddAsync(auditLog);
        }
    }
}