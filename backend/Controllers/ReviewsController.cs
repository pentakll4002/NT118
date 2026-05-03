using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
public class ReviewsController(AppDbContext db) : ControllerBase
{
    [Authorize]
    [HttpPost("api/products/{id:long}/reviews")]
    public async Task<IActionResult> CreateReview(long id, [FromBody] CreateReviewRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        if (body.Rating is < 1 or > 5)
            return BadRequest(new { message = "Rating phải từ 1 đến 5." });

        var order = await db.Orders.FirstOrDefaultAsync(
            x => x.Id == body.OrderId && x.BuyerId == userId,
            cancellationToken);
        if (order is null)
            return BadRequest(new { message = "Đơn hàng không hợp lệ." });

        if (order.Status != OrderStatus.delivered)
            return BadRequest(new { message = "Chỉ có thể đánh giá sản phẩm khi đơn hàng đã giao thành công." });

        // Verify the product was actually in this order
        var hasProduct = await db.OrderItems.AnyAsync(
            x => x.OrderId == body.OrderId && x.ProductId == id,
            cancellationToken);
        if (!hasProduct)
            return BadRequest(new { message = "Sản phẩm không có trong đơn hàng này." });

        var exists = await db.Reviews.AnyAsync(
            x => x.OrderId == body.OrderId && x.ProductId == id && x.ReviewerId == userId,
            cancellationToken);
        if (exists)
            return Conflict(new { message = "Bạn đã đánh giá sản phẩm này trong đơn hàng." });

        var review = new Review
        {
            OrderId = body.OrderId,
            ProductId = id,
            ReviewerId = userId,
            Rating = body.Rating,
            Comment = body.Comment,
            IsVerified = true,
            HelpfulVotes = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.Reviews.Add(review);

        var product = await db.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (product is not null)
        {
            var newTotalReviews = product.TotalReviews + 1;
            product.Rating = Math.Round(((product.Rating * product.TotalReviews) + body.Rating) / Math.Max(1, newTotalReviews), 2);
            product.TotalReviews = newTotalReviews;
            product.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Đánh giá thành công.", reviewId = review.Id });
    }

    [Authorize]
    [HttpDelete("api/reviews/{id:long}")]
    public async Task<IActionResult> DeleteReview(long id, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var review = await db.Reviews.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (review is null)
            return NotFound();

        if (review.ReviewerId != userId && !this.IsAdmin())
            return Forbid();

        db.Reviews.Remove(review);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
