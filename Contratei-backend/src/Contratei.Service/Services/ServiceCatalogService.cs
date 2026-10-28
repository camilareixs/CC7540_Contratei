
using Contratei.Data.Repositories;
using Contratei.Domain.Entities;
using Contratei.Service.Interfaces;

namespace Contratei.Service.Services;

public class ServiceCatalogService : IServiceCatalogService
{
    private readonly IServiceRepository _repository;

    public ServiceCatalogService(IServiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<ServiceItem?> CreateAsync(CreateServiceRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("O nome do serviço é obrigatório.");

        return await _repository.CreateAsync(new ServiceItem
        {
            Name = request.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim()
        });
    }

    public Task<IReadOnlyList<ServiceItem>> GetAllAsync()
        => _repository.GetAllAsync();

    public async Task<ServiceItem?> GetByIdAsync(long id)
    {
        if (id <= 0)
            throw new ArgumentException("Informe um ID de serviço válido.");

        return await _repository.GetByIdAsync(id);
    }

    public async Task<ServiceItem?> UpdateAsync(
        long id,
        UpdateServiceRequest request)
    {
        if (id <= 0)
            throw new ArgumentException("Informe um ID de serviço válido.");

        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("O nome do serviço é obrigatório.");

        return await _repository.UpdateAsync(id, new ServiceItem
        {
            Name = request.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            Active = request.Active
        });
    }
}
