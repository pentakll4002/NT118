namespace Backend.Models;

public class Shop
{
    public long Id { get; set; }
    public long OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? BusinessHours { get; set; }
    public ShopType Type { get; set; } = ShopType.individual;
    public decimal Rating { get; set; }
    public int TotalReviews { get; set; }
    public int TotalProducts { get; set; }
    public ShopStatus Status { get; set; } = ShopStatus.pending;
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<Product> Products { get; set; } = [];
}

