using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("wallet_transactions")]
public class WalletTransaction
{
    [Column("id")]
    public long Id { get; set; }

    [Column("wallet_id")]
    public long WalletId { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("type")]
    public string Type { get; set; } = string.Empty; // "refund", "payment", "topup"

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("order_id")]
    public long? OrderId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    public Wallet Wallet { get; set; } = null!;
}
