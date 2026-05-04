using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IReviewService
{
    Task<(bool CanReview, string Message)> CanReviewOrderAsync(long orderId, long userId, CancellationToken cancellationToken);

    Task<ReviewDto> CreateReviewAsync(long userId, CreateReviewRequest req, CancellationToken cancellationToken);

    Task<ReviewDto> UpdateReviewAsync(long userId, long reviewId, UpdateReviewRequest req, CancellationToken cancellationToken);

    Task DeleteReviewAsync(long userId, long reviewId, CancellationToken cancellationToken);

    Task<ProductReviewsResponse> GetProductReviewsAsync(long productId, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);

    Task<OrderReviewStatusResponse> GetOrderReviewStatusAsync(long orderId, long userId, CancellationToken cancellationToken);
}

public class ReviewService(AppDbContext db) : IReviewService
{
    public async Task<(bool CanReview, string Message)> CanReviewOrderAsync(long orderId, long userId, CancellationToken cancellationToken)
    {
        var order = await db.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        if (order == null)
            return (false, "Không tìm thấy đơn hàng.");

        if (order.BuyerId != userId)
            return (false, "Bạn không có quyền đánh giá đơn hàng này.");

        if (order.PaymentStatus != PaymentStatus.paid)
            return (false, "Đơn hàng chưa được thanh toán.");

        if (order.Status != OrderStatus.delivered)
            return (false, "Đơn hàng chưa được giao. Vui lòng chờ giao hàng thành công.");

        return (true, "");
    }

    public async Task<ReviewDto> CreateReviewAsync(long userId, CreateReviewRequest req, CancellationToken cancellationToken)
    {
        var (canReview, message) = await CanReviewOrderAsync(req.OrderId, userId, cancellationToken);
        if (!canReview)
            throw new InvalidOperationException(message);

        var orderItem = await db.OrderItems
            .AsNoTracking()
            .FirstOrDefaultAsync(oi => oi.OrderId == req.OrderId && oi.ProductId == req.ProductId, cancellationToken);

        if (orderItem == null)
            throw new InvalidOperationException("Sản phẩm không có trong đơn hàng này.");

        // Check if already reviewed
        var existingReview = await db.Reviews
            .FirstOrDefaultAsync(r => r.OrderId == req.OrderId && r.ProductId == req.ProductId && r.ReviewerId == userId, cancellationToken);

        if (existingReview != null)
            throw new InvalidOperationException("Bạn đã đánh giá sản phẩm này từ đơn hàng này rồi.");

        var now = DateTime.UtcNow;
        var review = new Review
        {
            OrderId = req.OrderId,
            ProductId = req.ProductId,
            ReviewerId = userId,
            Rating = req.Rating,
            Comment = req.Comment,
            IsVerified = true,
            HelpfulVotes = 0,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Reviews.Add(review);

        await UpdateProductRatingAsync(req.ProductId, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);

        var reviewer = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        var profile = await db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        return MapReviewToDto(review, reviewer?.Username ?? "Anonymous", profile?.AvatarUrl);
    }

    public async Task<ReviewDto> UpdateReviewAsync(long userId, long reviewId, UpdateReviewRequest req, CancellationToken cancellationToken)
    {
        var review = await db.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId, cancellationToken);
        if (review == null)
            throw new InvalidOperationException("Không tìm thấy đánh giá.");

        if (review.ReviewerId != userId)
            throw new InvalidOperationException("Bạn không có quyền cập nhật đánh giá này.");

        review.Rating = req.Rating;
        review.Comment = req.Comment;
        review.UpdatedAt = DateTime.UtcNow;

        await UpdateProductRatingAsync(review.ProductId, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);

        var reviewer = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        var profile = await db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        return MapReviewToDto(review, reviewer?.Username ?? "Anonymous", profile?.AvatarUrl);
    }

    public async Task DeleteReviewAsync(long userId, long reviewId, CancellationToken cancellationToken)
    {
        var review = await db.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId, cancellationToken);
        if (review == null)
            throw new InvalidOperationException("Không tìm thấy đánh giá.");

        if (review.ReviewerId != userId)
            throw new InvalidOperationException("Bạn không có quyền xóa đánh giá này.");

        var productId = review.ProductId;
        db.Reviews.Remove(review);

        await UpdateProductRatingAsync(productId, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ProductReviewsResponse> GetProductReviewsAsync(long productId, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var product = await db.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            throw new InvalidOperationException("Không tìm thấy sản phẩm.");

        var reviews = await db.Reviews
            .AsNoTracking()
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var reviewDtos = new List<ReviewDto>();
        foreach (var review in reviews)
        {
            var reviewer = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == review.ReviewerId, cancellationToken);
            var profile = await db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == review.ReviewerId, cancellationToken);
            reviewDtos.Add(MapReviewToDto(review, reviewer?.Username ?? "Anonymous", profile?.AvatarUrl));
        }

        var totalReviews = await db.Reviews.CountAsync(r => r.ProductId == productId, cancellationToken);
        var averageRating = totalReviews > 0
            ? await db.Reviews
                .Where(r => r.ProductId == productId)
                .AverageAsync(r => (decimal)r.Rating, cancellationToken)
            : 0m;

        return new ProductReviewsResponse(productId, (decimal)Math.Round((double)averageRating, 1), totalReviews, reviewDtos);
    }

    public async Task<OrderReviewStatusResponse> GetOrderReviewStatusAsync(long orderId, long userId, CancellationToken cancellationToken)
    {
        var order = await db.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        if (order == null)
            throw new InvalidOperationException("Không tìm thấy đơn hàng.");

        if (order.BuyerId != userId)
            throw new InvalidOperationException("Bạn không có quyền xem đơn hàng này.");

        var (canReview, _) = await CanReviewOrderAsync(orderId, userId, cancellationToken);

        var orderItems = await db.OrderItems
            .AsNoTracking()
            .Where(oi => oi.OrderId == orderId)
            .ToListAsync(cancellationToken);

        var productIds = orderItems.Select(oi => oi.ProductId).ToList();
        var reviewedProductIds = await db.Reviews
            .AsNoTracking()
            .Where(r => r.OrderId == orderId && r.ReviewerId == userId && productIds.Contains(r.ProductId))
            .Select(r => r.ProductId)
            .ToListAsync(cancellationToken);

        var anyProductReviewed = reviewedProductIds.Count > 0;
        var firstUnreviewedProductId = orderItems.FirstOrDefault(oi => !reviewedProductIds.Contains(oi.ProductId))?.ProductId;

        return new OrderReviewStatusResponse(orderId, canReview, anyProductReviewed, firstUnreviewedProductId ?? (anyProductReviewed ? null : 0L));
    }

    private async Task UpdateProductRatingAsync(long productId, CancellationToken cancellationToken)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        if (product == null) return;

        var reviews = await db.Reviews
            .Where(r => r.ProductId == productId)
            .ToListAsync(cancellationToken);

        product.TotalReviews = reviews.Count;
        product.Rating = reviews.Count > 0 ? (decimal)reviews.Average(r => r.Rating) : 0;
        product.UpdatedAt = DateTime.UtcNow;
    }

    private ReviewDto MapReviewToDto(Review review, string reviewerName, string? reviewerAvatar)
    {
        return new ReviewDto(
            review.Id,
            review.OrderId,
            review.ProductId,
            review.ReviewerId,
            reviewerName,
            reviewerAvatar,
            review.Rating,
            review.Comment,
            review.IsVerified,
            review.HelpfulVotes,
            review.CreatedAt,
            review.UpdatedAt
        );
    }
}
