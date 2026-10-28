namespace Contratei.Service.Interfaces;

public interface IProviderServiceCatalog
{
    Task<Contratei.Domain.Entities.ProviderService?> AssociateAsync(
        long providerId,
        AssociateProviderServiceRequest request);

    Task<IReadOnlyList<Contratei.Domain.Entities.ProviderService>>
        GetByProviderIdAsync(long providerId);
}