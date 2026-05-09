using CaPheMinhHuu.Interfaces;
using System.Security.Claims;

namespace CaPheMinhHuu.Middlewares
{
    public class ActiveSessionMiddleware
    {
        private readonly RequestDelegate _next;

        public ActiveSessionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context,
            IActiveSessionRepository sessionRepo)
        {
            var tabId = context.Request.Headers["X-Tab-Id"].FirstOrDefault();

            if (!string.IsNullOrEmpty(tabId) && context.User.Identity?.IsAuthenticated == true)
            {
                var session = await sessionRepo.GetByTabIdAsync(tabId);
                if (session != null && session.IsActive)
                {
                    session.LastSeen = DateTime.Now;
                    await sessionRepo.UpdateAsync(session);
                }
            }

            await _next(context);
        }
    }
}
