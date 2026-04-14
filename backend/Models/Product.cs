namespace Backend.Models;

public class Product
{
    public long Id { get; set; }
    public long ShopId { get; set; }
    public long CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int StockQuantity { get; set; }
    public int SoldQuantity { get; set; }
    public decimal Rating { get; set; }
    public int TotalReviews { get; set; }
    public string Status { get; set; } = "active";
    public int? WeightGrams { get; set; }
    public string? Dimensions { get; set; }
    public string? Brand { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public List<ProductImage> Images { get; set; } = new();
}
