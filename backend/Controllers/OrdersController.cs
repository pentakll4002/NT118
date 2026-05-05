using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

using Backend.Services;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrdersController(AppDbContext db, INotificationRealtimeService notificationService) : ControllerBase
{
    private const decimal FallbackShippingFee = 25000m;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<object>>> GetMyOrders(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var orders = await db.Orders
            .AsNoTracking()
            .Where(x => x.BuyerId == userId)
            .OrderByDescending(x => x.OrderedAt)
            .Select(x => new
            {
                x.Id,
                x.OrderNumber,
                x.ShopId,
                x.TotalAmount,
                x.PaymentStatus,
                x.Status,
                x.OrderedAt,
            })
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetOrderDetail(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var order = await db.Orders
            .AsNoTracking()
            .Where(x => x.Id == id && x.BuyerId == userId)
            .Select(x => new
            {
                x.Id,
                x.OrderNumber,
                x.ShopId,
                x.ShippingAddressId,
                x.Subtotal,
                x.ShippingFee,
                x.DiscountAmount,
                x.TotalAmount,
                x.PaymentMethod,
                PaymentStatus = x.PaymentStatus.ToString(),
                Status = x.Status.ToString(),
                x.Notes,
                x.OrderedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (order is null)
            return NotFound();

        var items = await db.OrderItems
            .AsNoTracking()
            .Where(x => x.OrderId == id)
            .Select(x => new
            {
                x.Id,
                x.ProductId,
                x.VariantId,
                x.ProductName,
                x.ProductImage,
                x.Quantity,
                x.UnitPrice,
                x.TotalPrice,
            })
            .ToListAsync(cancellationToken);

        return Ok(new { order, items });
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        if (body.Items.Count == 0)
            return BadRequest(new { message = "Đơn hàng phải có ít nhất 1 sản phẩm." });

        var address = await db.UserAddresses.FirstOrDefaultAsync(
            x => x.Id == body.ShippingAddressId && x.UserId == userId,
            cancellationToken);
        if (address is null)
            return BadRequest(new { message = "Địa chỉ giao hàng không hợp lệ." });

        var productIds = body.Items.Select(x => x.ProductId).Distinct().ToList();
        var products = await db.Products
            .Where(x => productIds.Contains(x.Id) && x.Status == ProductStatus.active)
            .ToListAsync(cancellationToken);

        if (products.Count != productIds.Count)
            return BadRequest(new { message = "Một số sản phẩm không hợp lệ hoặc ngừng bán." });

        var shopIds = products.Select(x => x.ShopId).Distinct().ToList();
        if (shopIds.Count != 1)
            return BadRequest(new { message = "Mỗi đơn hàng chỉ hỗ trợ một shop." });

        var subtotal = 0m;
        var orderItems = new List<OrderItem>();
        foreach (var input in body.Items)
        {
            if (input.Quantity <= 0)
                return BadRequest(new { message = "Số lượng sản phẩm phải lớn hơn 0." });

            var product = products.First(x => x.Id == input.ProductId);
            var unitPrice = product.Price;
            
            if (input.VariantId.HasValue)
            {
                var variant = await db.ProductVariants.FirstOrDefaultAsync(v => v.Id == input.VariantId.Value && v.ProductId == product.Id, cancellationToken);
                if (variant != null)
                {
                    unitPrice += variant.PriceModifier;
                }
            }

            var itemTotal = unitPrice * input.Quantity;
            subtotal += itemTotal;

            var mainImage = await db.ProductImages
                .Where(x => x.ProductId == product.Id)
                .OrderByDescending(x => x.IsMain)
                .ThenBy(x => x.SortOrder)
                .Select(x => x.ImageUrl)
                .FirstOrDefaultAsync(cancellationToken);

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                VariantId = input.VariantId,
                ProductName = product.Name,
                ProductImage = mainImage,
                Quantity = input.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = itemTotal,
            });
        }

        var shippingEstimate = await EstimateShippingFeeInternalAsync(shopIds[0], address, cancellationToken);
        var shippingFee = shippingEstimate.ShippingFee;
        var discount = 0m;
        long? voucherId = null;

        if (!string.IsNullOrWhiteSpace(body.VoucherCode))
        {
            var voucher = await db.Vouchers.FirstOrDefaultAsync(
                x => x.Code == body.VoucherCode && x.IsActive,
                cancellationToken);

            if (voucher is not null && voucher.StartDate <= DateTime.UtcNow && voucher.EndDate >= DateTime.UtcNow)
            {
                if (!voucher.MinOrderValue.HasValue || subtotal >= voucher.MinOrderValue.Value)
                {
                    discount = voucher.DiscountType == VoucherDiscountType.@fixed
                        ? voucher.DiscountValue
                        : subtotal * (voucher.DiscountValue / 100m);

                    if (voucher.MaxDiscount.HasValue)
                        discount = Math.Min(discount, voucher.MaxDiscount.Value);

                    discount = Math.Min(discount, subtotal);
                    voucherId = voucher.Id;
                }
            }
        }

        var now = DateTime.UtcNow;
        var order = new Order
        {
            OrderNumber = $"ORD-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            BuyerId = userId,
            ShopId = shopIds[0],
            ShippingAddressId = body.ShippingAddressId,
            VoucherId = voucherId,
            ShopVoucherId = null,
            Subtotal = subtotal,
            ShippingFee = shippingFee,
            DiscountAmount = discount,
            TotalAmount = subtotal + shippingFee - discount,
            PaymentMethod = body.PaymentMethod,
            PaymentStatus = PaymentStatus.pending,
            Status = OrderStatus.pending,
            Notes = body.Notes,
            OrderedAt = now,
            UpdatedAt = now,
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync(cancellationToken);

        // Now order.Id is populated by the database
        foreach (var item in orderItems)
            item.OrderId = order.Id;
        db.OrderItems.AddRange(orderItems);

        var notification = new Notification
        {
            UserId = userId,
            Type = "order_success",
            Title = "Đặt hàng thành công",
            MessageText = $"Đơn hàng {order.OrderNumber} của bạn đã được đặt thành công.",
            Data = $"{{\"orderId\": {order.Id}}}",
            IsRead = false,
            CreatedAt = now
        };
        db.Notifications.Add(notification);

        await db.SaveChangesAsync(cancellationToken);

        // trigger realtime notification
        await notificationService.NotifyUserAsync(userId, new {
            notification.Id,
            notification.Type,
            notification.Title,
            message = notification.MessageText,
            notification.Data,
            notification.IsRead,
            notification.CreatedAt
        }, cancellationToken);

        return Ok(new { message = "Đặt hàng thành công.", order.Id, order.OrderNumber, order.TotalAmount });
    }

    [HttpPost("shipping-fee/estimate")]
    public async Task<IActionResult> EstimateShippingFee([FromBody] EstimateShippingFeeRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        if (body.Items.Count == 0)
            return BadRequest(new { message = "Đơn hàng phải có ít nhất 1 sản phẩm." });

        var address = await db.UserAddresses.FirstOrDefaultAsync(
            x => x.Id == body.ShippingAddressId && x.UserId == userId,
            cancellationToken);
        if (address is null)
            return BadRequest(new { message = "Địa chỉ giao hàng không hợp lệ." });

        var productIds = body.Items.Select(x => x.ProductId).Distinct().ToList();
        var products = await db.Products
            .AsNoTracking()
            .Where(x => productIds.Contains(x.Id) && x.Status == ProductStatus.active)
            .ToListAsync(cancellationToken);

        if (products.Count != productIds.Count)
            return BadRequest(new { message = "Một số sản phẩm không hợp lệ hoặc ngừng bán." });

        var shopIds = products.Select(x => x.ShopId).Distinct().ToList();
        if (shopIds.Count != 1)
            return BadRequest(new { message = "Mỗi đơn hàng chỉ hỗ trợ một shop." });

        var estimate = await EstimateShippingFeeInternalAsync(shopIds[0], address, cancellationToken);
        return Ok(new
        {
            estimate.ShippingFee,
            estimate.DistanceKm,
            estimate.IsFallback,
        });
    }

    [HttpPatch("{id:long}/status")]
    public async Task<IActionResult> UpdateOrderStatus(long id, [FromBody] UpdateOrderStatusRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (order is null)
            return NotFound();

        var isSellerOfOrder = await db.Shops.AnyAsync(x => x.Id == order.ShopId && x.OwnerId == userId, cancellationToken);
        var isBuyer = order.BuyerId == userId;
        if (!isSellerOfOrder && !isBuyer && !this.IsAdmin())
            return Forbid();

        order.Status = body.Status;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Cập nhật trạng thái đơn hàng thành công." });
    }

    private async Task<(decimal ShippingFee, double? DistanceKm, bool IsFallback)> EstimateShippingFeeInternalAsync(
        long shopId,
        UserAddress buyerAddress,
        CancellationToken cancellationToken)
    {
        if (!buyerAddress.Latitude.HasValue || !buyerAddress.Longitude.HasValue)
            return (FallbackShippingFee, null, true);

        var shop = await db.Shops
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == shopId, cancellationToken);

        if (shop is null)
            return (FallbackShippingFee, null, true);

        var shopAddress = await db.UserAddresses
            .AsNoTracking()
            .Where(x => x.UserId == shop.OwnerId && x.Latitude.HasValue && x.Longitude.HasValue)
            .OrderByDescending(x => x.IsDefault)
            .ThenByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (shopAddress is null)
            return (FallbackShippingFee, null, true);

        var distanceKm = CalculateHaversineDistanceKm(
            shopAddress.Latitude!.Value,
            shopAddress.Longitude!.Value,
            buyerAddress.Latitude.Value,
            buyerAddress.Longitude.Value);

        return (CalculateDistanceBasedShippingFee(distanceKm), Math.Round(distanceKm, 2), false);
    }

    private static decimal CalculateDistanceBasedShippingFee(double distanceKm)
    {
        if (distanceKm <= 5d)
            return 15000m;
        if (distanceKm <= 10d)
            return 25000m;
        if (distanceKm <= 20d)
            return 35000m;

        var extraBlocks = (int)Math.Ceiling((distanceKm - 20d) / 5d);
        return 35000m + (extraBlocks * 5000m);
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
