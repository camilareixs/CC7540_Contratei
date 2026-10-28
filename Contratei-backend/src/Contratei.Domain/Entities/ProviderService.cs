namespace Contratei.Domain.Entities;

public class ProviderService
{
    public long Id { get; set; }

    public long ProviderId { get; set; }

    public long ServiceId { get; set; }

    public string ServiceName { get; set; } = string.Empty;

    public string? ServiceDescription { get; set; }

    public decimal Price { get; set; }

    public int DurationMinutes { get; set; }

    public bool Active { get; set; }
}