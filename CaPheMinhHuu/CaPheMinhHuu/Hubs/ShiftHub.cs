using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
namespace CaPheMinhHuu.Hubs
{
    [Authorize]
    public class ShiftHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userId = Context.User?.FindFirst("id")?.Value;
            if (role == "Admin")
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admin");
            if (userId != null)
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            await base.OnConnectedAsync();
        }
    }
}