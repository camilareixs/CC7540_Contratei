using Contratei.Domain.Entities;

namespace Contratei.Data.Repositories;

public interface IProviderAppointmentRepository
{
    Task<IReadOnlyList<ProviderAppointment>> GetAllByProviderIdAsync(
        long providerId);

    Task<IReadOnlyList<ProviderAppointment>> GetUpcomingByProviderIdAsync(
        long providerId);

    Task<IReadOnlyList<ProviderAppointment>> GetHistoryByProviderIdAsync(
        long providerId);
}