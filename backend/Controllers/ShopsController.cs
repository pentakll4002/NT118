using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/shops")]
public class ShopsController(AppDbContext db) : ControllerBase
{
    // ──────────────────────────────────────────────────────────────────
    // PUBLIC
    // ──────────────────────────────────────────────────────────────────

    /// <summary>GET /api/shops/{id} — Public: fetch shop details by ID</summary>
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetShopById(long id, CancellationToken cancellationToken)
    {
        var shop = await db.Shops
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (shop is null)
            return NotFound(new { message = "Không tìm thấy shop." });

        // Only return active/verified shops to the public
        if (shop.Status == ShopStatus.pending)
            return NotFound(new { message = "Shop đang chờ được duyệt." });

        var followerCount = await db.Follows.CountAsync(x => x.ShopId == id, cancellationToken);

        bool isFollowing = false;
        if (this.TryGetCurrentUserId(out var currentUserId))
        {
            isFollowing = await db.Follows.AnyAsync(
                x => x.UserId == currentUserId && x.ShopId == id, cancellationToken);
        }

        return Ok(new
        {
            shop.Id,
            shop.OwnerId,
            shop.Name,
            shop.Slug,
            shop.Description,
            shop.LogoUrl,
            shop.CoverImageUrl,
            shop.Address,
            shop.Phone,
            shop.Email,
            shop.BusinessHours,
            Type = shop.Type.ToString(),
            shop.Rating,
            shop.TotalReviews,
            shop.TotalProducts,
            Status = shop.Status.ToString(),
            shop.IsVerified,
            shop.CreatedAt,
            shop.UpdatedAt,
            FollowerCount = followerCount,
            IsFollowing = isFollowing,
        });
    }

    // ──────────────────────────────────────────────────────────────────
    // INDIVIDUAL SELLER REGISTRATION (requires admin approval)
    // ──────────────────────────────────────────────────────────────────

