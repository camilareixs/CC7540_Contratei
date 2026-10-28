
namespace Contratei.Service.Interfaces;

public class CreateAppointmentRequest
{
    public long CustomerId { get; set; }
    public long ProviderServiceId { get; set; }
    public long SlotId { get; set; }
}
