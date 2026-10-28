
namespace Contratei.Service.Interfaces;

public class AssociateProviderServiceRequest
{
    public long ServiceId { get; set; }

    public decimal Price { get; set; }

    public int DurationMinutes { get; set; }
}
