
namespace Contratei.Domain.Entities;

public class AvailabilitySlot
{
    public long Id { get; set; }

    public long ProviderId { get; set; }

    public DateTimeOffset StartsAt { get; set; }

    public DateTimeOffset EndsAt { get; set; }

    public string Status { get; set; } = "available";
}
