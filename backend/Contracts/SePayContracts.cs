using System.Text.Json.Serialization;

namespace Backend.Contracts;

public class SePayWebhookRequest
{
    // Common fields
    [JsonPropertyName("amount")]
    public decimal? Amount { get; set; }

    [JsonPropertyName("account_number")]
    public string? AccountNumberExample { get; set; }

    // Actual SEPay fields
    [JsonPropertyName("id")]
    public long? Id { get; set; }

    [JsonPropertyName("gateway")]
    public string? Gateway { get; set; }

    [JsonPropertyName("transactionDate")]
    public string? TransactionDate { get; set; }

    [JsonPropertyName("accountNumber")]
    public string? AccountNumber { get; set; }

    [JsonPropertyName("subAccount")]
    public string? SubAccount { get; set; }

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("transferType")]
    public string? TransferType { get; set; }

    [JsonPropertyName("transferAmount")]
    public decimal? TransferAmount { get; set; }

    [JsonPropertyName("accumulated")]
    public decimal? Accumulated { get; set; }

    public decimal GetAmount() => Amount ?? TransferAmount ?? 0;
    public string GetAccountNumber() => AccountNumberExample ?? AccountNumber ?? string.Empty;
}
