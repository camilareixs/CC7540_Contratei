
using Contratei.Domain.Entities;

namespace Contratei.Data.Repositories;

public interface IProviderProfileRepository
{
    Task<ProviderProfileData?> GetByProviderIdAsync(long providerId);

    Task<ProviderProfileData?> UpsertAsync(
        long providerId,
        ProviderProfileData request);

    Task<IReadOnlyList<ProfessionalAreaData>>
        GetProfessionalAreasAsync();

    Task<long?> AddTopicAsync(long providerId, string name);

    Task<bool> RemoveTopicAsync(long providerId, long topicId);
}
