using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    /// <summary>
    /// GET /api/products?page=1&pageSize=20&category=&search=&sort=
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] long? category = null,
        [FromQuery] string? search = null,
        [FromQuery] string? brand = null,
        [FromQuery] string sort = "newest")
    {
        var query = db.Products
            .Include(p => p.Images)
            .Where(p => p.Status == "active");

        if (category.HasValue)
            query = query.Where(p => p.CategoryId == category.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => EF.Functions.ILike(p.Name, $"%{search}%"));

        if (!string.IsNullOrWhiteSpace(brand))
            query = query.Where(p => p.Brand != null && EF.Functions.ILike(p.Brand, $"%{brand}%"));

        query = sort switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "rating" => query.OrderByDescending(p => p.Rating),
            "popular" => query.OrderByDescending(p => p.SoldQuantity),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Slug,
                p.Description,
                p.Price,
                p.OriginalPrice,
                Discount = p.OriginalPrice.HasValue && p.OriginalPrice > 0
                    ? Math.Round((double)(1 - p.Price / p.OriginalPrice.Value) * 100)
                    : 0,
                p.Rating,
                p.TotalReviews,
                p.SoldQuantity,
                p.StockQuantity,
                p.Brand,
                p.CategoryId,
                p.ShopId,
                Image = p.Images.Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()
                    ?? p.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault(),
                Thumbnails = p.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).ToList()
            })
            .ToListAsync();

        return Ok(new
        {
            data = items,
            pagination = new
            {
                page,
                pageSize,
                total,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            }
        });
    }

    /// <summary>
    /// GET /api/products/{id}
    /// </summary>
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetProduct(long id)
    {
        var product = await db.Products
            .Include(p => p.Images)
            .Where(p => p.Id == id)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Slug,
                p.Description,
                p.Price,
                p.OriginalPrice,
                Discount = p.OriginalPrice.HasValue && p.OriginalPrice > 0
                    ? Math.Round((double)(1 - p.Price / p.OriginalPrice.Value) * 100)
                    : 0,
                p.Rating,
                p.TotalReviews,
                p.SoldQuantity,
                p.StockQuantity,
                p.Brand,
                p.CategoryId,
                p.ShopId,
                p.WeightGrams,
                p.Dimensions,
                p.Status,
                Image = p.Images.Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()
                    ?? p.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault(),
                Thumbnails = p.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).ToList(),
                p.CreatedAt,
                p.UpdatedAt,
            })
            .FirstOrDefaultAsync();

        if (product is null)
            return NotFound(new { message = "Sản phẩm không tồn tại." });

        return Ok(product);
    }

    /// <summary>
    /// GET /api/products/featured?limit=10
    /// Featured products with best discount + rating
    /// </summary>
    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured([FromQuery] int limit = 10)
    {
        var items = await db.Products
            .Include(p => p.Images)
            .Where(p => p.Status == "active" && p.Price > 0)
            .OrderByDescending(p => p.Rating)
            .ThenByDescending(p => p.SoldQuantity)
            .Take(limit)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Price,
                p.OriginalPrice,
                Discount = p.OriginalPrice.HasValue && p.OriginalPrice > 0
                    ? Math.Round((double)(1 - p.Price / p.OriginalPrice.Value) * 100)
                    : 0,
                p.Rating,
                p.TotalReviews,
                p.SoldQuantity,
                p.Brand,
                Image = p.Images.Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()
                    ?? p.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(items);
    }
}