    /// <summary>
    /// POST /api/shops/register — Personal seller submits a shop registration request.
    /// Shop starts as 'pending' and must be approved by an admin before going live.
    /// </summary>
    [Authorize]
    [HttpPost("register")]
    public async Task<IActionResult> RegisterShop([FromBody] CreateShopRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var hasShop = await db.Shops.AnyAsync(x => x.OwnerId == userId, cancellationToken);
        if (hasShop)
            return Conflict(new { message = "Bạn đã có shop (đang chờ duyệt hoặc đã hoạt động)." });

        var slugExists = await db.Shops.AnyAsync(x => x.Slug == body.Slug, cancellationToken);
        if (slugExists)
            return Conflict(new { message = "Slug shop đã tồn tại." });

        var now = DateTime.UtcNow;

        // Compose full address from structured parts if not provided directly
        var composedAddress = body.Address;
        if (string.IsNullOrWhiteSpace(composedAddress))
        {
            var parts = new[] { body.StreetAddress, body.Ward, body.District, body.Province }
                .Where(p => !string.IsNullOrWhiteSpace(p));
            composedAddress = string.Join(", ", parts);
        }

        var shop = new Shop
        {
            OwnerId = userId,
            Name = body.Name,
            Slug = body.Slug,
            Description = body.Description,
            LogoUrl = body.LogoUrl,
            CoverImageUrl = body.CoverImageUrl,
            Address = composedAddress,
            Phone = body.Phone,
            Email = body.Email,
            Type = ShopType.individual,
            Status = ShopStatus.pending,
            IsVerified = false,
            Rating = 0,
            TotalReviews = 0,
            TotalProducts = 0,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Shops.Add(shop);
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Đăng ký cửa hàng thành công. Vui lòng chờ admin duyệt (thường 1–3 ngày làm việc).",
            shop.Id,
            shop.Name,
            Status = shop.Status.ToString(),
        });
    }

    /// <summary>GET /api/shops/mine — Logged-in seller views their own shop (including pending status)</summary>
    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyShop(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var shop = await db.Shops.FirstOrDefaultAsync(x => x.OwnerId == userId, cancellationToken);
        if (shop is null)
            return NotFound(new { message = "Bạn chưa có shop." });

        return Ok(new
        {
            shop.Id,
            shop.Name,
            shop.Slug,
            shop.Description,
            shop.LogoUrl,
            shop.CoverImageUrl,
            shop.Address,
            shop.Phone,
            shop.Email,
            shop.BusinessHours,
            Type = shop.Type.ToString(),
            Status = shop.Status.ToString(),
            shop.IsVerified,
            shop.Rating,
            shop.TotalProducts,
            shop.CreatedAt,
            shop.UpdatedAt,
        });
    }

    /// <summary>PATCH /api/shops/mine — Shop owner updates their shop profile</summary>
    [Authorize]
    [HttpPatch("mine")]
    public async Task<IActionResult> UpdateMyShop([FromBody] UpdateShopRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var shop = await db.Shops.FirstOrDefaultAsync(x => x.OwnerId == userId, cancellationToken);
        if (shop is null)
            return NotFound(new { message = "Bạn chưa có shop." });

        if (!string.IsNullOrWhiteSpace(body.Name)) shop.Name = body.Name;
        if (!string.IsNullOrWhiteSpace(body.Description)) shop.Description = body.Description;
        if (!string.IsNullOrWhiteSpace(body.LogoUrl)) shop.LogoUrl = body.LogoUrl;
        if (!string.IsNullOrWhiteSpace(body.CoverImageUrl)) shop.CoverImageUrl = body.CoverImageUrl;
        if (!string.IsNullOrWhiteSpace(body.Address)) shop.Address = body.Address;
        if (!string.IsNullOrWhiteSpace(body.Phone)) shop.Phone = body.Phone;
        if (!string.IsNullOrWhiteSpace(body.Email)) shop.Email = body.Email;
        if (!string.IsNullOrWhiteSpace(body.BusinessHours)) shop.BusinessHours = body.BusinessHours;
        shop.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Cập nhật thông tin cửa hàng thành công." });
    }

    // ──────────────────────────────────────────────────────────────────
    // FOLLOW / UNFOLLOW
    // ──────────────────────────────────────────────────────────────────

    [Authorize]
    [HttpPost("{id:long}/follow")]
    public async Task<IActionResult> FollowShop(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var shopExists = await db.Shops.AnyAsync(x => x.Id == id && x.Status == ShopStatus.active, cancellationToken);
        if (!shopExists)
            return NotFound(new { message = "Không tìm thấy shop." });

        var exists = await db.Follows.AnyAsync(x => x.UserId == userId && x.ShopId == id, cancellationToken);
        if (!exists)
        {
            db.Follows.Add(new Follow
            {
                UserId = userId,
                ShopId = id,
                CreatedAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync(cancellationToken);
        }

        return Ok(new { message = "Đã follow shop." });
    }

    [Authorize]
    [HttpDelete("{id:long}/follow")]
    public async Task<IActionResult> UnfollowShop(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var follow = await db.Follows.FirstOrDefaultAsync(x => x.UserId == userId && x.ShopId == id, cancellationToken);
        if (follow is not null)
        {
            db.Follows.Remove(follow);
            await db.SaveChangesAsync(cancellationToken);
        }

        return NoContent();
    }

    // ──────────────────────────────────────────────────────────────────
    // ADMIN ENDPOINTS
    // ──────────────────────────────────────────────────────────────────

    /// <summary>
    /// GET /api/shops/admin/pending — Admin lists all shops pending approval
    /// </summary>
    [Authorize]
    [HttpGet("admin/pending")]
    public async Task<IActionResult> GetPendingShops(CancellationToken cancellationToken)
    {
        if (!this.IsAdmin())
            return Forbid();

        var shops = await db.Shops
            .AsNoTracking()
            .Where(x => x.Status == ShopStatus.pending)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.OwnerId,
                x.Name,
                x.Slug,
                x.Description,
                x.Address,
                x.Phone,
                x.Email,
                Type = x.Type.ToString(),
                Status = x.Status.ToString(),
                x.IsVerified,
                x.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        // Enrich with owner info
        var ownerIds = shops.Select(s => s.OwnerId).Distinct().ToList();
        var owners = await db.Users
            .AsNoTracking()
            .Where(x => ownerIds.Contains(x.Id))
            .Select(x => new { x.Id, x.Username, x.Email, x.Phone })
            .ToListAsync(cancellationToken);

        var ownerMap = owners.ToDictionary(o => o.Id);
        var result = shops.Select(s => new
        {
            s.Id,
            s.OwnerId,
            s.Name,
            s.Slug,
            s.Description,
            s.Address,
            s.Phone,
            s.Email,
            s.Type,
            s.Status,
            s.IsVerified,
            s.CreatedAt,
            Owner = ownerMap.TryGetValue(s.OwnerId, out var o) ? o : null,
        });

        return Ok(result);
    }

    /// <summary>
    /// PATCH /api/shops/admin/{id}/approve — Admin approves a pending shop
    /// </summary>
    [Authorize]
    [HttpPatch("admin/{id:long}/approve")]
    public async Task<IActionResult> ApproveShop(long id, CancellationToken cancellationToken)
    {
        if (!this.IsAdmin())
            return Forbid();

        var shop = await db.Shops.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (shop is null)
            return NotFound(new { message = "Không tìm thấy shop." });

        if (shop.Status != ShopStatus.pending)
            return BadRequest(new { message = $"Shop đang ở trạng thái '{shop.Status}', không thể duyệt." });

        shop.Status = ShopStatus.active;
        shop.UpdatedAt = DateTime.UtcNow;

        // Promote owner to seller role
        var owner = await db.Users.FirstOrDefaultAsync(x => x.Id == shop.OwnerId, cancellationToken);
        if (owner is not null && owner.Role == UserRole.buyer)
        {
            owner.Role = UserRole.seller;
            owner.UpdatedAt = DateTime.UtcNow;
        }

        // Create approval notification for the shop owner
        var notification = new Notification
        {
            UserId = shop.OwnerId,
            Type = "shop_approved",
            Title = "Cửa hàng của bạn đã được duyệt! 🎉",
            MessageText = $"Chúc mừng! Cửa hàng '{shop.Name}' của bạn đã được phê duyệt và đang hoạt động. Hãy bắt đầu bán hàng ngay!",
            Data = $"{{\"shopId\": {shop.Id}}}",
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        };
        db.Notifications.Add(notification);

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { message = $"Đã duyệt cửa hàng '{shop.Name}' thành công." });
    }

    /// <summary>
    /// PATCH /api/shops/admin/{id}/reject — Admin rejects a pending shop
    /// </summary>
    [Authorize]
    [HttpPatch("admin/{id:long}/reject")]
    public async Task<IActionResult> RejectShop(long id, [FromBody] RejectShopRequest body, CancellationToken cancellationToken)
    {
        if (!this.IsAdmin())
            return Forbid();

        var shop = await db.Shops.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (shop is null)
            return NotFound(new { message = "Không tìm thấy shop." });

        if (shop.Status != ShopStatus.pending)
            return BadRequest(new { message = $"Shop không ở trạng thái chờ duyệt." });

        // Instead of deleting, mark as suspended with a reason
        shop.Status = ShopStatus.suspended;
        shop.UpdatedAt = DateTime.UtcNow;

        var notification = new Notification
        {
            UserId = shop.OwnerId,
            Type = "shop_rejected",
            Title = "Yêu cầu mở cửa hàng bị từ chối",
            MessageText = body.Reason ?? $"Yêu cầu mở cửa hàng '{shop.Name}' đã bị từ chối. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.",
            Data = $"{{\"shopId\": {shop.Id}}}",
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        };
        db.Notifications.Add(notification);

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { message = $"Đã từ chối cửa hàng '{shop.Name}'." });
    }

    /// <summary>
    /// POST /api/shops/admin/business — Admin creates a business/enterprise shop (e.g. GearVN)
    /// These shops are immediately active and verified.
    /// </summary>
    [Authorize]
    [HttpPost("admin/business")]
    public async Task<IActionResult> CreateBusinessShop([FromBody] CreateBusinessShopRequest body, CancellationToken cancellationToken)
    {
        if (!this.IsAdmin())
            return Forbid();

        var slugExists = await db.Shops.AnyAsync(x => x.Slug == body.Slug, cancellationToken);
        if (slugExists)
            return Conflict(new { message = "Slug shop đã tồn tại." });

        // Verify the owner account exists
        var ownerUser = await db.Users.FirstOrDefaultAsync(x => x.Id == body.OwnerId, cancellationToken);
        if (ownerUser is null)
            return BadRequest(new { message = "Tài khoản người dùng không tồn tại." });

        var hasShop = await db.Shops.AnyAsync(x => x.OwnerId == body.OwnerId, cancellationToken);
        if (hasShop)
            return Conflict(new { message = "Tài khoản này đã liên kết với một shop." });

        var now = DateTime.UtcNow;
        var shop = new Shop
        {
            OwnerId = body.OwnerId,
            Name = body.Name,
            Slug = body.Slug,
            Description = body.Description,
            LogoUrl = body.LogoUrl,
            CoverImageUrl = body.CoverImageUrl,
            Address = body.Address,
            Phone = body.Phone,
            Email = body.Email,
            BusinessHours = body.BusinessHours,
            Type = ShopType.business,      // Enterprise shop
            Status = ShopStatus.active,    // Immediately active
            IsVerified = true,             // Pre-verified
            Rating = 0,
            TotalReviews = 0,
            TotalProducts = 0,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Shops.Add(shop);

        // Promote owner to seller
        if (ownerUser.Role != UserRole.admin)
        {
            ownerUser.Role = UserRole.seller;
            ownerUser.UpdatedAt = now;
        }

        await db.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = $"Đã tạo cửa hàng doanh nghiệp '{shop.Name}' thành công.",
            shop.Id,
            shop.Name,
            shop.Slug,
            Type = shop.Type.ToString(),
            Status = shop.Status.ToString(),
            shop.IsVerified,
        });
    }

    /// <summary>
    /// PATCH /api/shops/admin/{id}/verify — Admin toggles verified badge on any shop
    /// </summary>
    [Authorize]
    [HttpPatch("admin/{id:long}/verify")]
    public async Task<IActionResult> SetVerified(long id, [FromBody] SetVerifiedRequest body, CancellationToken cancellationToken)
    {
        if (!this.IsAdmin())
            return Forbid();

        var shop = await db.Shops.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (shop is null)
            return NotFound(new { message = "Không tìm thấy shop." });

        shop.IsVerified = body.IsVerified;
        shop.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = $"Đã {(body.IsVerified ? "xác thực" : "hủy xác thực")} cửa hàng '{shop.Name}'." });
    }

    /// <summary>
    /// GET /api/shops/admin/all — Admin lists all shops with filters
    /// </summary>
    [Authorize]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllShops(
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (!this.IsAdmin())
            return Forbid();

        var query = db.Shops.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ShopStatus>(status, true, out var statusEnum))
            query = query.Where(x => x.Status == statusEnum);

        var total = await query.CountAsync(cancellationToken);
        var shops = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.OwnerId,
                x.Name,
                x.Slug,
                Type = x.Type.ToString(),
                Status = x.Status.ToString(),
                x.IsVerified,
                x.Rating,
                x.TotalProducts,
                x.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        return Ok(new { total, page, pageSize, shops });
    }

    [Authorize]
    [HttpGet("followed")]
    public async Task<IActionResult> GetFollowedShops(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var shops = await db.Follows
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Join(db.Shops, f => f.ShopId, s => s.Id, (f, s) => s)
            .Select(x => x.ShopId)
            .Join(db.Shops,
                shopId => shopId,
                shop => shop.Id,
                (shopId, shop) => shop)
            .Select(x => new ShopResponse(
                x.Id,
                x.Name,
                x.Slug,
                x.Description,
                x.LogoUrl,
                x.CoverImageUrl,
                x.Address,
                x.Rating,
                x.TotalReviews,
                x.TotalProducts,
                x.IsVerified,
                x.CreatedAt))
            .ToListAsync(cancellationToken);

        return Ok(shops);
    }

    [Authorize]
    [HttpGet("{id:long}/follow-status")]
    public async Task<IActionResult> GetFollowStatus(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var follow = await db.Follows
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.ShopId == id, cancellationToken);

        return Ok(new FollowStatusResponse(follow != null, follow?.CreatedAt));
    }    
}

