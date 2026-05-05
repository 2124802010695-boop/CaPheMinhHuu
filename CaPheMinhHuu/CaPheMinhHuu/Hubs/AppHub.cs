using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CaPheMinhHuu.Hubs
{
    [Authorize]
    public class AppHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userId = Context.User?.FindFirst("id")?.Value;
            var isGuest = string.IsNullOrEmpty(role);

            // Guest — join group theo orderCode (query string)
            if (isGuest)
            {
                var orderCode = Context.GetHttpContext()?.Request.Query["orderCode"].ToString();
                if (!string.IsNullOrEmpty(orderCode))
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderCode}");
                await base.OnConnectedAsync();
                return;
            }

            // Staff — join Broadcast + Operations
            await Groups.AddToGroupAsync(Context.ConnectionId, "Broadcast");

            if (role == "Admin")
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admin");

            if (role == "Cashier")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Operations");
                await Groups.AddToGroupAsync(Context.ConnectionId, "Cashier");
            }

            if (role == "Kitchen")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Operations");
                await Groups.AddToGroupAsync(Context.ConnectionId, "Kitchen");
            }

            // User cá nhân (shift events)
            if (userId != null)
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");

            await base.OnConnectedAsync();
        }
    }
}