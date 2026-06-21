using Backend.Data;
using Backend.Hubs;
using Backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services;

public class ShipperTrackingSimulator(
    IServiceScopeFactory scopeFactory,
    IHubContext<NotificationHub> hubContext,
    INotificationRealtimeService notificationService,
    ILogger<ShipperTrackingSimulator> logger) : IShipperTrackingSimulator
{
    public void StartTrackingSimulation(long orderId)
    {
        // Start simulation in a fire-and-forget background task
        _ = Task.Run(async () =>
        {
            try
            {
                await RunSimulationAsync(orderId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during shipper tracking simulation for Order {OrderId}", orderId);
            }
        });
    }

    private async Task RunSimulationAsync(long orderId)
    {
        logger.LogInformation("Starting shipper tracking simulation for Order {OrderId}...", orderId);

        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // 1. Fetch order
        var order = await db.Orders
            .Include(o => o.Shop)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
        {
            logger.LogWarning("Order {OrderId} not found. Aborting tracking simulation.", orderId);
            return;
        }

        if (order.Status != OrderStatus.shipping)
        {
            logger.LogWarning("Order {OrderId} is in status {Status}, not shipping. Aborting tracking simulation.", orderId, order.Status);
            return;
        }

        // 2. Fetch shipping address coordinates
        var buyerAddress = await db.UserAddresses.FirstOrDefaultAsync(a => a.Id == order.ShippingAddressId);
        if (buyerAddress == null || !buyerAddress.Latitude.HasValue || !buyerAddress.Longitude.HasValue)
        {
            logger.LogWarning("Order {OrderId} has no valid shipping address coordinates. Aborting tracking simulation.", orderId);
            return;
        }

        double destLat = buyerAddress.Latitude.Value;
        double destLng = buyerAddress.Longitude.Value;

        // Try to get Shop coordinates. If not available, mock a coordinate 1.5 km away
        double startLat;
        double startLng;

        var shopAddress = await db.UserAddresses
            .AsNoTracking()
            .Where(x => x.UserId == order.Shop.OwnerId && x.Latitude.HasValue && x.Longitude.HasValue)
            .OrderByDescending(x => x.IsDefault)
            .FirstOrDefaultAsync();

        if (shopAddress != null && shopAddress.Latitude.HasValue && shopAddress.Longitude.HasValue)
        {
            startLat = shopAddress.Latitude.Value;
            startLng = shopAddress.Longitude.Value;
            logger.LogInformation("Found Shop coordinates: {Lat}, {Lng} for Order {OrderId}", startLat, startLng, orderId);
        }
        else
        {
            // Fallback: 1.5km offset (roughly 0.01 degree)
            startLat = destLat + 0.01;
            startLng = destLng - 0.01;
            logger.LogInformation("Shop coordinates not found. Mocking start point near destination: {Lat}, {Lng} for Order {OrderId}", startLat, startLng, orderId);
        }

        int stepsCount = 15;
        int delayMs = 3000; // 3 seconds per step

        for (int i = 0; i <= stepsCount; i++)
        {
            // Re-fetch order status to see if it was cancelled/refunded by the user or seller
            var currentOrder = await db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.Id == orderId);
            if (currentOrder == null || currentOrder.Status == OrderStatus.cancelled || currentOrder.Status == OrderStatus.refunded)
            {
                logger.LogInformation("Order {OrderId} status changed to {Status}. Stopping simulation.", orderId, currentOrder?.Status);
                break;
            }

            double t = (double)i / stepsCount;
            double currentLat = startLat + t * (destLat - startLat);
            double currentLng = startLng + t * (destLng - startLng);

            double remainingDistance = CalculateHaversineDistanceKm(currentLat, currentLng, destLat, destLng);

            var trackingPayload = new
            {
                orderId = orderId,
                orderNumber = order.OrderNumber,
                latitude = currentLat,
                longitude = currentLng,
                status = i == stepsCount ? "delivered" : "shipping",
                step = i,
                totalSteps = stepsCount,
                distanceRemainingKm = Math.Round(remainingDistance, 2)
            };

            var groupName = NotificationHub.BuildUserGroup(order.BuyerId.ToString());
            await hubContext.Clients.Group(groupName).SendAsync("order.tracking", trackingPayload);

            logger.LogInformation("Sent tracking update for Order {OrderId}: Step {Step}/{TotalSteps}, Lat: {Lat}, Lng: {Lng}", 
                orderId, i, stepsCount, currentLat, currentLng);

            if (i < stepsCount)
            {
                await Task.Delay(delayMs);
            }
        }

        // 3. Mark as delivered if still shipping
        var finalOrder = await db.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
        if (finalOrder != null && finalOrder.Status == OrderStatus.shipping)
        {
            finalOrder.Status = OrderStatus.delivered;
            finalOrder.UpdatedAt = DateTime.UtcNow;

            var deliveryNotification = new Notification
            {
                UserId = finalOrder.BuyerId,
                Type = "order_delivered",
                Title = "Giao hàng thành công",
                MessageText = $"Đơn hàng {finalOrder.OrderNumber} của bạn đã được giao thành công.",
                Data = $"{{\"orderId\": {finalOrder.Id}}}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            db.Notifications.Add(deliveryNotification);
            await db.SaveChangesAsync();

            // Realtime push notification
            await notificationService.NotifyUserAsync(finalOrder.BuyerId, new
            {
                deliveryNotification.Id,
                deliveryNotification.Type,
                deliveryNotification.Title,
                message = deliveryNotification.MessageText,
                deliveryNotification.Data,
                deliveryNotification.IsRead,
                deliveryNotification.CreatedAt
            });

            // SignalR status changed event
            var groupName = NotificationHub.BuildUserGroup(finalOrder.BuyerId.ToString());
            await hubContext.Clients.Group(groupName).SendAsync("order.status_changed", new
            {
                orderId = finalOrder.Id,
                status = "delivered"
            });

            logger.LogInformation("Order {OrderId} successfully marked as delivered.", orderId);
        }
    }

    private static double CalculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusKm = 6371d;
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
            + Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2))
            * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return earthRadiusKm * c;
    }

    private static double ToRadians(double degree) => degree * (Math.PI / 180d);
}
