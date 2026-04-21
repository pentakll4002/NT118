using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UserManagementService(AppDbContext db) : IUserManagementService
{
    private readonly PasswordHasher<User> _passwordHasher = new();

    public async Task<UserProfileResponse> GetProfileAsync(long userId, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy người dùng.");

        var profile = await db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        return ToProfileResponse(user, profile);
    }

    public async Task<UserProfileResponse> UpdateProfileAsync(long userId, UpdateUserProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy người dùng.");

        var email = NormalizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(email))
            throw new InvalidOperationException("Email là bắt buộc.");

        if (await db.Users.AnyAsync(x => x.Email == email && x.Id != userId, cancellationToken))
            throw new InvalidOperationException("Email đã được sử dụng.");

        var phone = NormalizeNullable(request.Phone);
        if (!string.IsNullOrWhiteSpace(phone)
            && await db.Users.AnyAsync(x => x.Phone == phone && x.Id != userId, cancellationToken))
            throw new InvalidOperationException("Số điện thoại đã được sử dụng.");

        user.Email = email;
        user.Phone = phone;
        user.UpdatedAt = DateTime.UtcNow;

        var profile = await db.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (profile is null)
        {
            profile = new UserProfile
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            db.UserProfiles.Add(profile);
        }

        profile.FullName = NormalizeNullable(request.FullName);
        profile.AvatarUrl = NormalizeNullable(request.AvatarUrl);
        profile.DateOfBirth = request.DateOfBirth;
        profile.Gender = request.Gender;
        profile.Bio = NormalizeNullable(request.Bio);
        profile.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return ToProfileResponse(user, profile);
    }

    public async Task<MessageResponse> ChangePasswordAsync(long userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
            throw new InvalidOperationException("Mật khẩu hiện tại và mật khẩu mới là bắt buộc.");

        if (request.NewPassword.Length < 6)
            throw new InvalidOperationException("Mật khẩu mới phải có ít nhất 6 ký tự.");

        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy người dùng.");

        var verify = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (verify == PasswordVerificationResult.Failed)
            throw new InvalidOperationException("Mật khẩu hiện tại không đúng.");

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        user.PasswordResetCode = null;
        user.PasswordResetCodeExpires = null;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return new MessageResponse("Cập nhật mật khẩu thành công.");
    }

    public async Task<IReadOnlyList<UserAddressResponse>> GetAddressesAsync(long userId, CancellationToken cancellationToken = default) =>
        await db.UserAddresses
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.IsDefault)
            .ThenByDescending(x => x.Id)
            .Select(ToAddressResponseExpr())
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<UserCartItemResponse>> GetCartItemsAsync(long userId, CancellationToken cancellationToken = default)
    {
        var rows = await db.CartItems
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.UpdatedAt)
            .Select(x => new
            {
                x.Id,
                x.ProductId,
                ProductName = x.Product.Name,
                ProductSlug = x.Product.Slug,
                x.Quantity,
                x.VariantId,
                VariantName = x.Variant != null ? x.Variant.Name : null,
                VariantValue = x.Variant != null ? x.Variant.Value : null,
                UnitPrice = x.Product.Price + (x.Variant != null ? x.Variant.PriceModifier : 0m),
                x.UpdatedAt,
            })
            .ToListAsync(cancellationToken);

        var productIds = rows.Select(x => x.ProductId).Distinct().ToList();
        var imageMap = await db.ProductImages
            .AsNoTracking()
            .Where(x => productIds.Contains(x.ProductId))
            .OrderByDescending(x => x.IsMain)
            .ThenBy(x => x.SortOrder)
            .ThenBy(x => x.Id)
            .Select(x => new { x.ProductId, x.ImageUrl })
            .ToListAsync(cancellationToken);

        var mainImageByProduct = new Dictionary<long, string?>();
        foreach (var row in imageMap)
        {
            if (!mainImageByProduct.ContainsKey(row.ProductId))
                mainImageByProduct[row.ProductId] = row.ImageUrl;
        }

        return rows.Select(x => new UserCartItemResponse(
            x.Id,
            x.ProductId,
            x.ProductName,
            x.ProductSlug,
            x.UnitPrice,
            x.Quantity,
            mainImageByProduct.GetValueOrDefault(x.ProductId),
            x.VariantId,
            x.VariantName,
            x.VariantValue,
            x.UpdatedAt)).ToList();
    }

    public async Task<IReadOnlyList<UserOrderItemResponse>> GetOrdersAsync(long userId, CancellationToken cancellationToken = default) =>
        await db.Orders
            .AsNoTracking()
            .Where(x => x.BuyerId == userId)
            .OrderByDescending(x => x.OrderedAt)
            .Select(x => new UserOrderItemResponse(
                x.Id,
                x.OrderNumber,
                x.ShopId,
                x.Shop.Name,
                x.TotalAmount,
                x.PaymentStatus.ToString(),
                x.Status.ToString(),
                x.OrderedAt))
            .ToListAsync(cancellationToken);

    public async Task<UserAddressResponse> AddAddressAsync(long userId, UpsertUserAddressRequest request, CancellationToken cancellationToken = default)
    {
        ValidateAddressRequest(request);

        var hasAnyAddress = await db.UserAddresses.AnyAsync(x => x.UserId == userId, cancellationToken);
        var shouldSetDefault = request.IsDefault || !hasAnyAddress;
        if (shouldSetDefault)
            await UnsetDefaultAddressAsync(userId, cancellationToken);

        var entity = new UserAddress
        {
            UserId = userId,
            RecipientName = request.RecipientName.Trim(),
            RecipientPhone = request.RecipientPhone.Trim(),
            Province = request.Province.Trim(),
            District = request.District.Trim(),
            Ward = request.Ward.Trim(),
            StreetAddress = request.StreetAddress.Trim(),
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            PoiName = NormalizeNullable(request.PoiName),
            FormattedAddress = NormalizeNullable(request.FormattedAddress),
            IsDefault = shouldSetDefault,
            CreatedAt = DateTime.UtcNow,
        };

        db.UserAddresses.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return ToAddressResponse(entity);
    }

    public async Task<UserAddressResponse> UpdateAddressAsync(long userId, long addressId, UpsertUserAddressRequest request, CancellationToken cancellationToken = default)
    {
        ValidateAddressRequest(request);

        var entity = await db.UserAddresses.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == addressId, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy địa chỉ.");

        if (request.IsDefault && !entity.IsDefault)
            await UnsetDefaultAddressAsync(userId, cancellationToken);

        entity.RecipientName = request.RecipientName.Trim();
        entity.RecipientPhone = request.RecipientPhone.Trim();
        entity.Province = request.Province.Trim();
        entity.District = request.District.Trim();
        entity.Ward = request.Ward.Trim();
        entity.StreetAddress = request.StreetAddress.Trim();
        entity.Latitude = request.Latitude;
        entity.Longitude = request.Longitude;
        entity.PoiName = NormalizeNullable(request.PoiName);
        entity.FormattedAddress = NormalizeNullable(request.FormattedAddress);
        entity.IsDefault = request.IsDefault;

        await db.SaveChangesAsync(cancellationToken);
        return ToAddressResponse(entity);
    }

    public async Task DeleteAddressAsync(long userId, long addressId, CancellationToken cancellationToken = default)
    {
        var entity = await db.UserAddresses.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == addressId, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy địa chỉ.");

        var wasDefault = entity.IsDefault;
        db.UserAddresses.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);

        if (!wasDefault)
            return;

        var next = await db.UserAddresses
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (next is null)
            return;

        next.IsDefault = true;
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task UnsetDefaultAddressAsync(long userId, CancellationToken cancellationToken)
    {
        var currentDefaults = await db.UserAddresses.Where(x => x.UserId == userId && x.IsDefault).ToListAsync(cancellationToken);
        if (currentDefaults.Count == 0)
            return;

        foreach (var address in currentDefaults)
            address.IsDefault = false;

        await db.SaveChangesAsync(cancellationToken);
    }

    private static UserProfileResponse ToProfileResponse(User user, UserProfile? profile) => new(
        user.Id,
        user.Username,
        user.Email,
        user.Phone,
        profile?.FullName,
        profile?.AvatarUrl,
        profile?.DateOfBirth,
        profile?.Gender,
        profile?.Bio,
        user.CreatedAt,
        user.UpdatedAt);

    private static UserAddressResponse ToAddressResponse(UserAddress x) => new(
        x.Id,
        x.RecipientName,
        x.RecipientPhone,
        x.Province,
        x.District,
        x.Ward,
        x.StreetAddress,
        x.Latitude,
        x.Longitude,
        x.PoiName,
        x.FormattedAddress,
        x.IsDefault,
        x.CreatedAt);

    private static System.Linq.Expressions.Expression<Func<UserAddress, UserAddressResponse>> ToAddressResponseExpr() => x =>
        new UserAddressResponse(
            x.Id,
            x.RecipientName,
            x.RecipientPhone,
            x.Province,
            x.District,
            x.Ward,
            x.StreetAddress,
            x.Latitude,
            x.Longitude,
            x.PoiName,
            x.FormattedAddress,
            x.IsDefault,
            x.CreatedAt);

    private static void ValidateAddressRequest(UpsertUserAddressRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RecipientName)
            || string.IsNullOrWhiteSpace(request.RecipientPhone)
            || string.IsNullOrWhiteSpace(request.Province)
            || string.IsNullOrWhiteSpace(request.District)
            || string.IsNullOrWhiteSpace(request.Ward)
            || string.IsNullOrWhiteSpace(request.StreetAddress))
            throw new InvalidOperationException("Thông tin địa chỉ không hợp lệ.");
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static string? NormalizeNullable(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
