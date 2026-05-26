using Backend.Contracts;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(IProductService products, AppDbContext db) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CategoryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CategoryResponse>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await products.GetCategoriesAsync(cancellationToken));

    [Authorize(Roles = "admin,seller")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest body, CancellationToken cancellationToken)
    {
        try
        {
            var slugExists = await db.Categories.AnyAsync(x => x.Slug == body.Slug, cancellationToken);
            if (slugExists)
                return Conflict(new { message = "Slug hoặc tên danh mục này đã tồn tại." });

            var nameExists = await db.Categories.AnyAsync(x => x.Name.ToLower() == body.Name.ToLower(), cancellationToken);
            if (nameExists)
                return Conflict(new { message = "Tên danh mục này đã tồn tại." });

            var category = new Category
            {
                Name = body.Name,
                Slug = body.Slug,
                Description = body.Description,
                ParentId = body.ParentId,
                ImageUrl = body.ImageUrl,
                SortOrder = body.SortOrder,
                Status = body.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            db.Categories.Add(category);
            await db.SaveChangesAsync(cancellationToken);
            return Ok(new { category.Id, message = "Tạo danh mục thành công." });
        }
        catch (DbUpdateException ex)
        {
            var innerMessage = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(new { message = $"Lỗi Database: {innerMessage}" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Lỗi hệ thống: {ex.Message}" });
        }
    }

    [Authorize(Roles = "admin")]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateCategoryRequest body, CancellationToken cancellationToken)
    {
        var category = await db.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (category is null)
            return NotFound();

        var dupSlug = await db.Categories.AnyAsync(x => x.Slug == body.Slug && x.Id != id, cancellationToken);
        if (dupSlug)
            return Conflict(new { message = "Slug đã tồn tại." });

        category.Name = body.Name;
        category.Slug = body.Slug;
        category.Description = body.Description;
        category.ParentId = body.ParentId;
        category.ImageUrl = body.ImageUrl;
        category.SortOrder = body.SortOrder;
        category.Status = body.Status;
        category.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Cập nhật danh mục thành công." });
    }

    [Authorize(Roles = "admin")]
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken)
    {
        var category = await db.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (category is null)
            return NotFound();

        db.Categories.Remove(category);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
