using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("payments")]
public class Payment
{
    [Column("id")]
    public long Id { get; set; }

    [Column("order_id")]
    public long OrderId { get; set; }

    [Column("payment_method")]
    public string PaymentMethod { get; set; } = string.Empty;

    [Column("transaction_id")]
    public string? TransactionId { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("currency")]
    public string Currency { get; set; } = "VND";

    [Column("status")]
    public PaymentStatus Status { get; set; } = PaymentStatus.pending;

    [Column("payment_data", TypeName = "jsonb")]
    public System.Text.Json.JsonDocument? PaymentData { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
