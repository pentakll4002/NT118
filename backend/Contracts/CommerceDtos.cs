using Backend.Models;
using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts;

public class AddToCartRequest
{
    [Range(1, long.MaxValue)]
    public long ProductId { get; set; }

    public long? VariantId { get; set; }

    [Range(1, 1000)]
    public int Quantity { get; set; } = 1;
}

public class UpdateCartItemRequest
{
    [Range(1, 1000)]
    public int Quantity { get; set; }
}

public class CreateReviewRequest
{
    [Range(1, long.MaxValue)]
    public long OrderId { get; set; }

    [Range(1, long.MaxValue)]
    public long ProductId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(2000)]
    public string? Comment { get; set; }
}

public class CreateCategoryRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public long? ParentId { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public int SortOrder { get; set; } = 0;

    public CategoryStatus Status { get; set; } = CategoryStatus.active;
}

public class UpdateCategoryRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public long? ParentId { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public int SortOrder { get; set; } = 0;

    public CategoryStatus Status { get; set; } = CategoryStatus.active;
}

public class CreateOrderItemRequest
{
    [Range(1, long.MaxValue)]
    public long ProductId { get; set; }

    public long? VariantId { get; set; }

    [Range(1, 1000)]
    public int Quantity { get; set; }
}

public class CreateOrderRequest
{
    [Range(1, long.MaxValue)]
    public long ShippingAddressId { get; set; }

    [Required, MinLength(1)]
    public IReadOnlyList<CreateOrderItemRequest> Items { get; set; } = new List<CreateOrderItemRequest>();

    [MaxLength(50)]
    public string? PaymentMethod { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [MaxLength(50)]
    public string? VoucherCode { get; set; }
}

public class EstimateShippingFeeRequest
{
    [Range(1, long.MaxValue)]
    public long ShippingAddressId { get; set; }

    [Required, MinLength(1)]
    public IReadOnlyList<CreateOrderItemRequest> Items { get; set; } = new List<CreateOrderItemRequest>();
}

public class UpdateOrderStatusRequest
{
    [Required]
    public OrderStatus Status { get; set; }
}

public class CreateVoucherRequest
{
    [Required, MaxLength(50), RegularExpression("^[A-Z0-9_-]+$")]
    public string Code { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public VoucherDiscountType DiscountType { get; set; }

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal DiscountValue { get; set; }

    public decimal? MinOrderValue { get; set; }
    public decimal? MaxDiscount { get; set; }
    public int? UsageLimit { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateVoucherRequest
{
    [Required, MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public VoucherDiscountType DiscountType { get; set; }

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal DiscountValue { get; set; }

    public decimal? MinOrderValue { get; set; }
    public decimal? MaxDiscount { get; set; }
    public int? UsageLimit { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ApplyVoucherRequest
{
    [Required, MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal OrderAmount { get; set; }
}

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

public class CreateShopRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    [MaxLength(500)]
    public string? CoverImageUrl { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? Province { get; set; }

    [MaxLength(100)]
    public string? District { get; set; }

    [MaxLength(100)]
    public string? Ward { get; set; }

    [MaxLength(300)]
    public string? StreetAddress { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [EmailAddress, MaxLength(100)]
    public string? Email { get; set; }
}

public record CreateSellerProductRequest(
    [property: Range(1, long.MaxValue)] long CategoryId,
    [property: Required, MaxLength(255)] string Name,
    [property: Required, MaxLength(255), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")] string Slug,
    [property: MaxLength(2000)] string? Description,
    [property: Range(typeof(decimal), "0.01", "999999999")] decimal Price,
    decimal? OriginalPrice,
    [property: Range(0, 1000000)] int StockQuantity);

public record ShopResponse(
    long Id,
    string Name,
    string Slug,
    string? Description,
    string? LogoUrl,
    string? CoverImageUrl,
    string? Address,
    decimal Rating,
    int TotalReviews,
    int TotalProducts,
    bool IsVerified,
    DateTime CreatedAt);

public record FollowStatusResponse(bool IsFollowing, DateTime? FollowedAt);

public class SendMessageRequest
{
    [Range(1, long.MaxValue)]
    public long ReceiverId { get; set; }

    [MaxLength(4000)]
    public string? Content { get; set; }

    public long? OrderId { get; set; }

    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    public MessageType MessageType { get; set; } = MessageType.text;
}

public class UpdateShopRequest
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    [MaxLength(500)]
    public string? CoverImageUrl { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [EmailAddress, MaxLength(100)]
    public string? Email { get; set; }

    [MaxLength(200)]
    public string? BusinessHours { get; set; }
}

public class UpdateSellerOrderStatusRequest
{
    [Required]
    public OrderStatus Status { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}

public class RejectShopRequest
{
    [MaxLength(1000)]
    public string? Reason { get; set; }
}

public class SetVerifiedRequest
{
    public bool IsVerified { get; set; }
}

public class CreateBusinessShopRequest
{
    [Required]
    public long OwnerId { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    [MaxLength(500)]
    public string? CoverImageUrl { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [EmailAddress, MaxLength(100)]
    public string? Email { get; set; }

    [MaxLength(200)]
    public string? BusinessHours { get; set; }
}
