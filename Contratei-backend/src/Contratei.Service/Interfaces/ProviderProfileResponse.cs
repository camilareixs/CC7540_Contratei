namespace Contratei.Service.Interfaces;

public class ProviderProfileResponse
{
    public long Id { get; set; }
    public long ProviderId { get; set; }

    public string Phone { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string StreetNumber { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    public long ProfessionalAreaId { get; set; }
    public string ProfessionalAreaName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public int ExperienceYears { get; set; }

    public List<string> Topics { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
