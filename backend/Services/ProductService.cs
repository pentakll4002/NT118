using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ProductService(AppDbContext db) : IProductService
{
    public async Task<ProductListResponse> GetProductsAsync(ProductQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);

        var productsQuery = BuildBaseProductQuery(normalized);
        var total = await productsQuery.CountAsync(cancellationToken);

        var rows = await productsQuery
            .Skip((normalized.Page - 1) * normalized.PageSize)
            .Take(normalized.PageSize)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Slug,
                x.Price,
                x.OriginalPrice,
                x.StockQuantity,
                x.SoldQuantity,
                x.Rating,
                x.TotalReviews,
                x.CategoryId,
                CategoryName = x.Category.Name,
                x.ShopId,
                ShopName = x.Shop.Name,
            })
            .ToListAsync(cancellationToken);

        var productIds = rows.Select(x => x.Id).ToList();
        var mainImageMap = await GetMainImageMapAsync(productIds, cancellationToken);

        var items = rows.Select(x => new ProductListItemResponse(
            x.Id,
            x.Name,
            x.Slug,
            x.Price,
            x.OriginalPrice,
            x.StockQuantity,
            x.SoldQuantity,
            x.Rating,
            x.TotalReviews,
            mainImageMap.GetValueOrDefault(x.Id),
            x.CategoryId,
            x.CategoryName,
            x.ShopId,
            x.ShopName)).ToList();

        return new ProductListResponse(normalized.Page, normalized.PageSize, total, items);
    }

    public async Task<ProductDetailResponse?> GetProductDetailAsync(long productId, CancellationToken cancellationToken = default)
    {
        var product = await db.Products
            .AsNoTracking()
            .Where(x => x.Id == productId && x.Status == ProductStatus.active)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Slug,
                x.Description,
                x.Price,
                x.OriginalPrice,
                x.StockQuantity,
                x.SoldQuantity,
                x.Rating,
                x.TotalReviews,
                x.CategoryId,
                CategoryName = x.Category.Name,
                x.ShopId,
                ShopName = x.Shop.Name,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (product is null)
            return null;

        var images = await db.ProductImages
            .AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderByDescending(x => x.IsMain)
            .ThenBy(x => x.SortOrder)
            .ThenBy(x => x.Id)
            .Select(x => new ProductImageResponse(x.Id, x.ImageUrl, x.AltText, x.SortOrder, x.IsMain))
            .ToListAsync(cancellationToken);

        var variants = await db.ProductVariants
            .AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderBy(x => x.Name)
            .ThenBy(x => x.Value)
            .Select(x => new ProductVariantResponse(x.Id, x.Name, x.Value, x.PriceModifier, x.StockQuantity, x.Sku))
            .ToListAsync(cancellationToken);

        return new ProductDetailResponse(
            product.Id,
            product.Name,
            product.Slug,
            product.Description,
            product.Price,
            product.OriginalPrice,
            product.StockQuantity,
            product.SoldQuantity,
            product.Rating,
            product.TotalReviews,
            product.CategoryId,
            product.CategoryName,
            product.ShopId,
            product.ShopName,
            images,
            variants);
    }

    public async Task<IReadOnlyList<ProductReviewItemResponse>> GetProductReviewsAsync(long productId, int limit = 50, CancellationToken cancellationToken = default)
    {
        var clampedLimit = Math.Clamp(limit, 1, 100);
        return await db.Reviews
            .AsNoTracking()
            .Where(x => x.ProductId == productId)
            .OrderByDescending(x => x.CreatedAt)
            .Take(clampedLimit)
            .Select(x => new ProductReviewItemResponse(
                x.Id,
                x.Rating,
                x.Comment,
                x.IsVerified,
                x.HelpfulVotes,
                x.CreatedAt,
                x.ReviewerId,
                x.Reviewer.Username))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetCategoriesAsync(CancellationToken cancellationToken = default) =>
        await db.Categories
            .AsNoTracking()
            .Where(x => x.Status == CategoryStatus.active)
            .OrderBy(x => x.ParentId)
            .ThenBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .Select(x => new CategoryResponse(x.Id, x.Name, x.Slug, x.ParentId, x.ImageUrl, x.SortOrder))
            .ToListAsync(cancellationToken);

    public Task<ProductListResponse> SearchProductsAsync(ProductQuery query, CancellationToken cancellationToken = default) =>
        GetProductsAsync(query, cancellationToken);

    public async Task RecordViewAsync(long userId, long productId, CancellationToken cancellationToken = default)
    {
        var exists = await db.Products.AnyAsync(x => x.Id == productId, cancellationToken);
        if (!exists)
            throw new KeyNotFoundException("Không tìm thấy sản phẩm.");

        db.ViewHistories.Add(new ViewHistory
        {
            UserId = userId,
            ProductId = productId,
            ViewedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ViewHistoryItemResponse>> GetViewHistoryAsync(long userId, int limit = 50, CancellationToken cancellationToken = default)
    {
        var clampedLimit = Math.Clamp(limit, 1, 100);

        var rows = await db.ViewHistories
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.ViewedAt)
            .Take(clampedLimit)
            .Select(x => new
            {
                x.ProductId,
                x.ViewedAt,
                ProductName = x.Product.Name,
                ProductSlug = x.Product.Slug,
            })
            .ToListAsync(cancellationToken);

        var productIds = rows.Select(x => x.ProductId).Distinct().ToList();
        var mainImageMap = await GetMainImageMapAsync(productIds, cancellationToken);

        return rows.Select(x => new ViewHistoryItemResponse(
            x.ProductId,
            x.ProductName,
            x.ProductSlug,
            mainImageMap.GetValueOrDefault(x.ProductId),
            x.ViewedAt)).ToList();
    }

    private IQueryable<Product> BuildBaseProductQuery(ProductQuery query)
    {
        var q = db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Shop)
            .Where(x => x.Status == ProductStatus.active);

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keywords = query.Keyword.Trim().ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var kw in keywords)
            {
                var keyword = kw;
                q = q.Where(x =>
                    x.Name.ToLower().Contains(keyword)
                    || x.Slug.ToLower().Contains(keyword)
                    || (x.Description != null && x.Description.ToLower().Contains(keyword)));
            }
        }

        if (!string.IsNullOrWhiteSpace(query.Brand))
        {
            var brand = query.Brand.Trim().ToLower();
            q = q.Where(x => x.Brand != null && x.Brand.ToLower() == brand);
        }

        if (query.CategoryId.HasValue)
            q = q.Where(x => x.CategoryId == query.CategoryId.Value);

        if (query.ShopId.HasValue)
            q = q.Where(x => x.ShopId == query.ShopId.Value);

        if (query.MinPrice.HasValue)
            q = q.Where(x => x.Price >= query.MinPrice.Value);

        if (query.MaxPrice.HasValue)
            q = q.Where(x => x.Price <= query.MaxPrice.Value);

        q = query.Sort?.Trim().ToLower() switch
        {
            "price_asc" => q.OrderBy(x => x.Price).ThenByDescending(x => x.Id),
            "price_desc" => q.OrderByDescending(x => x.Price).ThenByDescending(x => x.Id),
            "rating" => q.OrderByDescending(x => x.Rating).ThenByDescending(x => x.TotalReviews),
            "sold" => q.OrderByDescending(x => x.SoldQuantity).ThenByDescending(x => x.Id),
            _ => q.OrderByDescending(x => x.CreatedAt),
        };

        return q;
    }

    private ProductQuery NormalizeQuery(ProductQuery query)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        return query with { Page = page, PageSize = pageSize };
    }

    private async Task<Dictionary<long, string?>> GetMainImageMapAsync(IReadOnlyCollection<long> productIds, CancellationToken cancellationToken)
    {
        if (productIds.Count == 0)
            return new Dictionary<long, string?>();

        var imageRows = await db.ProductImages
            .AsNoTracking()
            .Where(x => productIds.Contains(x.ProductId))
            .OrderByDescending(x => x.IsMain)
            .ThenBy(x => x.SortOrder)
            .ThenBy(x => x.Id)
            .Select(x => new { x.ProductId, x.ImageUrl })
            .ToListAsync(cancellationToken);

        var map = new Dictionary<long, string?>();
        foreach (var row in imageRows)
        {
            if (!map.ContainsKey(row.ProductId))
                map[row.ProductId] = row.ImageUrl;
        }

        return map;
    }
}
