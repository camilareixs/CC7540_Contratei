
namespace Contratei.Service.Interfaces;

public interface IAppointmentService
{
    Task<AppointmentResponse?> CreateAsync(
        CreateAppointmentRequest request);

    Task<IReadOnlyList<AppointmentResponse>> GetByCustomerIdAsync(
        long customerId);

    Task<IReadOnlyList<AppointmentResponse>>
        GetUpcomingByCustomerIdAsync(long customerId);

    Task<IReadOnlyList<AppointmentResponse>>
        GetHistoryByCustomerIdAsync(long customerId);
}
