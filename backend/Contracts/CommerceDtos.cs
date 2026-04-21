using Backend.Models;
using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts;

public record AddToCartRequest(
    [property: Range(1, long.MaxValue)] long ProductId,
    long? VariantId,
    [property: Range(1, 1000)] int Quantity = 1);

public record UpdateCartItemRequest([property: Range(1, 1000)] int Quantity);

public record CreateReviewRequest(
    [property: Range(1, long.MaxValue)] long OrderId,
    [property: Range(1, 5)] int Rating,
    [property: MaxLength(2000)] string? Comment);

public record CreateCategoryRequest(
    [property: Required, MaxLength(100)] string Name,
    [property: Required, MaxLength(100), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")] string Slug,
    [property: MaxLength(1000)] string? Description,
    long? ParentId,
    [property: MaxLength(500)] string? ImageUrl,
    int SortOrder = 0,
    CategoryStatus Status = CategoryStatus.active);

public record UpdateCategoryRequest(
    [property: Required, MaxLength(100)] string Name,
    [property: Required, MaxLength(100), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")] string Slug,
    [property: MaxLength(1000)] string? Description,
    long? ParentId,
    [property: MaxLength(500)] string? ImageUrl,
    int SortOrder = 0,
    CategoryStatus Status = CategoryStatus.active);

public record CreateOrderItemRequest(
    [property: Range(1, long.MaxValue)] long ProductId,
    long? VariantId,
    [property: Range(1, 1000)] int Quantity);

public record CreateOrderRequest(
    [property: Range(1, long.MaxValue)] long ShippingAddressId,
    [property: Required, MinLength(1)]
    IReadOnlyList<CreateOrderItemRequest> Items,
    [property: MaxLength(50)] string? PaymentMethod,
    [property: MaxLength(1000)] string? Notes,
    [property: MaxLength(50)] string? VoucherCode);

public record UpdateOrderStatusRequest(OrderStatus Status);

public record CreateVoucherRequest(
    [property: Required, MaxLength(50), RegularExpression("^[A-Z0-9_-]+$")] string Code,
    [property: Required, MaxLength(255)] string Name,
    [property: MaxLength(1000)] string? Description,
    VoucherDiscountType DiscountType,
    [property: Range(typeof(decimal), "0.01", "999999999")] decimal DiscountValue,
    decimal? MinOrderValue,
    decimal? MaxDiscount,
    int? UsageLimit,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive = true);

public record UpdateVoucherRequest(
    [property: Required, MaxLength(255)] string Name,
    [property: MaxLength(1000)] string? Description,
    VoucherDiscountType DiscountType,
    [property: Range(typeof(decimal), "0.01", "999999999")] decimal DiscountValue,
    decimal? MinOrderValue,
    decimal? MaxDiscount,
    int? UsageLimit,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive = true);

public record ApplyVoucherRequest(
    [property: Required, MaxLength(50)] string Code,
    [property: Range(typeof(decimal), "0.01", "999999999")] decimal OrderAmount);

public class CreatePaymentRequest
{
    [Range(1, long.MaxValue)]
    public long OrderId { get; set; }

    [Required]
    [MaxLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal Amount { get; set; }

    [Required]
    [MinLength(3)]
    [MaxLength(10)]
    public string Currency { get; set; } = "VND";
}

public record CreateShopRequest(
    [property: Required, MaxLength(100)] string Name,
    [property: Required, MaxLength(100), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")] string Slug,
    [property: MaxLength(2000)] string? Description,
    [property: MaxLength(500)] string? LogoUrl,
    [property: MaxLength(500)] string? CoverImageUrl,
    [property: MaxLength(500)] string? Address,
    [property: MaxLength(20)] string? Phone,
    [property: EmailAddress, MaxLength(100)] string? Email);

public record SendMessageRequest(
    [property: Range(1, long.MaxValue)] long ReceiverId,
    [property: MaxLength(4000)] string? Content,
    long? OrderId,
    [property: MaxLength(500)] string? AttachmentUrl,
    MessageType MessageType = MessageType.text);

public record CreateSellerProductRequest(
    [property: Range(1, long.MaxValue)] long CategoryId,
    [property: Required, MaxLength(255)] string Name,
    [property: Required, MaxLength(255), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")] string Slug,
    [property: MaxLength(2000)] string? Description,
    [property: Range(typeof(decimal), "0.01", "999999999")] decimal Price,
    decimal? OriginalPrice,
    [property: Range(0, 1000000)] int StockQuantity);
