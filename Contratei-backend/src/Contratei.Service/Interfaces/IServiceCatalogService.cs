
using Contratei.Domain.Entities;

namespace Contratei.Service.Interfaces;

public interface IServiceCatalogService
{
    Task<ServiceItem?> CreateAsync(CreateServiceRequest request);

    Task<IReadOnlyList<ServiceItem>> GetAllAsync();

    Task<ServiceItem?> GetByIdAsync(long id);

    Task<ServiceItem?> UpdateAsync(long id, UpdateServiceRequest request);
}
