
using Contratei.Data.Repositories;
using Contratei.Domain.Entities;
using Contratei.Service.Interfaces;

namespace Contratei.Service.Services;

public class ProviderServiceCatalog : IProviderServiceCatalog
{
    private readonly IProviderServiceRepository _repository;

    public ProviderServiceCatalog(IProviderServiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<Contratei.Domain.Entities.ProviderService?>
    AssociateAsync(
        long providerId,
        AssociateProviderServiceRequest request)
    {
        if (providerId <= 0)
            throw new ArgumentException(
                "Informe um ID de profissional válido.");

        if (request.ServiceId <= 0)
            throw new ArgumentException(
                "Informe um ID de serviço válido.");

        if (request.Price < 0)
            throw new ArgumentException(
                "O preço não pode ser negativo.");

        if (request.DurationMinutes <= 0)
            throw new ArgumentException(
                "A duração deve ser maior que zero.");

        return await _repository.CreateAsync(
            providerId,
            request.ServiceId,
            request.Price,
            request.DurationMinutes);
    }

    public Task<IReadOnlyList<Contratei.Domain.Entities.ProviderService>>
    GetByProviderIdAsync(long providerId)
    {
        if (providerId <= 0)
            throw new ArgumentException(
                "Informe um ID de profissional válido.");

        return _repository.GetByProviderIdAsync(providerId);
    }
}
