
using Contratei.Domain.Entities;

namespace Contratei.Data.Repositories;

public interface IProviderServiceRepository
{
    Task<ProviderService?> CreateAsync(
        long providerId,
        long serviceId,
        decimal price,
        int durationMinutes);

    Task<IReadOnlyList<ProviderService>> GetByProviderIdAsync(
        long providerId);
}
