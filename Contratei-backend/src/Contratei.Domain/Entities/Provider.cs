namespace Contratei.Domain.Entities;

public class Provider
{
    public long Id { get; set; }

    public long UserId { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool Active { get; set; } = true;

    public DateTime CreatedAt { get; set; }
}