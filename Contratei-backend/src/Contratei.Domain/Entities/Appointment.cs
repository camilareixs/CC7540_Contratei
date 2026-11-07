
namespace Contratei.Domain.Entities;

public class Appointment
{
    public long Id { get; set; }

    public long CustomerId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public long ProviderId { get; set; }

    public string ProviderName { get; set; } = string.Empty;

    public long ProviderServiceId { get; set; }

    public string ServiceName { get; set; } = string.Empty;

    public long SlotId { get; set; }

    public DateTimeOffset StartsAt { get; set; }

    public DateTimeOffset EndsAt { get; set; }

    public string Status { get; set; } = "pending_payment";

    public decimal Price { get; set; }

    public string? ProviderAddress { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
