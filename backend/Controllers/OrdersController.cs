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
public class OrdersController(AppDbContext db, INotificationRealtimeService notificationService, IShipperTrackingSimulator trackingSimulator) : ControllerBase
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
                HasReturnRequest = db.ReturnRequests.Any(r => r.OrderId == x.Id)
            })
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetOrderStats(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var stats = await db.Orders
            .AsNoTracking()
            .Where(x => x.BuyerId == userId)
            .GroupBy(x => x.Status)
            .Select(g => new { Status = g.Key.ToString().ToLower(), Count = g.Count() })
            .ToListAsync(cancellationToken);

        return Ok(stats);
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
                x.Latitude,
                x.Longitude,
                x.PoiName,
                x.FormattedAddress,
            })
            .FirstOrDefaultAsync(cancellationToken);

        var shop = await db.Shops
            .AsNoTracking()
            .Where(x => x.Id == order.ShopId)
            .Select(x => new { x.Name, x.OwnerId })
            .FirstOrDefaultAsync(cancellationToken);

        double? shopLatitude = null;
        double? shopLongitude = null;
        if (shop != null)
        {
            var shopAddress = await db.UserAddresses
                .AsNoTracking()
                .Where(x => x.UserId == shop.OwnerId && x.Latitude.HasValue && x.Longitude.HasValue)
                .OrderByDescending(x => x.IsDefault)
                .FirstOrDefaultAsync(cancellationToken);

            if (shopAddress != null)
            {
                shopLatitude = shopAddress.Latitude;
                shopLongitude = shopAddress.Longitude;
            }
        }

        return Ok(new { order, items, shippingAddress, shopName = shop?.Name, shopLatitude, shopLongitude });
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
        var totalAmount = subtotal + shippingFee - discount;

        // ── Coin (Xu) Discount ──────────────────────────────────────────
        decimal appliedCoinDiscount = 0m;
        Wallet? coinWallet = null;
        if (body.CoinDiscount > 0)
        {
            coinWallet = await db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);
            if (coinWallet == null || coinWallet.Balance < body.CoinDiscount)
            {
                return BadRequest(new { message = "Số xu không đủ để áp dụng giảm giá." });
            }

            // Cannot discount more than the order total
            appliedCoinDiscount = Math.Min(body.CoinDiscount, totalAmount);
            totalAmount -= appliedCoinDiscount;

            coinWallet.Balance -= appliedCoinDiscount;
            coinWallet.UpdatedAt = DateTime.UtcNow;

            db.WalletTransactions.Add(new WalletTransaction
            {
                WalletId = coinWallet.Id,
                Amount = -appliedCoinDiscount,
                Type = "coin_discount",
                Description = $"Dùng {appliedCoinDiscount:N0} xu giảm giá đơn hàng",
                CreatedAt = DateTime.UtcNow
            });
        }

        Wallet? userWallet = null;
        if (body.PaymentMethod == "wallet")
        {
            // Re-use the wallet we already fetched for coin discount if same user
            userWallet = coinWallet ?? await db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);
            if (userWallet == null)
            {
                userWallet = new Wallet
                {
                    UserId = userId,
                    Balance = 0m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.Wallets.Add(userWallet);
                await db.SaveChangesAsync(cancellationToken);
            }

            if (userWallet.Balance < totalAmount)
            {
                return BadRequest(new { message = $"Số dư ví không đủ để thanh toán. Số dư hiện tại: {userWallet.Balance:N0}đ" });
            }
        }

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
            DiscountAmount = discount + appliedCoinDiscount,
            TotalAmount = totalAmount,
            PaymentMethod = body.PaymentMethod,
            PaymentStatus = body.PaymentMethod == "wallet" ? PaymentStatus.paid : PaymentStatus.pending,
            Status = body.PaymentMethod == "wallet" ? OrderStatus.confirmed : OrderStatus.pending,
            Notes = body.Notes,
            OrderedAt = now,
            UpdatedAt = now,
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync(cancellationToken);

        if (body.PaymentMethod == "wallet" && userWallet != null)
        {
            userWallet.Balance -= totalAmount;
            userWallet.UpdatedAt = DateTime.UtcNow;

            db.WalletTransactions.Add(new WalletTransaction
            {
                WalletId = userWallet.Id,
                Amount = -totalAmount,
                Type = "payment",
                Description = $"Thanh toán đơn hàng {order.OrderNumber}",
                OrderId = order.Id,
                CreatedAt = DateTime.UtcNow
            });
            
            var payment = new Payment
            {
                OrderId = order.Id,
                PaymentMethod = "wallet",
                TransactionId = $"WAL-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                Amount = totalAmount,
                Currency = "VND",
                Status = PaymentStatus.paid,
                PaymentData = System.Text.Json.JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(new { source = "wallet", createdBy = userId })),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            db.Payments.Add(payment);

            var rewardAmount = totalAmount >= 200000m ? 2000m : 1000m;
            userWallet.Balance += rewardAmount;
            
            db.WalletTransactions.Add(new WalletTransaction
            {
                WalletId = userWallet.Id,
                Amount = rewardAmount,
                Type = "reward",
                Description = $"Thưởng xu thanh toán trước đơn hàng {order.OrderNumber}",
                OrderId = order.Id,
                CreatedAt = DateTime.UtcNow
            });
        }

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

        var returnedRewardAmount = body.PaymentMethod == "wallet" ? (totalAmount >= 200000m ? 2000m : 1000m) : 0m;
        return Ok(new { message = "Đặt hàng thành công.", order.Id, order.OrderNumber, order.TotalAmount, rewardAmount = returnedRewardAmount });
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

        var oldStatus = order.Status;
        var oldPaymentStatus = order.PaymentStatus;

        order.Status = body.Status;
        order.UpdatedAt = DateTime.UtcNow;

        if (body.Status == OrderStatus.shipping && oldStatus != OrderStatus.shipping)
        {
            trackingSimulator.StartTrackingSimulation(order.Id);
        }

        if ((body.Status == OrderStatus.cancelled || body.Status == OrderStatus.refunded)
            && oldPaymentStatus == PaymentStatus.paid
            && order.PaymentStatus != PaymentStatus.refunded)
        {
            order.PaymentStatus = PaymentStatus.refunded;

            var wallet = await db.Wallets.FirstOrDefaultAsync(w => w.UserId == order.BuyerId, cancellationToken);
            if (wallet == null)
            {
                wallet = new Wallet
                {
                    UserId = order.BuyerId,
                    Balance = 0m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                db.Wallets.Add(wallet);
                await db.SaveChangesAsync(cancellationToken);
            }

            wallet.Balance += order.TotalAmount;
            wallet.UpdatedAt = DateTime.UtcNow;

            db.WalletTransactions.Add(new WalletTransaction
            {
                WalletId = wallet.Id,
                Amount = order.TotalAmount,
                Type = "refund",
                Description = $"Hoàn tiền đơn hàng {order.OrderNumber} do hủy/trả hàng",
                OrderId = order.Id,
                CreatedAt = DateTime.UtcNow
            });

            var refundPayment = new Payment
            {
                OrderId = order.Id,
                PaymentMethod = order.PaymentMethod ?? "wallet",
                TransactionId = $"REF-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                Amount = order.TotalAmount,
                Currency = "VND",
                Status = PaymentStatus.refunded,
                PaymentData = System.Text.Json.JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(new { 
                    source = "auto_refund_to_wallet", 
                    refundedAmount = order.TotalAmount,
                    walletId = wallet.Id
                })),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            db.Payments.Add(refundPayment);

            var refundNotification = new Notification
            {
                UserId = order.BuyerId,
                Type = "wallet_refund",
                Title = "Hoàn tiền đơn hàng thành công",
                MessageText = $"Đơn hàng {order.OrderNumber} đã được hủy/hoàn trả. Số tiền {order.TotalAmount:N0}đ đã được hoàn lại vào Ví ShopeePay của bạn.",
                Data = $"{{\"orderId\": {order.Id}, \"refundAmount\": {order.TotalAmount}}}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            db.Notifications.Add(refundNotification);

            await db.SaveChangesAsync(cancellationToken);

            await notificationService.NotifyUserAsync(order.BuyerId, new {
                refundNotification.Id,
                refundNotification.Type,
                refundNotification.Title,
                message = refundNotification.MessageText,
                refundNotification.Data,
                refundNotification.IsRead,
                refundNotification.CreatedAt
            }, cancellationToken);
        }
        else
        {
            await db.SaveChangesAsync(cancellationToken);
        }

        return Ok(new { message = "Cập nhật trạng thái đơn hàng thành công." });
    }

    /// <summary>
    /// POST /api/orders/{id}/return — Buyer creates a return/refund request
    /// </summary>
    [HttpPost("{id:long}/return")]
    public async Task<IActionResult> CreateReturnRequest(long id, [FromBody] CreateReturnRequestDto body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == id && x.BuyerId == userId, cancellationToken);
        if (order is null)
            return NotFound(new { message = "Không tìm thấy đơn hàng." });

        if (order.Status != OrderStatus.delivered)
            return BadRequest(new { message = "Chỉ có thể yêu cầu trả hàng khi đơn hàng đã được giao." });

        // Check 7-day return window
        var daysSinceDelivered = (DateTime.UtcNow - order.UpdatedAt).TotalDays;
        if (daysSinceDelivered > 7)
            return BadRequest(new { message = "Đã quá thời hạn 7 ngày để yêu cầu trả hàng." });

        // Check if return request already exists
        var existingRequest = await db.ReturnRequests.AnyAsync(x => x.OrderId == id, cancellationToken);
        if (existingRequest)
            return Conflict(new { message = "Đơn hàng này đã có yêu cầu trả hàng." });

        var now = DateTime.UtcNow;
        var returnRequest = new ReturnRequest
        {
            OrderId = id,
            BuyerId = userId,
            Reason = body.Reason,
            Description = body.Description,
            EvidenceUrls = body.EvidenceUrls != null ? System.Text.Json.JsonSerializer.Serialize(body.EvidenceUrls) : null,
            Status = ReturnRequestStatus.pending,
            RefundAmount = order.TotalAmount,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.ReturnRequests.Add(returnRequest);

        // Notify the seller
        var shop = await db.Shops.AsNoTracking().FirstOrDefaultAsync(x => x.Id == order.ShopId, cancellationToken);
        if (shop != null)
        {
            var notification = new Notification
            {
                UserId = shop.OwnerId,
                Type = "return_request",
                Title = "Yêu cầu trả hàng mới",
                MessageText = $"Đơn hàng {order.OrderNumber} có yêu cầu trả hàng. Lý do: {body.Reason}",
                Data = $"{{\"orderId\": {order.Id}, \"returnRequestId\": {returnRequest.Id}}}",
                IsRead = false,
                CreatedAt = now,
            };
            db.Notifications.Add(notification);
            await db.SaveChangesAsync(cancellationToken);

            await notificationService.NotifyUserAsync(shop.OwnerId, new
            {
                notification.Id,
                notification.Type,
                notification.Title,
                message = notification.MessageText,
                notification.Data,
                notification.IsRead,
                notification.CreatedAt,
            }, cancellationToken);
        }
        else
        {
            await db.SaveChangesAsync(cancellationToken);
        }

        return Ok(new { message = "Gửi yêu cầu trả hàng thành công.", returnRequest.Id });
    }

    /// <summary>
    /// GET /api/orders/{id}/return — Buyer checks return request status
    /// </summary>
    [HttpGet("{id:long}/return")]
    public async Task<IActionResult> GetReturnRequest(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var order = await db.Orders.AsNoTracking().AnyAsync(x => x.Id == id && x.BuyerId == userId, cancellationToken);
        if (!order)
            return NotFound(new { message = "Không tìm thấy đơn hàng." });

        var returnRequest = await db.ReturnRequests
            .AsNoTracking()
            .Where(x => x.OrderId == id)
            .Select(x => new
            {
                x.Id,
                x.OrderId,
                x.Reason,
                x.Description,
                x.EvidenceUrls,
                Status = x.Status.ToString(),
                x.SellerNote,
                x.RefundAmount,
                x.CreatedAt,
                x.UpdatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (returnRequest is null)
            return NotFound(new { message = "Chưa có yêu cầu trả hàng cho đơn này." });

        return Ok(returnRequest);
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
