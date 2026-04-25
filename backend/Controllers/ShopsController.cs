using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/shops")]
public class ShopsController(AppDbContext db) : ControllerBase
{
    [Authorize]
    [HttpPost("register")]
    public async Task<IActionResult> RegisterShop([FromBody] CreateShopRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var hasShop = await db.Shops.AnyAsync(x => x.OwnerId == userId, cancellationToken);
        if (hasShop)
            return Conflict(new { message = "Bạn đã có shop." });

        var slugExists = await db.Shops.AnyAsync(x => x.Slug == body.Slug, cancellationToken);
        if (slugExists)
            return Conflict(new { message = "Slug shop đã tồn tại." });

        var now = DateTime.UtcNow;
        var shop = new Shop
        {
            OwnerId = userId,
            Name = body.Name,
            Slug = body.Slug,
            Description = body.Description,
            LogoUrl = body.LogoUrl,
            CoverImageUrl = body.CoverImageUrl,
            Address = body.Address,
            Phone = body.Phone,
            Email = body.Email,
            Rating = 0,
            TotalReviews = 0,
            TotalProducts = 0,
            Status = ShopStatus.active,
            IsVerified = false,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Shops.Add(shop);

        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);
        if (user is not null && user.Role == UserRole.buyer)
            user.Role = UserRole.seller;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Đăng ký cửa hàng thành công.", shop.Id, shop.Name });
    }

    [Authorize]
    [HttpPost("{id:long}/follow")]
    public async Task<IActionResult> FollowShop(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var shopExists = await db.Shops.AnyAsync(x => x.Id == id, cancellationToken);
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

        db.Follows.Remove(follow);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyShop(CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var shop = await db.Shops.FirstOrDefaultAsync(x => x.OwnerId == userId, cancellationToken);
        if (shop is null)
            return NotFound(new { message = "Bạn chưa có shop." });

        return Ok(shop);
    }
}
