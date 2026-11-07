
using System.ComponentModel.DataAnnotations;

namespace Contratei.Service.Interfaces;

public class ProviderProfileRequest
{
    [Required, Phone, MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [Required, MaxLength(9)]
    public string PostalCode { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Street { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string StreetNumber { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Neighborhood { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string State { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Country { get; set; } = "Brasil";

    [Range(1, long.MaxValue)]
    public long ProfessionalAreaId { get; set; }

    [Required, MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0, 80)]
    public int ExperienceYears { get; set; }

    [Required]
    public List<string> Topics { get; set; } = [];
}
