using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]

[Route("api/[controller]")]
[Authorize]
public class FavoritesController(AppDbContext db) : ControllerBase
{
    private long GetUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return long.Parse(sub!);
    }

    /// <summary>
    /// GET /api/favorites?page=1&pageSize=20
    /// Get current user's favorited products
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetFavorites(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();

        var query = db.Favorites
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(f => f.Product)
                .ThenInclude(p => p.Images)
            .Select(f => new
            {
                FavoriteId = f.Id,
                FavoritedAt = f.CreatedAt,
                Product = new
                {
                    f.Product.Id,
                    f.Product.Name,
                    f.Product.Slug,
                    f.Product.Description,
                    f.Product.Price,
                    f.Product.OriginalPrice,
                    Discount = f.Product.OriginalPrice.HasValue && f.Product.OriginalPrice > 0
                        ? Math.Round((double)(1 - f.Product.Price / f.Product.OriginalPrice.Value) * 100)
                        : 0,
                    f.Product.Rating,
                    f.Product.TotalReviews,
                    f.Product.SoldQuantity,
                    f.Product.Brand,
                    f.Product.CategoryId,
                    f.Product.ShopId,
                    Image = f.Product.Images.Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()
                        ?? f.Product.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault(),
                }
            })
            .ToListAsync();

        return Ok(new
        {
            data = items,
            pagination = new { page, pageSize, total, totalPages = (int)Math.Ceiling(total / (double)pageSize) }
        });
    }

    /// <summary>
    /// GET /api/favorites/count
    /// Get count of user's favorites
    /// </summary>
    [HttpGet("count")]
    public async Task<IActionResult> GetFavoriteCount()
    {
        var userId = GetUserId();
        var count = await db.Favorites.CountAsync(f => f.UserId == userId);
        return Ok(new { count });
    }

    /// <summary>
    /// GET /api/favorites/{productId}/status
    /// Check if a product is favorited
    /// </summary>
    [HttpGet("{productId:long}/status")]
    public async Task<IActionResult> GetFavoriteStatus(long productId)
    {
        var userId = GetUserId();
        var exists = await db.Favorites.AnyAsync(f => f.UserId == userId && f.ProductId == productId);
        return Ok(new { isFavorited = exists });
    }

    /// <summary>
    /// POST /api/favorites/{productId}
    /// Add product to favorites
    /// </summary>
    [HttpPost("{productId:long}")]
    public async Task<IActionResult> AddFavorite(long productId)
    {
        var userId = GetUserId();

        var exists = await db.Favorites.AnyAsync(f => f.UserId == userId && f.ProductId == productId);
        if (exists)
            return Ok(new { message = "Đã có trong danh sách yêu thích." });

        var productExists = await db.Products.AnyAsync(p => p.Id == productId);
        if (!productExists)
            return NotFound(new { message = "Sản phẩm không tồn tại." });

        db.Favorites.Add(new Favorite
        {
            UserId = userId,
            ProductId = productId,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();

        return Ok(new { message = "Đã thêm vào yêu thích.", isFavorited = true });
    }

    /// <summary>
    /// DELETE /api/favorites/{productId}
    /// Remove product from favorites
    /// </summary>
    [HttpDelete("{productId:long}")]
    public async Task<IActionResult> RemoveFavorite(long productId)
    {
        var userId = GetUserId();
        var fav = await db.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);
        if (fav is null)
            return Ok(new { message = "Không có trong yêu thích.", isFavorited = false });

        db.Favorites.Remove(fav);
        await db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa khỏi yêu thích.", isFavorited = false });
    }

    /// <summary>
    /// POST /api/favorites/toggle/{productId}
    /// Toggle favorite status (add if not exists, remove if exists)
    /// </summary>
    [HttpPost("toggle/{productId:long}")]
    public async Task<IActionResult> ToggleFavorite(long productId)
    {
        var userId = GetUserId();

        var fav = await db.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);
        if (fav is not null)
        {
            db.Favorites.Remove(fav);
            await db.SaveChangesAsync();
            return Ok(new { isFavorited = false, message = "Đã xóa khỏi yêu thích." });
        }

        var productExists = await db.Products.AnyAsync(p => p.Id == productId);
        if (!productExists)
            return NotFound(new { message = "Sản phẩm không tồn tại." });

        db.Favorites.Add(new Favorite
        {
            UserId = userId,
            ProductId = productId,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
        return Ok(new { isFavorited = true, message = "Đã thêm vào yêu thích." });

    }
}
