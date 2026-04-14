namespace Backend.Models;

public class WishlistCollectionItem
{
    public long Id { get; set; }
    public long CollectionId { get; set; }
    public long ProductId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public WishlistCollection Collection { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
