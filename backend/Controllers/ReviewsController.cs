using Backend.Contracts;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController(IReviewService reviewService) : ControllerBase
{
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await reviewService.CreateReviewAsync(userId, body, cancellationToken);
            return Created($"/api/reviews/{result.Id}", result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET /api/reviews/{productId} — Get reviews for a product (public)
    /// </summary>
    [HttpGet("{productId:long}")]
    public async Task<IActionResult> GetProductReviews(long productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await reviewService.GetProductReviewsAsync(productId, page, pageSize, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET /api/reviews/order/{orderId}/status — Check if user can review order (requires auth)
    /// </summary>
    [Authorize]
    [HttpGet("order/{orderId:long}/status")]
    public async Task<IActionResult> GetOrderReviewStatus(long orderId, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await reviewService.GetOrderReviewStatusAsync(orderId, userId, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// PUT /api/reviews/{reviewId} — Update a review (only by reviewer)
    /// </summary>
    [Authorize]
    [HttpPut("{reviewId:long}")]
    public async Task<IActionResult> UpdateReview(long reviewId, [FromBody] UpdateReviewRequest body, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await reviewService.UpdateReviewAsync(userId, reviewId, body, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// DELETE /api/reviews/{reviewId} — Delete a review (only by reviewer)
    /// </summary>
    [Authorize]
    [HttpDelete("{reviewId:long}")]
    public async Task<IActionResult> DeleteReview(long reviewId, CancellationToken cancellationToken)
    {
        if (!this.TryGetCurrentUserId(out var userId))
            return Unauthorized();

        try
        {
            await reviewService.DeleteReviewAsync(userId, reviewId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
