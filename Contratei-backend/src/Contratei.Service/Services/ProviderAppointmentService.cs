using Contratei.Data.Repositories;
using Contratei.Service.Interfaces;

namespace Contratei.Service.Services;

public class ProviderAppointmentService
    : IProviderAppointmentService
{
    private readonly IProviderAppointmentRepository _repository;

    public ProviderAppointmentService(
        IProviderAppointmentRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<ProviderAppointmentResponse>>
        GetAllByProviderIdAsync(long providerId)
    {
        ValidateProviderId(providerId);

        return MapAsync(
            _repository.GetAllByProviderIdAsync(providerId));
    }

    public Task<IReadOnlyList<ProviderAppointmentResponse>>
        GetUpcomingByProviderIdAsync(long providerId)
    {
        ValidateProviderId(providerId);

        return MapAsync(
            _repository.GetUpcomingByProviderIdAsync(providerId));
    }

    public Task<IReadOnlyList<ProviderAppointmentResponse>>
        GetHistoryByProviderIdAsync(long providerId)
    {
        ValidateProviderId(providerId);

        return MapAsync(
            _repository.GetHistoryByProviderIdAsync(providerId));
    }

    private static void ValidateProviderId(long providerId)
    {
        if (providerId <= 0)
        {
            throw new ArgumentException(
                "O ID do profissional deve ser maior que zero.");
        }
    }

    private static async Task<IReadOnlyList<ProviderAppointmentResponse>>
        MapAsync(
            Task<IReadOnlyList<Contratei.Domain.Entities.ProviderAppointment>>
                appointmentsTask)
    {
        var appointments = await appointmentsTask;

        return appointments.Select(a =>
            new ProviderAppointmentResponse
            {
                AppointmentId = a.AppointmentId,
                CustomerId = a.CustomerId,
                CustomerName = a.CustomerName,
                ProviderServiceId = a.ProviderServiceId,
                ServiceName = a.ServiceName,
                SlotId = a.SlotId,
                StartsAt = a.StartsAt,
                EndsAt = a.EndsAt,
                Status = a.Status,
                Price = a.Price,
                CreatedAt = a.CreatedAt
            }).ToList();
    }
}