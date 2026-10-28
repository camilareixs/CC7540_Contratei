using Contratei.Domain.Entities;
using Npgsql;

namespace Contratei.Data.Repositories;

public class ProviderAppointmentRepository
    : IProviderAppointmentRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public ProviderAppointmentRepository(
        NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public Task<IReadOnlyList<ProviderAppointment>>
        GetAllByProviderIdAsync(long providerId)
    {
        return QueryAsync(providerId, "all");
    }

    public Task<IReadOnlyList<ProviderAppointment>>
        GetUpcomingByProviderIdAsync(long providerId)
    {
        return QueryAsync(providerId, "upcoming");
    }

    public Task<IReadOnlyList<ProviderAppointment>>
        GetHistoryByProviderIdAsync(long providerId)
    {
        return QueryAsync(providerId, "history");
    }

    private async Task<IReadOnlyList<ProviderAppointment>>
        QueryAsync(long providerId, string filter)
    {
        var filterSql = filter switch
        {
            "upcoming" => """
                AND sl.starts_at > now()
                AND a.status IN ('pending_payment', 'confirmed')
                """,

            "history" => """
                AND (
                    sl.starts_at <= now()
                    OR a.status IN ('cancelled', 'completed')
                )
                """,

            _ => ""
        };

        var sql = $"""
            SELECT
                a.id AS appointment_id,
                a.customer_id,
                u.name AS customer_name,
                a.provider_service_id,
                s.name AS service_name,
                a.slot_id,
                sl.starts_at,
                sl.ends_at,
                a.status,
                a.price,
                a.created_at
            FROM public.appointments a
            INNER JOIN public.availability_slots sl
                ON sl.id = a.slot_id
            INNER JOIN public.providers p
                ON p.id = sl.provider_id
            INNER JOIN public.provider_services ps
                ON ps.id = a.provider_service_id
                AND ps.provider_id = p.id
            INNER JOIN public.services s
                ON s.id = ps.service_id
            INNER JOIN public.app_users u
                ON u.id = a.customer_id
            WHERE p.id = @providerId
            {filterSql}
            ORDER BY sl.starts_at ASC, a.id ASC;
            """;

        var appointments = new List<ProviderAppointment>();

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command =
            new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("providerId", providerId);

        await using var reader =
            await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            appointments.Add(new ProviderAppointment
            {
                AppointmentId =
                    reader.GetInt64(reader.GetOrdinal("appointment_id")),

                CustomerId =
                    reader.GetInt64(reader.GetOrdinal("customer_id")),

                CustomerName =
                    reader.GetString(reader.GetOrdinal("customer_name")),

                ProviderServiceId =
                    reader.GetInt64(
                        reader.GetOrdinal("provider_service_id")),

                ServiceName =
                    reader.GetString(reader.GetOrdinal("service_name")),

                SlotId =
                    reader.GetInt64(reader.GetOrdinal("slot_id")),

                StartsAt =
                    reader.GetFieldValue<DateTimeOffset>(
                        reader.GetOrdinal("starts_at")),

                EndsAt =
                    reader.GetFieldValue<DateTimeOffset>(
                        reader.GetOrdinal("ends_at")),

                Status =
                    reader.GetString(reader.GetOrdinal("status")),

                Price =
                    reader.GetDecimal(reader.GetOrdinal("price")),

                CreatedAt =
                    reader.GetFieldValue<DateTimeOffset>(
                        reader.GetOrdinal("created_at"))
            });
        }

        return appointments;
    }
}