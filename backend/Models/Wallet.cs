using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("wallets")]
public class Wallet
{
    [Column("id")]
    public long Id { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("balance")]
    public decimal Balance { get; set; }

    [Column("coin_balance")]
    public decimal CoinBalance { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
    public List<WalletTransaction> Transactions { get; set; } = [];
}
