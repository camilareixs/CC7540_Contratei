
namespace Contratei.Service.Interfaces;

public interface IProviderProfileService
{
    Task<ProviderProfileResponse?> GetByProviderIdAsync(long providerId);

    Task<ProviderProfileResponse?> SaveAsync(
        long providerId,
        ProviderProfileRequest request);

    Task<IReadOnlyList<ProfessionalAreaResponse>>
        GetProfessionalAreasAsync();

    Task<long?> AddTopicAsync(long providerId, string name);

    Task<bool> RemoveTopicAsync(long providerId, long topicId);
}
