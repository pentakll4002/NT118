using Backend.Models;

namespace Backend.Services;

public interface ISampleService
{
    Task<IReadOnlyList<SampleItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SampleItem?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<SampleItem> CreateAsync(string name, CancellationToken cancellationToken = default);
}
