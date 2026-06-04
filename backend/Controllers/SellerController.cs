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
    [HttpGet("dashboard")]
    public async Task<ActionResult<SellerDashboardStats>> GetDashboardStats(CancellationToken cancellationToken)
    {
        try
        {
            if (!this.TryGetCurrentUserId(out var userId))
                return Unauthorized();

            var shop = await db.Shops.FirstOrDefaultAsync(x => x.OwnerId == userId, cancellationToken);
            if (shop is null)
            {
                // Auto-create a shop for the seller if missing
                var user = await db.Users.FindAsync(new object[] { userId }, cancellationToken);
                shop = new Shop
                {
                    OwnerId = userId,
                    Name = user?.Username != null ? $"Cửa hàng của {user.Username}" : "Cửa hàng của tôi",
                    Slug = $"shop-{userId}-{Guid.NewGuid().ToString()[..8]}",
                    Status = ShopStatus.active,
                    IsVerified = true,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                db.Shops.Add(shop);
                await db.SaveChangesAsync(cancellationToken);
                Console.WriteLine($"[Dashboard] Auto-created shop for user {userId}");
            }

            var now = DateTime.UtcNow;
            var today = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
            var sevenDaysAgo = today.AddDays(-6);

            Console.WriteLine($"[Dashboard] Fetching stats for Shop {shop.Id} (Owner: {userId})");

            // 1. Basic Stats
            var todayOrdersQuery = db.Orders.Where(o => o.ShopId == shop.Id && o.OrderedAt >= today);
            var todayOrdersCount = await todayOrdersQuery.CountAsync(cancellationToken);
            var todayRevenue = await todayOrdersQuery
                .Where(o => o.Status != OrderStatus.cancelled && o.Status != OrderStatus.refunded)
                .SumAsync(o => (decimal?)o.TotalAmount, cancellationToken) ?? 0;

            // 2. Todo Stats
            var ordersToConfirm = await db.Orders.CountAsync(o => o.ShopId == shop.Id && o.Status == OrderStatus.pending, cancellationToken);
            var ordersToShip = await db.Orders.CountAsync(o => o.ShopId == shop.Id && o.Status == OrderStatus.confirmed, cancellationToken);
            var cancelledOrders = await db.Orders.CountAsync(o => o.ShopId == shop.Id && o.Status == OrderStatus.cancelled && o.OrderedAt >= sevenDaysAgo, cancellationToken);
            var returnRequests = await db.Orders.CountAsync(o => o.ShopId == shop.Id && o.Status == OrderStatus.refunded && o.OrderedAt >= sevenDaysAgo, cancellationToken);
            var outOfStockProducts = await db.Products.CountAsync(p => p.ShopId == shop.Id && p.StockQuantity <= 0, cancellationToken);

            // 3. Revenue History (Last 7 days)
            var revenueHistory = new List<decimal>();
            for (int i = 6; i >= 0; i--)
            {
                var dayStart = today.AddDays(-i);
                var dayEnd = dayStart.AddDays(1);
                var dayRevenue = await db.Orders
                    .AsNoTracking()
                    .Where(o => o.ShopId == shop.Id && (o.Status == OrderStatus.delivered || o.PaymentStatus == PaymentStatus.paid) && o.Status != OrderStatus.cancelled)
                    .Where(o => o.OrderedAt >= dayStart && o.OrderedAt < dayEnd)
                    .Select(o => (decimal?)o.TotalAmount)
                    .SumAsync(cancellationToken) ?? 0;
                revenueHistory.Add(dayRevenue);
            }

            // Calculate mock but slightly more realistic conversion rate
            // In a real app, we'd track visits/sessions. For now, we use a ratio of orders to total products or similar.
            decimal conversionRate = 0;
            var totalShopProducts = await db.Products.CountAsync(p => p.ShopId == shop.Id, cancellationToken);
            var totalOrders = await db.Orders.CountAsync(o => o.ShopId == shop.Id, cancellationToken);
            if (totalShopProducts > 0)
            {
                conversionRate = Math.Min(10.0m, (decimal)totalOrders / totalShopProducts * 5.0m);
            }
            if (conversionRate == 0) conversionRate = 2.5m;

            var response = new SellerDashboardStats(
                ShopName: shop.Name,
                TodayRevenue: todayRevenue,
                TodayOrders: todayOrdersCount,
                ConversionRate: conversionRate,
                AverageOrderValue: todayOrdersCount > 0 ? todayRevenue / todayOrdersCount : 0,
                RevenueHistory: revenueHistory,
                Todo: new SellerTodoStats(
                    OrdersToConfirm: ordersToConfirm,
                    OrdersToShip: ordersToShip,
                    CancelledOrders: cancelledOrders,
                    ReturnRequests: returnRequests,
                    OutOfStockProducts: outOfStockProducts
                ),
                TotalOrders: totalOrders
            );

            return Ok(response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DashboardError] {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu dashboard.", error = ex.Message });
        }
    }

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

        var isAdmin = this.IsAdmin();
        var query = db.Products.AsNoTracking().Where(x => x.Status != ProductStatus.deleted);
        if (!isAdmin)
        {
            query = query.Where(x => db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId));
        }

        var products = await query
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
                MainImageUrl = x.Images.Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault() 
                               ?? x.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return Ok(products);
    }

    [HttpGet("products/{id:long}")]
    public async Task<IActionResult> GetProductDetail(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var product = await db.Products
            .AsNoTracking()
            .Where(x => x.Id == id && db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId))
            .Select(x => new
            {
                x.Id,
                x.CategoryId,
                x.Name,
                x.Slug,
                x.Description,
                x.Price,
                x.OriginalPrice,
                x.StockQuantity,
                x.WeightGrams,
                x.Brand,
                x.Status,
                Images = x.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).ToList(),
                Variants = x.Variants.Select(v => new
                {
                    v.Id,
                    v.Name,
                    v.Value,
                    v.PriceModifier,
                    v.StockQuantity,
                    v.Sku
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (product is null)
            return NotFound(new { message = "Không tìm thấy sản phẩm." });

        return Ok(product);
    }

    [HttpPut("products/{id:long}")]
    public async Task<IActionResult> UpdateSellerProduct(long id, [FromBody] UpdateSellerProductRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var product = await db.Products
            .Include(x => x.Images)
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (product is null)
            return NotFound(new { message = "Không tìm thấy sản phẩm." });

        var isSellerOfProduct = await db.Shops.AnyAsync(
            x => x.Id == product.ShopId && x.OwnerId == userId, cancellationToken);
        if (!isSellerOfProduct)
            return Forbid();

        var now = DateTime.UtcNow;
        product.CategoryId = body.CategoryId;
        product.Name = body.Name;
        product.Description = body.Description;
        product.Price = body.Price;
        product.OriginalPrice = body.OriginalPrice;
        product.StockQuantity = body.StockQuantity;
        product.WeightGrams = body.WeightGrams;
        product.Brand = body.Brand;
        product.UpdatedAt = now;

        // Update variants
        db.ProductVariants.RemoveRange(product.Variants);
        if (body.Variants != null && body.Variants.Count > 0)
        {
            product.Variants = body.Variants.Select(v => new ProductVariant
            {
                ProductId = product.Id,
                Name = v.Name,
                Value = v.Value,
                PriceModifier = v.PriceModifier,
                StockQuantity = v.StockQuantity,
                Sku = v.Sku,
                CreatedAt = now
            }).ToList();
        }

        // Update images
        db.ProductImages.RemoveRange(product.Images);
        if (body.ImageUrls != null && body.ImageUrls.Count > 0)
        {
            product.Images = body.ImageUrls.Select((url, index) => new ProductImage
            {
                ProductId = product.Id,
                ImageUrl = url,
                IsMain = index == 0,
                SortOrder = index,
                CreatedAt = now
            }).ToList();
        }

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Cập nhật sản phẩm thành công." });
    }

    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands(CancellationToken cancellationToken)
    {
        var brands = await db.Products
            .AsNoTracking()
            .Where(x => !string.IsNullOrEmpty(x.Brand))
            .Select(x => x.Brand!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync(cancellationToken);

        return Ok(brands);
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
            WeightGrams = body.WeightGrams,
            SoldQuantity = 0,
            Rating = 0,
            TotalReviews = 0,
            Status = ProductStatus.active,
            Brand = body.Brand,
            CreatedAt = now,
            UpdatedAt = now,
        };

        if (body.Variants != null && body.Variants.Count > 0)
        {
            product.Variants = body.Variants.Select(v => new ProductVariant
            {
                Name = v.Name,
                Value = v.Value,
                PriceModifier = v.PriceModifier,
                StockQuantity = v.StockQuantity,
                Sku = v.Sku,
                CreatedAt = now
            }).ToList();
        }

        if (body.ImageUrls != null && body.ImageUrls.Count > 0)
        {
            product.Images = body.ImageUrls.Select((url, index) => new ProductImage
            {
                ImageUrl = url,
                IsMain = index == 0,
                SortOrder = index,
                CreatedAt = now
            }).ToList();
        }

        db.Products.Add(product);
        shop.TotalProducts += 1;
        shop.UpdatedAt = now;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Thêm sản phẩm thành công.", product.Id });
    }

    [HttpPut("products/{id:long}")]
    public async Task<IActionResult> UpdateSellerProduct(long id, [FromBody] CreateSellerProductRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var product = await db.Products.Include(p => p.Images).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (product is null)
            return NotFound(new { message = "Không tìm thấy sản phẩm." });

        var isAdmin = this.IsAdmin();
        var isSellerOfProduct = await db.Shops.AnyAsync(
            x => x.Id == product.ShopId && x.OwnerId == userId, cancellationToken);

        if (!isSellerOfProduct && !isAdmin)
            return Forbid();

        var slugExists = await db.Products.AnyAsync(x => x.Slug == body.Slug && x.Id != id, cancellationToken);
        if (slugExists)
            return Conflict(new { message = "Slug sản phẩm đã tồn tại." });

        var now = DateTime.UtcNow;
        product.CategoryId = body.CategoryId;
        product.Name = body.Name;
        product.Slug = body.Slug;
        product.Description = body.Description;
        product.Price = body.Price;
        product.OriginalPrice = body.OriginalPrice;
        product.StockQuantity = body.StockQuantity;
        product.WeightGrams = body.WeightGrams;
        product.UpdatedAt = now;

        if (body.ImageUrls != null)
        {
            db.ProductImages.RemoveRange(product.Images);
            product.Images = body.ImageUrls.Select((url, index) => new ProductImage
            {
                ImageUrl = url,
                IsMain = index == 0,
                SortOrder = index,
                CreatedAt = now
            }).ToList();
        }

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Cập nhật sản phẩm thành công." });
    }

    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<object>>> GetSellerOrders(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var isAdmin = this.IsAdmin();
        var query = db.Orders.AsNoTracking();
        if (!isAdmin)
        {
            query = query.Where(x => db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId));
        }

        var orders = await query
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
                HasReturnRequest = db.ReturnRequests.Any(r => r.OrderId == x.Id)
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

        var isAdmin = this.IsAdmin();
        var query = db.Orders.AsNoTracking().Where(x => x.Id == id);
        if (!isAdmin)
        {
            query = query.Where(x => db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId));
        }

        var order = await query
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

        var isAdmin = this.IsAdmin();
        var isSellerOfOrder = await db.Shops.AnyAsync(
            x => x.Id == order.ShopId && x.OwnerId == userId, cancellationToken);
        if (!isSellerOfOrder && !isAdmin)
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

        var isPaidOrDelivered = (Order x) => x.PaymentStatus == PaymentStatus.paid || x.Status == OrderStatus.delivered;

        var totalRevenue = await db.Orders
            .AsNoTracking()
            .Where(x => db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId) && (x.PaymentStatus == PaymentStatus.paid || x.Status == OrderStatus.delivered))
            .SumAsync(x => (decimal?)x.TotalAmount, cancellationToken) ?? 0;

        var monthly = await db.Orders
            .AsNoTracking()
            .Where(x => db.Shops.Any(s => s.Id == x.ShopId && s.OwnerId == userId) && (x.PaymentStatus == PaymentStatus.paid || x.Status == OrderStatus.delivered))
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

    [HttpPatch("products/{id:long}/status")]
    public async Task<IActionResult> UpdateProductStatus(long id, [FromBody] UpdateProductStatusRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var product = await db.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (product is null)
            return NotFound(new { message = "Không tìm thấy sản phẩm." });

        var isAdmin = this.IsAdmin();
        var isSellerOfProduct = await db.Shops.AnyAsync(
            x => x.Id == product.ShopId && x.OwnerId == userId, cancellationToken);
        if (!isSellerOfProduct && !isAdmin)
            return Forbid();

        product.Status = body.Status;
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Cập nhật trạng thái sản phẩm thành công." });
    }

    [HttpDelete("products/{id:long}")]
    public async Task<IActionResult> DeleteProduct(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var product = await db.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (product is null)
            return NotFound(new { message = "Không tìm thấy sản phẩm." });

        var isAdmin = this.IsAdmin();
        var isSellerOfProduct = await db.Shops.AnyAsync(
            x => x.Id == product.ShopId && x.OwnerId == userId, cancellationToken);
        if (!isSellerOfProduct && !isAdmin)
            return Forbid();

        product.Status = ProductStatus.deleted;
        product.UpdatedAt = DateTime.UtcNow;

        // Update shop total products
        var shop = await db.Shops.FirstOrDefaultAsync(x => x.Id == product.ShopId, cancellationToken);
        if (shop != null)
        {
            shop.TotalProducts = Math.Max(0, shop.TotalProducts - 1);
            shop.UpdatedAt = DateTime.UtcNow;
        }

        try 
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DeleteProductError] ID: {id}, ShopID: {product.ShopId}");
            Console.WriteLine($"[DeleteProductError] Message: {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"[DeleteProductError] Inner: {ex.InnerException.Message}");
            throw;
        }

        return Ok(new { message = "Xóa sản phẩm thành công." });
    }

    // ── Return Request Endpoints ────────────────────────────────────

    /// <summary>
    /// GET /api/seller/returns — List all return requests for seller's shop
    /// </summary>
    [HttpGet("returns")]
    public async Task<ActionResult<IReadOnlyList<object>>> GetReturnRequests(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var shop = await db.Shops.AsNoTracking().FirstOrDefaultAsync(x => x.OwnerId == userId, cancellationToken);
        if (shop is null)
            return BadRequest(new { message = "Bạn chưa có shop." });

        var returns = await db.ReturnRequests
            .AsNoTracking()
            .Where(r => db.Orders.Any(o => o.Id == r.OrderId && o.ShopId == shop.Id))
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.OrderId,
                OrderNumber = db.Orders.Where(o => o.Id == r.OrderId).Select(o => o.OrderNumber).FirstOrDefault(),
                r.BuyerId,
                BuyerName = db.Users.Where(u => u.Id == r.BuyerId).Select(u => u.Username).FirstOrDefault(),
                r.Reason,
                r.RefundAmount,
                Status = r.Status.ToString(),
                r.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        return Ok(returns);
    }

    /// <summary>
    /// GET /api/seller/returns/{id} — Get return request detail
    /// </summary>
    [HttpGet("returns/{id:long}")]
    public async Task<IActionResult> GetReturnRequestDetail(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var shop = await db.Shops.AsNoTracking().FirstOrDefaultAsync(x => x.OwnerId == userId, cancellationToken);
        if (shop is null)
            return BadRequest(new { message = "Bạn chưa có shop." });

        var returnRequest = await db.ReturnRequests
            .AsNoTracking()
            .Where(r => r.Id == id && db.Orders.Any(o => o.Id == r.OrderId && o.ShopId == shop.Id))
            .Select(r => new
            {
                r.Id,
                r.OrderId,
                OrderNumber = db.Orders.Where(o => o.Id == r.OrderId).Select(o => o.OrderNumber).FirstOrDefault(),
                r.BuyerId,
                BuyerName = db.Users.Where(u => u.Id == r.BuyerId).Select(u => u.Username).FirstOrDefault(),
                BuyerEmail = db.Users.Where(u => u.Id == r.BuyerId).Select(u => u.Email).FirstOrDefault(),
                r.Reason,
                r.Description,
                r.EvidenceUrls,
                Status = r.Status.ToString(),
                r.SellerNote,
                r.RefundAmount,
                r.CreatedAt,
                r.UpdatedAt,
                OrderItems = db.OrderItems.Where(oi => oi.OrderId == r.OrderId).Select(oi => new
                {
                    oi.Id,
                    oi.ProductName,
                    oi.ProductImage,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.TotalPrice,
                }).ToList(),
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (returnRequest is null)
            return NotFound(new { message = "Không tìm thấy yêu cầu trả hàng." });

        return Ok(returnRequest);
    }

    /// <summary>
    /// PATCH /api/seller/returns/{id} — Seller approves or rejects return request
    /// </summary>
    [HttpPatch("returns/{id:long}")]
    public async Task<IActionResult> ProcessReturnRequest(long id, [FromBody] ProcessReturnRequestDto body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var shop = await db.Shops.AsNoTracking().FirstOrDefaultAsync(x => x.OwnerId == userId, cancellationToken);
        if (shop is null)
            return BadRequest(new { message = "Bạn chưa có shop." });

        var returnRequest = await db.ReturnRequests
            .FirstOrDefaultAsync(r => r.Id == id && db.Orders.Any(o => o.Id == r.OrderId && o.ShopId == shop.Id), cancellationToken);

        if (returnRequest is null)
            return NotFound(new { message = "Không tìm thấy yêu cầu trả hàng." });

        if (returnRequest.Status != ReturnRequestStatus.pending)
            return BadRequest(new { message = "Yêu cầu này đã được xử lý." });

        if (body.Status != ReturnRequestStatus.approved && body.Status != ReturnRequestStatus.rejected)
            return BadRequest(new { message = "Trạng thái không hợp lệ. Chỉ chấp nhận 'approved' hoặc 'rejected'." });

        var now = DateTime.UtcNow;
        returnRequest.Status = body.Status;
        returnRequest.SellerNote = body.SellerNote;
        returnRequest.UpdatedAt = now;

        string notificationTitle;
        string notificationMessage;

        if (body.Status == ReturnRequestStatus.approved)
        {
            // Update order status to refunded
            var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == returnRequest.OrderId, cancellationToken);
            if (order != null)
            {
                order.Status = OrderStatus.refunded;
                order.PaymentStatus = PaymentStatus.refunded;
                order.UpdatedAt = now;
            }

            notificationTitle = "Yêu cầu trả hàng được chấp nhận";
            notificationMessage = $"Đơn hàng {order?.OrderNumber}: Người bán đã đồng ý hoàn trả. Vui lòng liên hệ người bán qua chat để thỏa thuận phương thức hoàn tiền.";
        }
        else
        {
            notificationTitle = "Yêu cầu trả hàng bị từ chối";
            var orderNumber = await db.Orders.Where(o => o.Id == returnRequest.OrderId).Select(o => o.OrderNumber).FirstOrDefaultAsync(cancellationToken);
            notificationMessage = $"Đơn hàng {orderNumber}: Người bán đã từ chối yêu cầu trả hàng.";
            if (!string.IsNullOrWhiteSpace(body.SellerNote))
                notificationMessage += $" Lý do: {body.SellerNote}";
        }

        // Send notification to buyer
        var notification = new Notification
        {
            UserId = returnRequest.BuyerId,
            Type = "return_update",
            Title = notificationTitle,
            MessageText = notificationMessage,
            Data = $"{{\"orderId\": {returnRequest.OrderId}, \"returnRequestId\": {returnRequest.Id}, \"status\": \"{body.Status}\"}}",
            IsRead = false,
            CreatedAt = now,
        };
        db.Notifications.Add(notification);

        await db.SaveChangesAsync(cancellationToken);

        await notificationService.NotifyUserAsync(returnRequest.BuyerId, new
        {
            notification.Id,
            notification.Type,
            notification.Title,
            message = notification.MessageText,
            notification.Data,
            notification.IsRead,
            notification.CreatedAt,
        }, cancellationToken);

        var statusLabel = body.Status == ReturnRequestStatus.approved ? "chấp nhận" : "từ chối";
        return Ok(new { message = $"Đã {statusLabel} yêu cầu trả hàng." });
    }
}
