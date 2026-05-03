using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "admin")]
[Route("api/admin")]
public class AdminController(AppDbContext db) : ControllerBase
{
    // ──────────────────────────────────────────────────────────────────
    // STATS
    // ──────────────────────────────────────────────────────────────────

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken cancellationToken)
    {
        var totalUsers = await db.Users.CountAsync(cancellationToken);
        var totalShops = await db.Shops.CountAsync(cancellationToken);
        var totalProducts = await db.Products.CountAsync(cancellationToken);
        var totalOrders = await db.Orders.CountAsync(cancellationToken);
        var pendingShops = await db.Shops.CountAsync(x => x.Status == ShopStatus.pending, cancellationToken);
        var totalRevenue = await db.Orders
            .Where(x => x.PaymentStatus == PaymentStatus.paid)
            .SumAsync(x => (decimal?)x.TotalAmount, cancellationToken) ?? 0;

        return Ok(new
        {
            totalUsers,
            totalShops,
            totalProducts,
            totalOrders,
            totalRevenue,
            pendingShops,
        });
    }

    // ──────────────────────────────────────────────────────────────────
    // USERS
    // ──────────────────────────────────────────────────────────────────

    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyList<object>>> GetUsers(CancellationToken cancellationToken)
    {
        var users = await db.Users
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Take(200)
            .Select(x => new
            {
                x.Id,
                x.Username,
                x.Email,
                x.Phone,
                Role = x.Role.ToString(),
                Status = x.Status.ToString(),
                x.CreatedAt,
                HasShop = db.Shops.Any(s => s.OwnerId == x.Id),
            })
            .ToListAsync(cancellationToken);

        return Ok(users);
    }

    /// <summary>
    /// PATCH /api/admin/users/{id}/role — Admin changes a user's role (buyer ↔ seller ↔ admin)
    /// </summary>
    [HttpPatch("users/{id:long}/role")]
    public async Task<IActionResult> UpdateUserRole(long id, [FromBody] UpdateUserRoleRequest body, CancellationToken cancellationToken)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user is null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        if (!Enum.TryParse<UserRole>(body.Role, true, out var newRole))
            return BadRequest(new { message = $"Role '{body.Role}' không hợp lệ. Phải là: buyer, seller, admin." });

        var oldRole = user.Role;
        user.Role = newRole;
        user.UpdatedAt = DateTime.UtcNow;

        // If promoting to seller, create a shop if they don't have one
        if (newRole == UserRole.seller && oldRole == UserRole.buyer)
        {
            var hasShop = await db.Shops.AnyAsync(x => x.OwnerId == id, cancellationToken);
            if (!hasShop)
            {
                var slugBase = user.Username.ToLowerInvariant().Replace(' ', '-');
                var slug = slugBase;
                var n = 0;
                while (await db.Shops.AnyAsync(x => x.Slug == slug, cancellationToken))
                {
                    n++;
                    slug = $"{slugBase}-{n}";
                }

                var now = DateTime.UtcNow;
                var shop = new Shop
                {
                    OwnerId = id,
                    Name = $"Shop {user.Username}",
                    Slug = slug,
                    Description = $"Cửa hàng của {user.Username}",
                    Type = ShopType.individual,
                    Status = ShopStatus.active,
                    IsVerified = false,
                    Rating = 0,
                    TotalReviews = 0,
                    TotalProducts = 0,
                    CreatedAt = now,
                    UpdatedAt = now,
                };
                db.Shops.Add(shop);

                // Notify user
                db.Notifications.Add(new Notification
                {
                    UserId = id,
                    Type = "role_changed",
                    Title = "Bạn đã được nâng cấp thành Người bán! 🎉",
                    MessageText = $"Admin đã phê duyệt bạn trở thành người bán hàng. Cửa hàng '{shop.Name}' đã được tạo tự động. Bắt đầu đăng sản phẩm ngay!",
                    Data = $"{{\"shopId\": {shop.Id}}}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow,
                });
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = $"Đã thay đổi quyền của '{user.Username}' từ {oldRole} thành {newRole}.",
            userId = user.Id,
            username = user.Username,
            newRole = newRole.ToString(),
        });
    }

    /// <summary>
    /// PATCH /api/admin/users/{id}/status — Admin changes a user's status (active, inactive, banned)
    /// </summary>
    [HttpPatch("users/{id:long}/status")]
    public async Task<IActionResult> UpdateUserStatus(long id, [FromBody] UpdateUserStatusRequest body, CancellationToken cancellationToken)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user is null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        // Prevent admin from banning themselves
        if (this.TryGetCurrentUserId(out var currentUserId) && currentUserId == id)
            return BadRequest(new { message = "Bạn không thể thay đổi trạng thái của chính mình." });

        if (!Enum.TryParse<UserStatus>(body.Status, true, out var newStatus))
            return BadRequest(new { message = $"Status '{body.Status}' không hợp lệ." });

        user.Status = newStatus;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = $"Đã cập nhật trạng thái của '{user.Username}' thành {newStatus}." });
    }

    /// <summary>
    /// DELETE /api/admin/users/{id} — Admin deletes a user
    /// </summary>
    [HttpDelete("users/{id:long}")]
    public async Task<IActionResult> DeleteUser(long id, CancellationToken cancellationToken)
    {
        if (this.TryGetCurrentUserId(out var currentUserId) && currentUserId == id)
            return BadRequest(new { message = "Bạn không thể xóa chính mình." });

        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user is null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        db.Users.Remove(user);
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = $"Đã xóa người dùng '{user.Username}'." });
    }

    // ──────────────────────────────────────────────────────────────────
    // SHOPS
    // ──────────────────────────────────────────────────────────────────

    [HttpGet("shops")]
    public async Task<ActionResult<IReadOnlyList<object>>> GetShops(CancellationToken cancellationToken)
    {
        var shops = await db.Shops
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Take(200)
            .Select(x => new
            {
                x.Id,
                x.OwnerId,
                x.Name,
                x.Slug,
                x.Description,
                x.LogoUrl,
                x.Address,
                x.Phone,
                x.Email,
                Type = x.Type.ToString(),
                Status = x.Status.ToString(),
                x.IsVerified,
                x.Rating,
                x.TotalProducts,
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
            s.LogoUrl,
            s.Address,
            s.Phone,
            s.Email,
            s.Type,
            s.Status,
            s.IsVerified,
            s.Rating,
            s.TotalProducts,
            s.CreatedAt,
            Owner = ownerMap.TryGetValue(s.OwnerId, out var o) ? o : null,
        });

        return Ok(result);
    }

    /// <summary>
    /// PATCH /api/admin/shops/{id}/status — Admin changes shop status (pending -> active, suspend, etc.)
    /// </summary>
    [HttpPatch("shops/{id:long}/status")]
    public async Task<IActionResult> UpdateShopStatus(long id, [FromBody] UpdateShopStatusAdminRequest body, CancellationToken cancellationToken)
    {
        var shop = await db.Shops.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (shop is null)
            return NotFound(new { message = "Không tìm thấy shop." });

        if (!Enum.TryParse<ShopStatus>(body.Status, true, out var newStatus))
            return BadRequest(new { message = $"Status '{body.Status}' không hợp lệ." });

        shop.Status = newStatus;
        shop.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = $"Đã cập nhật trạng thái cửa hàng '{shop.Name}' thành {newStatus}." });
    }

    /// <summary>
    /// PATCH /api/admin/shops/{id}/verify — Toggle verified badge
    /// </summary>
    [HttpPatch("shops/{id:long}/verify")]
    public async Task<IActionResult> ToggleShopVerified(long id, [FromBody] SetVerifiedAdminRequest body, CancellationToken cancellationToken)
    {
        var shop = await db.Shops.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (shop is null)
            return NotFound(new { message = "Không tìm thấy shop." });

        shop.IsVerified = body.IsVerified;
        shop.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = $"Đã {(body.IsVerified ? "xác thực" : "hủy xác thực")} cửa hàng '{shop.Name}'." });
    }

    /// <summary>
    /// DELETE /api/admin/shops/{id} — Admin deletes a shop
    /// </summary>
    [HttpDelete("shops/{id:long}")]
    public async Task<IActionResult> DeleteShop(long id, CancellationToken cancellationToken)
    {
        var shop = await db.Shops.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (shop is null)
            return NotFound(new { message = "Không tìm thấy shop." });

        db.Shops.Remove(shop);
        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = $"Đã xóa cửa hàng '{shop.Name}'." });
    }
}

// DTO classes for admin requests
public class UpdateUserRoleRequest
{
    public string Role { get; set; } = string.Empty;
}

public class UpdateUserStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class UpdateShopStatusAdminRequest
{
    public string Status { get; set; } = string.Empty;
}

public class SetVerifiedAdminRequest
{
    public bool IsVerified { get; set; }
}
