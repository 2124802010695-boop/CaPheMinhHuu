using Microsoft.AspNetCore.SignalR;
namespace CaPheMinhHuu.Hubs
{
    public class KitchenHub : Hub
    {
        public async Task SendNewOrder(object order)
        {
            await Clients.All.SendAsync("ReceiveNewOrder", order);
        }
        public async Task UpdateOrderStatus(int orderId, string status)
        {
            await Clients.All.SendAsync("OrderStatusUpdated", orderId, status);
        }
    }
}