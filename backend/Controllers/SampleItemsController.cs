using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SampleItemsController(ISampleService samples) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SampleItem>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SampleItem>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await samples.GetAllAsync(cancellationToken));

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(SampleItem), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SampleItem>> GetById(long id, CancellationToken cancellationToken)
    {
        var item = await samples.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SampleItem), StatusCodes.Status201Created)]
    public async Task<ActionResult<SampleItem>> Create([FromBody] CreateSampleItemRequest body, CancellationToken cancellationToken)
    {
        var created = await samples.CreateAsync(body.Name, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}

public record CreateSampleItemRequest(string Name);
