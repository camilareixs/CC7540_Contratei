
namespace Contratei.Service.Interfaces;

public interface IAvailabilityService
{
    Task<AvailabilitySlotResponse?> CreateAsync(
        long providerId,
        CreateAvailabilityRequest request);

    Task<IReadOnlyList<AvailabilitySlotResponse>> GetByProviderIdAsync(
        long providerId);

    Task<IReadOnlyList<AvailabilitySlotResponse>>
        GetAvailableByProviderIdAsync(long providerId);

    Task<bool> BlockAsync(long id);
}
