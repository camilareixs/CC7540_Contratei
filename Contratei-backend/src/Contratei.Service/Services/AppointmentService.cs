
using Contratei.Data.Repositories;
using Contratei.Domain.Entities;
using Contratei.Service.Interfaces;

namespace Contratei.Service.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _repository;

    public AppointmentService(IAppointmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<AppointmentResponse?> CreateAsync(
        CreateAppointmentRequest request)
    {
        if (request.CustomerId <= 0)
            throw new ArgumentException("ID do cliente inválido.");

        if (request.ProviderServiceId <= 0)
            throw new ArgumentException("ID do serviço inválido.");

        if (request.SlotId <= 0)
            throw new ArgumentException("ID do horário inválido.");

        var appointment = await _repository.CreateAsync(
            request.CustomerId,
            request.ProviderServiceId,
            request.SlotId);

        return appointment is null
            ? null
            : ToResponse(appointment);
    }

    public async Task<IReadOnlyList<AppointmentResponse>>
        GetByCustomerIdAsync(long customerId)
    {
        ValidarCustomerId(customerId);

        var appointments =
            await _repository.GetByCustomerIdAsync(customerId);

        return appointments.Select(ToResponse).ToList();
    }

    public async Task<IReadOnlyList<AppointmentResponse>>
        GetUpcomingByCustomerIdAsync(long customerId)
    {
        ValidarCustomerId(customerId);

        var appointments =
            await _repository.GetUpcomingByCustomerIdAsync(customerId);

        return appointments.Select(ToResponse).ToList();
    }

    public async Task<IReadOnlyList<AppointmentResponse>>
        GetHistoryByCustomerIdAsync(long customerId)
    {
        ValidarCustomerId(customerId);

        var appointments =
            await _repository.GetHistoryByCustomerIdAsync(customerId);

        return appointments.Select(ToResponse).ToList();
    }

    private static void ValidarCustomerId(long customerId)
    {
        if (customerId <= 0)
        {
            throw new ArgumentException(
                "O ID do aluno deve ser maior que zero.");
        }
    }

    private static AppointmentResponse ToResponse(
        Appointment appointment)
    {
        return new AppointmentResponse
        {
            Id = appointment.Id,
            CustomerId = appointment.CustomerId,
            CustomerName = appointment.CustomerName,
            ProviderId = appointment.ProviderId,
            ProviderName = appointment.ProviderName,
            ProviderServiceId = appointment.ProviderServiceId,
            ServiceName = appointment.ServiceName,
            SlotId = appointment.SlotId,
            StartsAt = appointment.StartsAt,
            EndsAt = appointment.EndsAt,
            Status = appointment.Status,
            Price = appointment.Price,
            ProviderAddress = appointment.ProviderAddress,
            CreatedAt = appointment.CreatedAt
        };
    }
}
