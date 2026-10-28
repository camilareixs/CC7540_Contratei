
using Contratei.Domain.Entities;
using Contratei.Data.Repositories;
using Contratei.Service.Interfaces;

namespace Contratei.Service.Services;

public class ProviderProfileService : IProviderProfileService
{
    private readonly IProviderProfileRepository _repository;

    public ProviderProfileService(IProviderProfileRepository repository)
    {
        _repository = repository;
    }

    public async Task<ProviderProfileResponse?> GetByProviderIdAsync(
        long providerId)
    {
        ValidarProviderId(providerId);

        var data = await _repository.GetByProviderIdAsync(providerId);

        return data is null ? null : ParaResposta(data);
    }

    public async Task<ProviderProfileResponse?> SaveAsync(
        long providerId,
        ProviderProfileRequest request)
    {
        ValidarProviderId(providerId);

        if (request is null)
            throw new ArgumentException(
                "Informe os dados do perfil.");

        if (string.IsNullOrWhiteSpace(request.Phone) ||
            string.IsNullOrWhiteSpace(request.PostalCode) ||
            string.IsNullOrWhiteSpace(request.Street) ||
            string.IsNullOrWhiteSpace(request.StreetNumber) ||
            string.IsNullOrWhiteSpace(request.Neighborhood) ||
            string.IsNullOrWhiteSpace(request.City) ||
            string.IsNullOrWhiteSpace(request.State) ||
            string.IsNullOrWhiteSpace(request.Country) ||
            string.IsNullOrWhiteSpace(request.Description))
        {
            throw new ArgumentException(
                "Preencha todos os campos obrigatórios do perfil.");
        }

        if (request.ProfessionalAreaId <= 0)
            throw new ArgumentException(
                "Selecione uma área de atuação.");

        if (request.ExperienceYears < 0 ||
            request.ExperienceYears > 80)
        {
            throw new ArgumentException(
                "Informe um tempo de experiência entre 0 e 80 anos.");
        }

        if (request.Topics is null)
            throw new ArgumentException(
                "A lista de matérias e conteúdos é obrigatória.");

        if (request.Topics.Count > 100)
            throw new ArgumentException(
                "Informe no máximo 100 tópicos.");

        if (request.Topics.Any(t =>
            t is not null && t.Trim().Length > 100))
        {
            throw new ArgumentException(
                "Cada tópico deve ter no máximo 100 caracteres.");
        }

        var data = ParaModelo(request);

        var savedData = await _repository.UpsertAsync(
            providerId,
            data);

        return savedData is null
            ? null
            : ParaResposta(savedData);
    }

    public async Task<IReadOnlyList<ProfessionalAreaResponse>>
        GetProfessionalAreasAsync()
    {
        var areas = await _repository.GetProfessionalAreasAsync();

        return areas
            .Select(ParaResposta)
            .ToList();
    }

    private static void ValidarProviderId(long providerId)
    {
        if (providerId <= 0)
            throw new ArgumentException(
                "Informe um ID de profissional válido.");
    }

    private static ProviderProfileData ParaModelo(
        ProviderProfileRequest request)
    {
        return new ProviderProfileData
        {
            Phone = request.Phone.Trim(),
            PostalCode = request.PostalCode.Trim(),
            Street = request.Street.Trim(),
            StreetNumber = request.StreetNumber.Trim(),
            Neighborhood = request.Neighborhood.Trim(),
            City = request.City.Trim(),
            State = request.State.Trim(),
            Country = request.Country.Trim(),
            ProfessionalAreaId = request.ProfessionalAreaId,
            Description = request.Description.Trim(),
            ExperienceYears = request.ExperienceYears,
            Topics = request.Topics
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim())
                .ToList()
        };
    }

    private static ProviderProfileResponse ParaResposta(
        ProviderProfileData data)
    {
        return new ProviderProfileResponse
        {
            Id = data.Id,
            ProviderId = data.ProviderId,
            Phone = data.Phone,
            PostalCode = data.PostalCode,
            Street = data.Street,
            StreetNumber = data.StreetNumber,
            Neighborhood = data.Neighborhood,
            City = data.City,
            State = data.State,
            Country = data.Country,
            ProfessionalAreaId = data.ProfessionalAreaId,
            ProfessionalAreaName = data.ProfessionalAreaName,
            Description = data.Description,
            ExperienceYears = data.ExperienceYears,
            Topics = data.Topics,
            CreatedAt = data.CreatedAt,
            UpdatedAt = data.UpdatedAt
        };
    }

    private static ProfessionalAreaResponse ParaResposta(
        ProfessionalAreaData data)
    {
        return new ProfessionalAreaResponse
        {
            Id = data.Id,
            Name = data.Name
        };
    }
    
    public async Task<long?> AddTopicAsync(
        long providerId,
        string name)
    {
        ValidarProviderId(providerId);

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException(
                "Informe o nome do tópico.");

        name = name.Trim();

        if (name.Length > 100)
            throw new ArgumentException(
                "O tópico deve ter no máximo 100 caracteres.");

        var profile = await _repository.GetByProviderIdAsync(providerId);

        if (profile is null)
            return null;

        var topicId = await _repository.AddTopicAsync(providerId, name);

        if (topicId is null)
            throw new ArgumentException(
                "Esse tópico já existe no perfil do profissional.");

        return topicId;
    }

    public async Task<bool> RemoveTopicAsync(
        long providerId,
        long topicId)
    {
        ValidarProviderId(providerId);

        if (topicId <= 0)
            throw new ArgumentException(
                "Informe um ID de tópico válido.");

        return await _repository.RemoveTopicAsync(providerId, topicId);
    }
}
