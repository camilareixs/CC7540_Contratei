namespace Contratei.Domain.Entities;

public class ProviderAppointment
{
    public long AppointmentId { get; set; }

    public long CustomerId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public long ProviderServiceId { get; set; }

    public string ServiceName { get; set; } = string.Empty;

    public long SlotId { get; set; }

    public DateTimeOffset StartsAt { get; set; }

    public DateTimeOffset EndsAt { get; set; }

    public string Status { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}