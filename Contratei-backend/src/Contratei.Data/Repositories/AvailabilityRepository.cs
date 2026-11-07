
using Contratei.Domain.Entities;
using Npgsql;

namespace Contratei.Data.Repositories;

public class AvailabilityRepository : IAvailabilityRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public AvailabilityRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<AvailabilitySlot?> CreateAsync(
        AvailabilitySlot slot)
    {
        const string sql = """
            INSERT INTO public.availability_slots
                (provider_id, starts_at, ends_at, status)
            SELECT p.id, @startsAt, @endsAt, 'available'
            FROM public.providers p
            WHERE p.id = @providerId
              AND p.active = true
            RETURNING id, provider_id, starts_at, ends_at, status;
            """;

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("providerId", slot.ProviderId);
        command.Parameters.AddWithValue("startsAt", slot.StartsAt);
        command.Parameters.AddWithValue("endsAt", slot.EndsAt);

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        return Map(reader);
    }

    public async Task<IReadOnlyList<AvailabilitySlot>>
        GetByProviderIdAsync(long providerId)
    {
        const string sql = """
            SELECT id, provider_id, starts_at, ends_at, status
            FROM public.availability_slots
            WHERE provider_id = @providerId
            ORDER BY starts_at;
            """;

        return await QueryAsync(sql, providerId);
    }

    public async Task<IReadOnlyList<AvailabilitySlot>>
        GetAvailableByProviderIdAsync(long providerId)
    {
        const string sql = """
            SELECT id, provider_id, starts_at, ends_at, status
            FROM public.availability_slots
            WHERE provider_id = @providerId
              AND status = 'available'
              AND starts_at > now()
            ORDER BY starts_at;
            """;

        return await QueryAsync(sql, providerId);
    }

    public async Task<bool> BlockAsync(long id)
    {
        const string sql = """
            UPDATE public.availability_slots
            SET status = 'blocked'
            WHERE id = @id
              AND status = 'available'
              AND starts_at > now();
            """;

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("id", id);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    private async Task<IReadOnlyList<AvailabilitySlot>> QueryAsync(
        string sql,
        long providerId)
    {
        var slots = new List<AvailabilitySlot>();

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("providerId", providerId);

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
            slots.Add(Map(reader));

        return slots;
    }

    private static AvailabilitySlot Map(NpgsqlDataReader reader)
    {
        return new AvailabilitySlot
        {
            Id = reader.GetInt64(0),
            ProviderId = reader.GetInt64(1),
            StartsAt = reader.GetFieldValue<DateTimeOffset>(2),
            EndsAt = reader.GetFieldValue<DateTimeOffset>(3),
            Status = reader.GetString(4)
        };
    }
}
