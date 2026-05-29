using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts;

public record ProductQuery(
    [property: MaxLength(255)] string? Keyword,
    long? CategoryId,
    long? ShopId,
    decimal? MinPrice,
    decimal? MaxPrice,
    string? Brand,
    [property: RegularExpression("^(price_asc|price_desc|rating|sold)?$")] string? Sort,
    [property: Range(1, 100000)] int Page = 1,
    [property: Range(1, 100)] int PageSize = 20);

public record ProductListItemResponse(
    long Id,
    string Name,
    string Slug,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    int SoldQuantity,
    decimal Rating,
    int TotalReviews,
    string? MainImageUrl,
    long CategoryId,
    string CategoryName,
    long ShopId,
    string ShopName);

public record ProductImageResponse(long Id, string ImageUrl, string? AltText, int SortOrder, bool IsMain);

public record ProductVariantResponse(long Id, string Name, string Value, decimal PriceModifier, int StockQuantity, string? Sku);

public record ProductDetailResponse(
    long Id,
    string Name,
    string Slug,
    string? Description,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    int SoldQuantity,
    decimal Rating,
    int TotalReviews,
    long CategoryId,
    string CategoryName,
    long ShopId,
    string ShopName,
    IReadOnlyList<ProductImageResponse> Images,
    IReadOnlyList<ProductVariantResponse> Variants);

public record ProductListResponse(int Page, int PageSize, int TotalItems, IReadOnlyList<ProductListItemResponse> Items);

public record CategoryResponse(long Id, string Name, string Slug, long? ParentId, string? ImageUrl, int SortOrder);

public record ViewHistoryItemResponse(long ProductId, string ProductName, string ProductSlug, string? MainImageUrl, DateTime ViewedAt);

public record ProductReviewItemResponse(
    long Id,
    int Rating,
    string? Comment,
    bool IsVerified,
    int HelpfulVotes,
    DateTime CreatedAt,
    long ReviewerId,
    string ReviewerName);
