using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    private readonly Backend.Data.AppDbContext _db;

    public NotificationHub(Backend.Data.AppDbContext db)
    {
        _db = db;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrWhiteSpace(userId))
            await Groups.AddToGroupAsync(Context.ConnectionId, BuildUserGroup(userId));

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrWhiteSpace(userId))
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, BuildUserGroup(userId));

        await base.OnDisconnectedAsync(exception);
    }

    public static string BuildUserGroup(string userId) => $"user:{userId}";

    public async Task SendMessage(Backend.Contracts.SendMessageRequest req)
    {
        var senderIdClaim = Context.User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(senderIdClaim) || !long.TryParse(senderIdClaim, out var senderId))
            throw new HubException("Unauthenticated");

        var now = DateTime.UtcNow;

        var message = new Backend.Models.Message
        {
            SenderId = senderId,
            ReceiverId = req.ReceiverId,
            OrderId = req.OrderId,
            MessageType = req.MessageType,
            Content = req.Content,
            AttachmentUrl = req.AttachmentUrl,
            IsRead = false,
            SentAt = now,
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        var dto = new Backend.Contracts.ChatMessageDto(
            message.Id,
            message.SenderId,
            message.ReceiverId,
            message.Content,
            message.AttachmentUrl,
            message.MessageType,
            message.IsRead,
            message.SentAt,
            message.OrderId
        );
        
        await Clients.Group(BuildUserGroup(req.ReceiverId.ToString())).SendAsync("ReceiveMessage", dto);
        await Clients.Caller.SendAsync("ReceiveMessage", dto);
    }
}
