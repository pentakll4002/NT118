using Backend.Models;
using System.ComponentModel.DataAnnotations;

namespace Backend.Contracts;

public record UserProfileResponse(
    long UserId,
    string Username,
    string Email,
    string? Phone,
    string? FullName,
    string? AvatarUrl,
    DateOnly? DateOfBirth,
    GenderType? Gender,
    string? Bio,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record UpdateUserProfileRequest(
    [property: Required, EmailAddress, MaxLength(100)] string Email,
    [property: MaxLength(20)] string? Phone,
    [property: MaxLength(100)] string? FullName,
    [property: MaxLength(500)] string? AvatarUrl,
    DateOnly? DateOfBirth,
    GenderType? Gender,
    string? Bio);

public record UserAddressResponse(
    long Id,
    string RecipientName,
    string RecipientPhone,
    string Province,
    string District,
    string Ward,
    string StreetAddress,
    double? Latitude,
    double? Longitude,
    string? PoiName,
    string? FormattedAddress,
    bool IsDefault,
    DateTime CreatedAt);

public record UpsertUserAddressRequest(
    [param: Required, MaxLength(100)] string RecipientName,
    [param: Required, MaxLength(20)] string RecipientPhone,
    [param: Required, MaxLength(50)] string Province,
    [param: Required, MaxLength(50)] string District,
    [param: Required, MaxLength(50)] string Ward,
    [param: Required, MaxLength(500)] string StreetAddress,
    double? Latitude,
    double? Longitude,
    [param: MaxLength(200)] string? PoiName,
    [param: MaxLength(500)] string? FormattedAddress,
    bool IsDefault);

public record ChangePasswordRequest(
    [property: Required, MinLength(6), MaxLength(128)] string CurrentPassword,
    [property: Required, MinLength(6), MaxLength(128)] string NewPassword);

public record UserOrderItemResponse(
    long Id,
    string OrderNumber,
    long ShopId,
    string ShopName,
    decimal TotalAmount,
    string PaymentStatus,
    string Status,
    DateTime OrderedAt);

public record UserCartItemResponse(
    long Id,
    long ProductId,
    string ProductName,
    string ProductSlug,
    decimal UnitPrice,
    int Quantity,
    string? MainImageUrl,
    long? VariantId,
    string? VariantName,
    string? VariantValue,
    DateTime UpdatedAt);
