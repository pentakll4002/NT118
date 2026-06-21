namespace Backend.Models;

public class ProductVariant
{
    public long Id { get; set; }
    public long ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public decimal PriceModifier { get; set; }
    public int StockQuantity { get; set; }
    public string? Sku { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }

    public Product Product { get; set; } = null!;
}
