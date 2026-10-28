using Contratei.Domain.Entities;
using Npgsql;

namespace Contratei.Data.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public AppointmentRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<Appointment?> CreateAsync(
        long customerId,
        long providerServiceId,
        long slotId)
    {
        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var transaction =
            await connection.BeginTransactionAsync();

        try
        {
            const string validateSql = """
                SELECT
                    s.provider_id,
                    ps.price
                FROM public.availability_slots s
                JOIN public.providers p
                    ON p.id = s.provider_id
                   AND p.active = true
                JOIN public.provider_services ps
                    ON ps.id = @providerServiceId
                   AND ps.provider_id = s.provider_id
                   AND ps.active = true
                WHERE s.id = @slotId
                  AND s.status = 'available'
                  AND s.starts_at > now()
                FOR UPDATE OF s;
                """;

            decimal price;

            await using (var command =
                new NpgsqlCommand(validateSql, connection, transaction))
            {
                command.Parameters.AddWithValue(
                    "providerServiceId", providerServiceId);
                command.Parameters.AddWithValue("slotId", slotId);

                await using var reader =
                    await command.ExecuteReaderAsync();

                if (!await reader.ReadAsync())
                {
                    await reader.CloseAsync();
                    await transaction.RollbackAsync();
                    return null;
                }

                price = reader.GetDecimal(1);
            }

            const string customerSql = """
                SELECT EXISTS (
                    SELECT 1
                    FROM public.app_users
                    WHERE id = @customerId
                      AND role = 'student'
                );
                """;

            await using (var command =
                new NpgsqlCommand(customerSql, connection, transaction))
            {
                command.Parameters.AddWithValue("customerId", customerId);

                var customerExists =
                    (bool)(await command.ExecuteScalarAsync() ?? false);

                if (!customerExists)
                {
                    await transaction.RollbackAsync();
                    return null;
                }
            }

            const string insertSql = """
                INSERT INTO public.appointments
                    (customer_id, provider_service_id, slot_id,
                     status, price)
                VALUES
                    (@customerId, @providerServiceId, @slotId,
                     'pending_payment', @price)
                RETURNING id, customer_id, provider_service_id,
                          slot_id, status, price, created_at;
                """;

            Appointment appointment;

            await using (var command =
                new NpgsqlCommand(insertSql, connection, transaction))
            {
                command.Parameters.AddWithValue("customerId", customerId);
                command.Parameters.AddWithValue(
                    "providerServiceId", providerServiceId);
                command.Parameters.AddWithValue("slotId", slotId);
                command.Parameters.AddWithValue("price", price);

                await using var reader =
                    await command.ExecuteReaderAsync();

                await reader.ReadAsync();
                appointment = Map(reader);
            }

            const string updateSlotSql = """
                UPDATE public.availability_slots
                SET status = 'booked'
                WHERE id = @slotId
                  AND status = 'available';
                """;

            await using (var command =
                new NpgsqlCommand(updateSlotSql, connection, transaction))
            {
                command.Parameters.AddWithValue("slotId", slotId);

                if (await command.ExecuteNonQueryAsync() != 1)
                {
                    await transaction.RollbackAsync();
                    return null;
                }
            }

            await transaction.CommitAsync();
            return appointment;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IReadOnlyList<Appointment>>
        GetByCustomerIdAsync(long customerId)
    {
        const string sql = """
            SELECT
                a.id,
                a.customer_id,
                cu.name AS customer_name,
                p.id AS provider_id,
                p.display_name AS provider_name,
                TRIM(CONCAT_WS(', ',
                    NULLIF(TRIM(pp.street), ''),
                    NULLIF(TRIM(pp.street_number), ''),
                    NULLIF(TRIM(pp.neighborhood), ''),
                    NULLIF(TRIM(pp.city), ''),
                    NULLIF(TRIM(pp.state), ''),
                    NULLIF(TRIM(pp.country), '')
                )) AS provider_address,
                a.provider_service_id,
                s.name AS service_name,
                a.slot_id,
                sl.starts_at,
                sl.ends_at,
                a.status,
                a.price,
                a.created_at
            FROM public.appointments a
            INNER JOIN public.app_users cu
                ON cu.id = a.customer_id
            INNER JOIN public.availability_slots sl
                ON sl.id = a.slot_id
            INNER JOIN public.provider_services ps
                ON ps.id = a.provider_service_id
            INNER JOIN public.providers p
                ON p.id = ps.provider_id
            INNER JOIN public.services s
                ON s.id = ps.service_id
            LEFT JOIN public.provider_profiles pp
                ON pp.provider_id = p.id
            WHERE a.customer_id = @customerId
            ORDER BY sl.starts_at DESC, a.id DESC;
            """;

        var appointments = new List<Appointment>();

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("customerId", customerId);

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            appointments.Add(MapDetailed(reader));
        }

        return appointments;
    }

    public Task<IReadOnlyList<Appointment>>
        GetUpcomingByCustomerIdAsync(long customerId)
    {
        return GetByCustomerIdWithFilterAsync(customerId, "upcoming");
    }

    public Task<IReadOnlyList<Appointment>>
        GetHistoryByCustomerIdAsync(long customerId)
    {
        return GetByCustomerIdWithFilterAsync(customerId, "history");
    }

    private async Task<IReadOnlyList<Appointment>>
        GetByCustomerIdWithFilterAsync(
            long customerId,
            string filter)
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
                    OR a.status IN (
                        'cancelled',
                        'completed',
                        'payment_rejected'
                    )
                )
                """,

            _ => ""
        };

        var sql = $"""
            SELECT
                a.id,
                a.customer_id,
                cu.name AS customer_name,
                p.id AS provider_id,
                p.display_name AS provider_name,
                TRIM(CONCAT_WS(', ',
                    NULLIF(TRIM(pp.street), ''),
                    NULLIF(TRIM(pp.street_number), ''),
                    NULLIF(TRIM(pp.neighborhood), ''),
                    NULLIF(TRIM(pp.city), ''),
                    NULLIF(TRIM(pp.state), ''),
                    NULLIF(TRIM(pp.country), '')
                )) AS provider_address,
                a.provider_service_id,
                s.name AS service_name,
                a.slot_id,
                sl.starts_at,
                sl.ends_at,
                a.status,
                a.price,
                a.created_at
            FROM public.appointments a
            INNER JOIN public.app_users cu
                ON cu.id = a.customer_id
            INNER JOIN public.availability_slots sl
                ON sl.id = a.slot_id
            INNER JOIN public.provider_services ps
                ON ps.id = a.provider_service_id
            INNER JOIN public.providers p
                ON p.id = ps.provider_id
            INNER JOIN public.services s
                ON s.id = ps.service_id
            LEFT JOIN public.provider_profiles pp
                ON pp.provider_id = p.id
            WHERE a.customer_id = @customerId
            {filterSql}
            ORDER BY sl.starts_at ASC, a.id ASC;
            """;

        var appointments = new List<Appointment>();

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command =
            new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("customerId", customerId);

        await using var reader =
            await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            appointments.Add(MapDetailed(reader));
        }

        return appointments;
    }

    private static Appointment MapDetailed(NpgsqlDataReader reader)
    {
        return new Appointment
        {
            Id = reader.GetInt64(
                reader.GetOrdinal("id")),

            CustomerId = reader.GetInt64(
                reader.GetOrdinal("customer_id")),

            CustomerName = reader.GetString(
                reader.GetOrdinal("customer_name")),

            ProviderId = reader.GetInt64(
                reader.GetOrdinal("provider_id")),

            ProviderName = reader.GetString(
                reader.GetOrdinal("provider_name")),

            ProviderServiceId = reader.GetInt64(
                reader.GetOrdinal("provider_service_id")),

            ServiceName = reader.GetString(
                reader.GetOrdinal("service_name")),

            SlotId = reader.GetInt64(
                reader.GetOrdinal("slot_id")),

            StartsAt = reader.GetFieldValue<DateTimeOffset>(
                reader.GetOrdinal("starts_at")),

            EndsAt = reader.GetFieldValue<DateTimeOffset>(
                reader.GetOrdinal("ends_at")),

            Status = reader.GetString(
                reader.GetOrdinal("status")),

            Price = reader.GetDecimal(
                reader.GetOrdinal("price")),

            ProviderAddress = reader.IsDBNull(
                reader.GetOrdinal("provider_address"))
                    ? null
                    : reader.GetString(
                        reader.GetOrdinal("provider_address")),

            CreatedAt = reader.GetFieldValue<DateTimeOffset>(
                reader.GetOrdinal("created_at"))
        };
    }

    private static Appointment Map(NpgsqlDataReader reader)
    {
        return new Appointment
        {
            Id = reader.GetInt64(0),
            CustomerId = reader.GetInt64(1),
            ProviderServiceId = reader.GetInt64(2),
            SlotId = reader.GetInt64(3),
            Status = reader.GetString(4),
            Price = reader.GetDecimal(5),
            CreatedAt = reader.GetFieldValue<DateTimeOffset>(6)
        };
    }
}