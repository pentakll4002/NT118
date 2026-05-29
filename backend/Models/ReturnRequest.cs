using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("return_requests")]
public class ReturnRequest
{
    [Column("id")]
    public long Id { get; set; }

    [Column("order_id")]
    public long OrderId { get; set; }

    [Column("buyer_id")]
    public long BuyerId { get; set; }

    [Column("reason")]
    public string Reason { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("evidence_urls")]
    public string? EvidenceUrls { get; set; }

    [Column("status")]
    public ReturnRequestStatus Status { get; set; } = ReturnRequestStatus.pending;

    [Column("seller_note")]
    public string? SellerNote { get; set; }

    [Column("refund_amount")]
    public decimal RefundAmount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
    public User Buyer { get; set; } = null!;
}
