namespace Contratei.Domain.Entities;

public class FeaturedProvider
{
    public long Id { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public string ProfessionalArea { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal MinimumPrice { get; set; }
}