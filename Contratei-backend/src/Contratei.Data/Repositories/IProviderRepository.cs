using Contratei.Domain.Entities;

namespace Contratei.Data.Repositories;

public interface IProviderRepository
{
    Task<Provider?> CreateAsync(User user, Provider provider);

    Task<Provider?> GetByIdAsync(long id);

    Task<Provider?> GetByUserIdAsync(long userId);

    Task<IReadOnlyList<Provider>> GetActiveAsync();

    Task<IReadOnlyList<FeaturedProvider>> GetFeaturedAsync();
}