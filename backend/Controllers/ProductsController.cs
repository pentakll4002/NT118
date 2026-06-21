using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Backend.Contracts;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(IProductService products) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ProductListResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProductListResponse>> GetProducts(
        [FromQuery] string? q,
        [FromQuery] long? categoryId,
        [FromQuery] long? shopId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? brand,
        [FromQuery] string? sort,
        [FromQuery] bool? isFlashSale,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new ProductQuery(q, categoryId, shopId, minPrice, maxPrice, brand, sort, isFlashSale, page, pageSize);
        return Ok(await products.GetProductsAsync(query, cancellationToken));
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ProductDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDetailResponse>> GetById(long id, CancellationToken cancellationToken)
    {
        var item = await products.GetProductDetailAsync(id, cancellationToken);
        if (item is null)
            return NotFound();

        if (TryGetCurrentUserId(out var userId))
            await products.RecordViewAsync(userId, id, cancellationToken);

        return Ok(item);
    }

    [HttpPost("{id:long}/view")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RecordView(long id, CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
            return Unauthorized();

        await products.RecordViewAsync(userId, id, cancellationToken);
        return NoContent();
    }

    [HttpGet("history")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<ViewHistoryItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<ViewHistoryItemResponse>>> GetHistory([FromQuery] int limit = 50, CancellationToken cancellationToken = default)
    {
        if (!TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var result = await products.GetViewHistoryAsync(userId, limit, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:long}/reviews")]
    [ProducesResponseType(typeof(IReadOnlyList<ProductReviewItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ProductReviewItemResponse>>> GetReviews(long id, [FromQuery] int limit = 50, CancellationToken cancellationToken = default) =>
        Ok(await products.GetProductReviewsAsync(id, limit, cancellationToken));

    private bool TryGetCurrentUserId(out long userId)
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return long.TryParse(sub, out userId);
    }
}
