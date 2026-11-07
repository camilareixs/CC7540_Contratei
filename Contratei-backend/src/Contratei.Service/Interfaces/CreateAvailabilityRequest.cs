
namespace Contratei.Service.Interfaces;

public class CreateAvailabilityRequest
{
    public DateTimeOffset StartsAt { get; set; }

    public DateTimeOffset EndsAt { get; set; }
}
