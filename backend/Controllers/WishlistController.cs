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
public class WishlistController(AppDbContext db) : ControllerBase
{
    private long GetUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return long.Parse(sub!);
    }

    /// <summary>
    /// GET /api/wishlist/collections
    /// Get all user's wishlist collections with item counts
    /// </summary>
    [HttpGet("collections")]
    public async Task<IActionResult> GetCollections()
    {
        var userId = GetUserId();
        var collections = await db.WishlistCollections
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new
            {
                c.Id,
                c.Name,
                ItemCount = c.Items.Count,
                PreviewImages = c.Items
                    .OrderByDescending(i => i.AddedAt)
                    .Take(4)
                    .Select(i =>
                        i.Product.Images.Where(img => img.IsMain).Select(img => img.ImageUrl).FirstOrDefault()
                        ?? i.Product.Images.OrderBy(img => img.SortOrder).Select(img => img.ImageUrl).FirstOrDefault()
                    ).ToList(),
                c.CreatedAt,
                c.UpdatedAt,
            })
            .ToListAsync();

        return Ok(collections);
    }

    /// <summary>
    /// POST /api/wishlist/collections
    /// Create a new wishlist collection
    /// </summary>
    [HttpPost("collections")]
    public async Task<IActionResult> CreateCollection([FromBody] CreateCollectionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Tên bộ sưu tập là bắt buộc." });

        var userId = GetUserId();
        var now = DateTime.UtcNow;

        var collection = new WishlistCollection
        {
            UserId = userId,
            Name = request.Name.Trim(),
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.WishlistCollections.Add(collection);
        await db.SaveChangesAsync();

        return Ok(new
        {
            collection.Id,
            collection.Name,
            ItemCount = 0,
            PreviewImages = new List<string>(),
            collection.CreatedAt,
            collection.UpdatedAt,
        });
    }

    /// <summary>
    /// PUT /api/wishlist/collections/{id}
    /// Rename a collection
    /// </summary>
    [HttpPut("collections/{id:long}")]
    public async Task<IActionResult> RenameCollection(long id, [FromBody] CreateCollectionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Tên bộ sưu tập là bắt buộc." });

        var userId = GetUserId();
        var collection = await db.WishlistCollections.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (collection is null)
            return NotFound(new { message = "Bộ sưu tập không tồn tại." });

        collection.Name = request.Name.Trim();
        collection.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "Đã đổi tên bộ sưu tập.", collection.Id, collection.Name });
    }

    /// <summary>
    /// DELETE /api/wishlist/collections/{id}
    /// Delete a collection (items are cascade deleted)
    /// </summary>
    [HttpDelete("collections/{id:long}")]
    public async Task<IActionResult> DeleteCollection(long id)
    {
        var userId = GetUserId();
        var collection = await db.WishlistCollections.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (collection is null)
            return NotFound(new { message = "Bộ sưu tập không tồn tại." });

        db.WishlistCollections.Remove(collection);
        await db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa bộ sưu tập." });
    }

    /// <summary>
    /// GET /api/wishlist/collections/{id}/items?page=1&pageSize=20
    /// Get products in a collection
    /// </summary>
    [HttpGet("collections/{id:long}/items")]
    public async Task<IActionResult> GetCollectionItems(
        long id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        var collectionExists = await db.WishlistCollections.AnyAsync(c => c.Id == id && c.UserId == userId);
        if (!collectionExists)
            return NotFound(new { message = "Bộ sưu tập không tồn tại." });

        var query = db.WishlistCollectionItems
            .Where(ci => ci.CollectionId == id)
            .OrderByDescending(ci => ci.AddedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(ci => ci.Product)
                .ThenInclude(p => p.Images)
            .Select(ci => new
            {
                ci.Id,
                ci.AddedAt,
                Product = new
                {
                    ci.Product.Id,
                    ci.Product.Name,
                    ci.Product.Price,
                    ci.Product.OriginalPrice,
                    Discount = ci.Product.OriginalPrice.HasValue && ci.Product.OriginalPrice > 0
                        ? Math.Round((double)(1 - ci.Product.Price / ci.Product.OriginalPrice.Value) * 100)
                        : 0,
                    ci.Product.Rating,
                    ci.Product.SoldQuantity,
                    ci.Product.Brand,
                    Image = ci.Product.Images.Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()
                        ?? ci.Product.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault(),
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
    /// POST /api/wishlist/collections/{id}/items/{productId}
    /// Add product to a collection
    /// </summary>
    [HttpPost("collections/{id:long}/items/{productId:long}")]
    public async Task<IActionResult> AddToCollection(long id, long productId)
    {
        var userId = GetUserId();
        var collection = await db.WishlistCollections.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (collection is null)
            return NotFound(new { message = "Bộ sưu tập không tồn tại." });

        var exists = await db.WishlistCollectionItems.AnyAsync(ci => ci.CollectionId == id && ci.ProductId == productId);
        if (exists)
            return Ok(new { message = "Sản phẩm đã có trong bộ sưu tập." });

        var productExists = await db.Products.AnyAsync(p => p.Id == productId);
        if (!productExists)
            return NotFound(new { message = "Sản phẩm không tồn tại." });

        db.WishlistCollectionItems.Add(new WishlistCollectionItem
        {
            CollectionId = id,
            ProductId = productId,
            AddedAt = DateTime.UtcNow,
        });
        collection.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "Đã thêm sản phẩm vào bộ sưu tập." });
    }

    /// <summary>
    /// DELETE /api/wishlist/collections/{id}/items/{productId}
    /// Remove product from a collection
    /// </summary>
    [HttpDelete("collections/{id:long}/items/{productId:long}")]
    public async Task<IActionResult> RemoveFromCollection(long id, long productId)
    {
        var userId = GetUserId();
        var collection = await db.WishlistCollections.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (collection is null)
            return NotFound(new { message = "Bộ sưu tập không tồn tại." });

        var item = await db.WishlistCollectionItems
            .FirstOrDefaultAsync(ci => ci.CollectionId == id && ci.ProductId == productId);
        if (item is null)
            return NotFound(new { message = "Sản phẩm không có trong bộ sưu tập." });

        db.WishlistCollectionItems.Remove(item);
        collection.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa sản phẩm khỏi bộ sưu tập." });
    }
}

public record CreateCollectionRequest(string Name);
