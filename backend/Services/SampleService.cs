using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class SampleService(AppDbContext db) : ISampleService
{
    public async Task<IReadOnlyList<SampleItem>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await db.SampleItems.AsNoTracking().OrderBy(x => x.Id).ToListAsync(cancellationToken);

    public async Task<SampleItem?> GetByIdAsync(long id, CancellationToken cancellationToken = default) =>
        await db.SampleItems.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<SampleItem> CreateAsync(string name, CancellationToken cancellationToken = default)
    {
        var item = new SampleItem { Name = name };
        db.SampleItems.Add(item);
        await db.SaveChangesAsync(cancellationToken);
        return item;
    }
}
