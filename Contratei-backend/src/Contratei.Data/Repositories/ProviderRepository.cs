
using Contratei.Domain.Entities;
using Npgsql;

namespace Contratei.Data.Repositories;

public class ProviderRepository : IProviderRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public ProviderRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<Provider?> CreateAsync(
        User user,
        Provider provider)
    {
        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var transaction =
            await connection.BeginTransactionAsync();

        try
        {
            const string userSql = """
                INSERT INTO public.app_users
                    (name, email, password_hash, role, created_at)
                VALUES
                    (@name, @email, @passwordHash, 'provider', @createdAt)
                RETURNING id;
                """;

            await using var userCommand =
                new NpgsqlCommand(userSql, connection, transaction);

            userCommand.Parameters.AddWithValue("name", user.Name);
            userCommand.Parameters.AddWithValue("email", user.Email);
            userCommand.Parameters.AddWithValue(
                "passwordHash", user.PasswordHash);
            userCommand.Parameters.AddWithValue(
                "createdAt", user.CreatedAt);

            var userIdResult = await userCommand.ExecuteScalarAsync();

            if (userIdResult is null)
            {
                throw new InvalidOperationException(
                    "Não foi possível criar a conta profissional.");
            }

            user.Id = Convert.ToInt64(userIdResult);
            provider.UserId = user.Id;

            const string providerSql = """
                INSERT INTO public.providers
                    (user_id, display_name, description, active)
                VALUES
                    (@userId, @displayName, @description, true)
                RETURNING id, user_id, display_name,
                          description, active, created_at;
                """;

            await using var providerCommand =
                new NpgsqlCommand(providerSql, connection, transaction);

            providerCommand.Parameters.AddWithValue(
                "userId", provider.UserId);
            providerCommand.Parameters.AddWithValue(
                "displayName", provider.DisplayName);
            providerCommand.Parameters.AddWithValue(
                "description",
                (object?)provider.Description ?? DBNull.Value);

            await using var reader =
                await providerCommand.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                throw new InvalidOperationException(
                    "Não foi possível criar o perfil profissional.");
            }

            var createdProvider = ReadProvider(reader);

            await reader.CloseAsync();
            await transaction.CommitAsync();

            return createdProvider;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<Provider?> GetByIdAsync(long id)
    {
        const string sql = """
            SELECT id, user_id, display_name,
                   description, active, created_at
            FROM public.providers
            WHERE id = @id;
            """;

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command =
            new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("id", id);

        await using var reader =
            await command.ExecuteReaderAsync();

        return await reader.ReadAsync()
            ? ReadProvider(reader)
            : null;
    }

    public async Task<Provider?> GetByUserIdAsync(long userId)
    {
        const string sql = """
            SELECT id, user_id, display_name,
                description, active, created_at
            FROM public.providers
            WHERE user_id = @userId;
            """;

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command =
            new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("userId", userId);

        await using var reader =
            await command.ExecuteReaderAsync();

        return await reader.ReadAsync()
            ? ReadProvider(reader)
            : null;
    }

    public async Task<IReadOnlyList<Provider>> GetActiveAsync()
    {
        const string sql = """
            SELECT id, user_id, display_name,
                   description, active, created_at
            FROM public.providers
            WHERE active = true
            ORDER BY display_name;
            """;

        var providers = new List<Provider>();

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command =
            new NpgsqlCommand(sql, connection);

        await using var reader =
            await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            providers.Add(ReadProvider(reader));
        }

        return providers;
    }

    private static Provider ReadProvider(NpgsqlDataReader reader)
    {
        return new Provider
        {
            Id = reader.GetInt64(0),
            UserId = reader.GetInt64(1),
            DisplayName = reader.GetString(2),
            Description = reader.IsDBNull(3)
                ? null
                : reader.GetString(3),
            Active = reader.GetBoolean(4),
            CreatedAt = reader.GetDateTime(5)
        };
    }

    public async Task<IReadOnlyList<FeaturedProvider>> GetFeaturedAsync()
    {
        const string sql = """
            SELECT
                p.id,
                p.display_name,
                pa.name AS professional_area,
                pp.city,
                pp.state,
                pp.description,
                (
                    SELECT MIN(ps.price)
                    FROM public.provider_services ps
                    INNER JOIN public.services s
                        ON s.id = ps.service_id
                    WHERE ps.provider_id = p.id
                    AND ps.active = true
                    AND s.active = true
                ) AS minimum_price
            FROM public.providers p
            INNER JOIN public.provider_profiles pp
                ON pp.provider_id = p.id
            INNER JOIN public.professional_areas pa
                ON pa.id = pp.professional_area_id
            WHERE
                p.active = true
                AND pa.active = true

                -- Perfil complementar preenchido
                AND NULLIF(BTRIM(pp.phone), '') IS NOT NULL
                AND NULLIF(BTRIM(pp.postal_code), '') IS NOT NULL
                AND NULLIF(BTRIM(pp.street), '') IS NOT NULL
                AND NULLIF(BTRIM(pp.street_number), '') IS NOT NULL
                AND NULLIF(BTRIM(pp.neighborhood), '') IS NOT NULL
                AND NULLIF(BTRIM(pp.city), '') IS NOT NULL
                AND NULLIF(BTRIM(pp.state), '') IS NOT NULL
                AND NULLIF(BTRIM(pp.country), '') IS NOT NULL
                AND NULLIF(BTRIM(pp.description), '') IS NOT NULL

                -- Pelo menos um serviço ativo
                AND EXISTS (
                    SELECT 1
                    FROM public.provider_services ps
                    INNER JOIN public.services s
                        ON s.id = ps.service_id
                    WHERE ps.provider_id = p.id
                    AND ps.active = true
                    AND s.active = true
                )

                -- Pelo menos um horário futuro disponível
                AND EXISTS (
                    SELECT 1
                    FROM public.availability_slots sl
                    WHERE sl.provider_id = p.id
                    AND sl.status = 'available'
                    AND sl.starts_at > NOW()
                )
            ORDER BY p.display_name;
            """;

        var providers = new List<FeaturedProvider>();

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command =
            new NpgsqlCommand(sql, connection);

        await using var reader =
            await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            providers.Add(new FeaturedProvider
            {
                Id = reader.GetInt64(0),
                DisplayName = reader.GetString(1),
                ProfessionalArea = reader.GetString(2),
                City = reader.GetString(3),
                State = reader.GetString(4),
                Description = reader.GetString(5),
                MinimumPrice = reader.GetDecimal(6)
            });
        }

        return providers;
    }
}
