using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/seller")]
public class SellerController(AppDbContext db, INotificationRealtimeService notificationService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsSeller(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);
        if (user is null)
            return Unauthorized();

        user.Role = UserRole.seller;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Đăng ký seller thành công." });
    }

    [HttpGet("products")]
    public async Task<ActionResult<IReadOnlyList<object>>> GetSellerProducts(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var products = await db.Products
            .AsNoTracking()
            .Where(x => db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId))
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Slug,
                x.Price,
                x.StockQuantity,
                x.SoldQuantity,
                x.Status,
            })
            .ToListAsync(cancellationToken);

        return Ok(products);
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateSellerProduct([FromBody] CreateSellerProductRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var shop = await db.Shops.FirstOrDefaultAsync(x => x.OwnerId == userId, cancellationToken);
        if (shop is null)
            return BadRequest(new { message = "Bạn chưa có shop. Hãy đăng ký shop trước." });

        var slugExists = await db.Products.AnyAsync(x => x.Slug == body.Slug, cancellationToken);
        if (slugExists)
            return Conflict(new { message = "Slug sản phẩm đã tồn tại." });

        var now = DateTime.UtcNow;
        var product = new Product
        {
            ShopId = shop.Id,
            CategoryId = body.CategoryId,
            Name = body.Name,
            Slug = body.Slug,
            Description = body.Description,
            Price = body.Price,
            OriginalPrice = body.OriginalPrice,
            StockQuantity = body.StockQuantity,
            SoldQuantity = 0,
            Rating = 0,
            TotalReviews = 0,
            Status = ProductStatus.active,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Products.Add(product);
        shop.TotalProducts += 1;
        shop.UpdatedAt = now;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Thêm sản phẩm thành công.", product.Id });
    }

    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<object>>> GetSellerOrders(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var orders = await db.Orders
            .AsNoTracking()
            .Where(x => db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId))
            .OrderByDescending(x => x.OrderedAt)
            .Select(x => new
            {
                x.Id,
                x.OrderNumber,
                x.BuyerId,
                x.TotalAmount,
                PaymentStatus = x.PaymentStatus.ToString(),
                Status = x.Status.ToString(),
                x.OrderedAt,
                x.UpdatedAt,
            })
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }

    /// <summary>
    /// GET /api/seller/orders/{id} — Seller views order detail
    /// </summary>
    [HttpGet("orders/{id:long}")]
    public async Task<IActionResult> GetSellerOrderDetail(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var order = await db.Orders
            .AsNoTracking()
            .Where(x => x.Id == id && db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId))
            .Select(x => new
            {
                x.Id,
                x.OrderNumber,
                x.BuyerId,
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
                x.UpdatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (order is null)
            return NotFound(new { message = "Không tìm thấy đơn hàng." });

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

        // Get buyer info
        var buyer = await db.Users
            .AsNoTracking()
            .Where(x => x.Id == order.BuyerId)
            .Select(x => new { x.Id, x.Username, x.Email, x.Phone })
            .FirstOrDefaultAsync(cancellationToken);

        // Get shipping address
        var shippingAddress = await db.UserAddresses
            .AsNoTracking()
            .Where(x => x.Id == order.ShippingAddressId)
            .Select(x => new
            {
                x.RecipientName,
                x.RecipientPhone,
                x.Province,
                x.District,
                x.Ward,
                x.StreetAddress,
            })
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(new { order, items, buyer, shippingAddress });
    }

    /// <summary>
    /// PATCH /api/seller/orders/{id}/status — Seller updates order status
    /// </summary>
    [HttpPatch("orders/{id:long}/status")]
    public async Task<IActionResult> UpdateSellerOrderStatus(
        long id,
        [FromBody] UpdateSellerOrderStatusRequest body,
        CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (order is null)
            return NotFound(new { message = "Không tìm thấy đơn hàng." });

        var isSellerOfOrder = await db.Shops.AnyAsync(
            x => x.Id == order.ShopId && x.OwnerId == userId, cancellationToken);
        if (!isSellerOfOrder)
            return Forbid();

        // Validate status transition
        var validTransitions = new Dictionary<OrderStatus, OrderStatus[]>
        {
            [OrderStatus.pending] = [OrderStatus.confirmed, OrderStatus.cancelled],
            [OrderStatus.confirmed] = [OrderStatus.shipping, OrderStatus.cancelled],
            [OrderStatus.shipping] = [OrderStatus.delivered],
        };

        if (!validTransitions.TryGetValue(order.Status, out var allowed) || !allowed.Contains(body.Status))
            return BadRequest(new { message = $"Không thể chuyển trạng thái từ '{order.Status}' sang '{body.Status}'." });

        order.Status = body.Status;
        order.UpdatedAt = DateTime.UtcNow;

        // Create notification for the buyer
        var statusLabels = new Dictionary<OrderStatus, string>
        {
            [OrderStatus.confirmed] = "Đã xác nhận",
            [OrderStatus.shipping] = "Đang giao hàng",
            [OrderStatus.delivered] = "Đã giao hàng",
            [OrderStatus.cancelled] = "Đã hủy",
        };

        var statusLabel = statusLabels.GetValueOrDefault(body.Status, body.Status.ToString());
        var notification = new Notification
        {
            UserId = order.BuyerId,
            Type = "order_update",
            Title = $"Đơn hàng {order.OrderNumber}: {statusLabel}",
            MessageText = body.Note ?? $"Đơn hàng {order.OrderNumber} của bạn đã được cập nhật sang trạng thái: {statusLabel}.",
            Data = $"{{\"orderId\": {order.Id}, \"status\": \"{body.Status}\"}}",
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        };
        db.Notifications.Add(notification);

        await db.SaveChangesAsync(cancellationToken);

        // Send realtime notification to buyer
        await notificationService.NotifyUserAsync(order.BuyerId, new
        {
            notification.Id,
            notification.Type,
            notification.Title,
            message = notification.MessageText,
            notification.Data,
            notification.IsRead,
            notification.CreatedAt,
        }, cancellationToken);

        return Ok(new { message = $"Cập nhật trạng thái đơn hàng thành '{statusLabel}'." });
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var totalRevenue = await db.Orders
            .AsNoTracking()
            .Where(x => db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId) && x.PaymentStatus == PaymentStatus.paid)
            .SumAsync(x => (decimal?)x.TotalAmount, cancellationToken) ?? 0;

        var monthly = await db.Orders
            .AsNoTracking()
            .Where(x => db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId) && x.PaymentStatus == PaymentStatus.paid)
            .GroupBy(x => new { x.OrderedAt.Year, x.OrderedAt.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                revenue = g.Sum(x => x.TotalAmount),
            })
            .OrderByDescending(x => x.year)
            .ThenByDescending(x => x.month)
            .ToListAsync(cancellationToken);

        return Ok(new { totalRevenue, monthly });
    }
}

