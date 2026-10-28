
using Contratei.Domain.Entities;

namespace Contratei.Data.Repositories;

public interface IAvailabilityRepository
{
    Task<AvailabilitySlot?> CreateAsync(
        AvailabilitySlot slot);

    Task<IReadOnlyList<AvailabilitySlot>> GetByProviderIdAsync(
        long providerId);

    Task<IReadOnlyList<AvailabilitySlot>> GetAvailableByProviderIdAsync(
        long providerId);

    Task<bool> BlockAsync(long id);
}
