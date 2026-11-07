namespace Contratei.Service.Interfaces;

public interface IProviderAppointmentService
{
    Task<IReadOnlyList<ProviderAppointmentResponse>>
        GetAllByProviderIdAsync(long providerId);

    Task<IReadOnlyList<ProviderAppointmentResponse>>
        GetUpcomingByProviderIdAsync(long providerId);

    Task<IReadOnlyList<ProviderAppointmentResponse>>
        GetHistoryByProviderIdAsync(long providerId);
}