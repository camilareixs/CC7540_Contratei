
using Contratei.Domain.Entities;

namespace Contratei.Data.Repositories;

public interface IServiceRepository
{
    Task<ServiceItem?> CreateAsync(ServiceItem service);

    Task<IReadOnlyList<ServiceItem>> GetAllAsync();

    Task<ServiceItem?> GetByIdAsync(long id);

    Task<ServiceItem?> UpdateAsync(long id, ServiceItem service);
}
