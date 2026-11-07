using Contratei.Domain.Entities;

namespace Contratei.Service.Interfaces;

public interface IProviderService
{
    Task<Provider?> CreateAsync(CreateProviderRequest request);

    Task<Provider?> GetByIdAsync(long id);

    Task<IReadOnlyList<Provider>> GetActiveAsync();

    Task<IReadOnlyList<FeaturedProvider>> GetFeaturedAsync();
}