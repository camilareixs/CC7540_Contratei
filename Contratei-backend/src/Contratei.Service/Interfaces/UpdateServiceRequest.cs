
namespace Contratei.Service.Interfaces;

public class UpdateServiceRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool Active { get; set; }
}
