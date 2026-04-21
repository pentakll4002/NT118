using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _context;

    public AddressesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/addresses/provinces
    [HttpGet("provinces")]
    public async Task<IActionResult> GetProvinces()
    {
        var provinces = await _context.Addresses
            .Where(a => a.Level == 1)
            .OrderBy(a => a.Name)
            .ToListAsync();
        return Ok(provinces);
    }

    // GET: api/addresses/children/{parentCode}
    [HttpGet("children/{parentCode}")]
    public async Task<IActionResult> GetChildren(string parentCode)
    {
        var children = await _context.Addresses
            .Where(a => a.ParentCode == parentCode)
            .OrderBy(a => a.Name)
            .ToListAsync();
        return Ok(children);
    }
}
