
using Contratei.Domain.Entities;
using Npgsql;

namespace Contratei.Data.Repositories;

public class ProviderServiceRepository : IProviderServiceRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public ProviderServiceRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<ProviderService?> CreateAsync(
        long providerId,
        long serviceId,
        decimal price,
        int durationMinutes)
    {
        const string sql = """
            INSERT INTO public.provider_services
                (provider_id, service_id, price, duration_minutes, active)
            SELECT @providerId, s.id, @price, @durationMinutes, true
            FROM public.services s
            WHERE s.id = @serviceId AND s.active = true
            RETURNING id, provider_id, service_id, price,
                      duration_minutes, active;
            """;

        await using var connection = await _dataSource.OpenConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("providerId", providerId);
        command.Parameters.AddWithValue("serviceId", serviceId);
        command.Parameters.AddWithValue("price", price);
        command.Parameters.AddWithValue("durationMinutes", durationMinutes);

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        return new ProviderService
        {
            Id = reader.GetInt64(0),
            ProviderId = reader.GetInt64(1),
            ServiceId = reader.GetInt64(2),
            Price = reader.GetDecimal(3),
            DurationMinutes = reader.GetInt32(4),
            Active = reader.GetBoolean(5)
        };
    }

    public async Task<IReadOnlyList<ProviderService>> GetByProviderIdAsync(
        long providerId)
    {
        const string sql = """
            SELECT ps.id, ps.provider_id, ps.service_id,
                   s.name, s.description, ps.price,
                   ps.duration_minutes, ps.active
            FROM public.provider_services ps
            INNER JOIN public.services s ON s.id = ps.service_id
            WHERE ps.provider_id = @providerId
            ORDER BY s.name;
            """;

        var items = new List<ProviderService>();

        await using var connection = await _dataSource.OpenConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("providerId", providerId);

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            items.Add(new ProviderService
            {
                Id = reader.GetInt64(0),
                ProviderId = reader.GetInt64(1),
                ServiceId = reader.GetInt64(2),
                ServiceName = reader.GetString(3),
                ServiceDescription = reader.IsDBNull(4)
                    ? null
                    : reader.GetString(4),
                Price = reader.GetDecimal(5),
                DurationMinutes = reader.GetInt32(6),
                Active = reader.GetBoolean(7)
            });
        }

        return items;
    }
}
