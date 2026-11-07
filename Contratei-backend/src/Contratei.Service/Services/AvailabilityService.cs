
using Contratei.Data.Repositories;
using Contratei.Domain.Entities;
using Contratei.Service.Interfaces;

namespace Contratei.Service.Services;

public class AvailabilityService : IAvailabilityService
{
    private readonly IAvailabilityRepository _repository;

    public AvailabilityService(IAvailabilityRepository repository)
    {
        _repository = repository;
    }

    public async Task<AvailabilitySlotResponse?> CreateAsync(
        long providerId,
        CreateAvailabilityRequest request)
    {
        if (providerId <= 0)
            throw new ArgumentException("ID do profissional inválido.");

        if (request.StartsAt == default ||
            request.EndsAt == default)
        {
            throw new ArgumentException(
                "Informe a data e hora de início e fim.");
        }

        var startsAt = request.StartsAt.ToUniversalTime();
        var endsAt = request.EndsAt.ToUniversalTime();

        if (startsAt <= DateTimeOffset.UtcNow)
            throw new ArgumentException(
                "O horário inicial deve estar no futuro.");

        if (endsAt <= startsAt)
            throw new ArgumentException(
                "O horário final deve ser posterior ao inicial.");

        var slot = new AvailabilitySlot
        {
            ProviderId = providerId,
            StartsAt = startsAt,
            EndsAt = endsAt,
            Status = "available"
        };

        var created = await _repository.CreateAsync(slot);

        return created is null ? null : ToResponse(created);
    }

    public async Task<IReadOnlyList<AvailabilitySlotResponse>>
        GetByProviderIdAsync(long providerId)
    {
        ValidateProviderId(providerId);

        var slots = await _repository.GetByProviderIdAsync(providerId);
        return slots.Select(ToResponse).ToList();
    }

    public async Task<IReadOnlyList<AvailabilitySlotResponse>>
        GetAvailableByProviderIdAsync(long providerId)
    {
        ValidateProviderId(providerId);

        var slots =
            await _repository.GetAvailableByProviderIdAsync(providerId);

        return slots.Select(ToResponse).ToList();
    }

    public Task<bool> BlockAsync(long id)
    {
        if (id <= 0)
            throw new ArgumentException("ID do horário inválido.");

        return _repository.BlockAsync(id);
    }

    private static void ValidateProviderId(long providerId)
    {
        if (providerId <= 0)
            throw new ArgumentException(
                "ID do profissional inválido.");
    }

    private static AvailabilitySlotResponse ToResponse(
        AvailabilitySlot slot)
    {
        return new AvailabilitySlotResponse
        {
            Id = slot.Id,
            ProviderId = slot.ProviderId,
            StartsAt = slot.StartsAt,
            EndsAt = slot.EndsAt,
            Status = slot.Status
        };
    }
}
