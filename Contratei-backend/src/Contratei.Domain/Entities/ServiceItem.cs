
namespace Contratei.Domain.Entities;

public class ServiceItem
{
    public long Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool Active { get; set; } = true;
}
