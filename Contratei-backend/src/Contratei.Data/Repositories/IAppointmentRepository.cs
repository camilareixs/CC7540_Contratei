
using Contratei.Domain.Entities;

namespace Contratei.Data.Repositories;

public interface IAppointmentRepository
{
    Task<Appointment?> CreateAsync(
        long customerId,
        long providerServiceId,
        long slotId);

    Task<IReadOnlyList<Appointment>> GetByCustomerIdAsync(
        long customerId);
    
    Task<IReadOnlyList<Appointment>> GetUpcomingByCustomerIdAsync(
        long customerId);

    Task<IReadOnlyList<Appointment>> GetHistoryByCustomerIdAsync(
        long customerId);
}
