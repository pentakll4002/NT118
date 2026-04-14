using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("favorites")]
public class Favorite
{
    [Column("id")]
    public long Id { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("product_id")]
    public long ProductId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Product Product { get; set; } = null!;
}
