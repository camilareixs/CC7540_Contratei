
using Contratei.Domain.Entities;
using Npgsql;

namespace Contratei.Data.Repositories;

public class ProviderProfileRepository : IProviderProfileRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public ProviderProfileRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<IReadOnlyList<ProfessionalAreaData>>
        GetProfessionalAreasAsync()
    {
        const string sql = """
            SELECT id, name
            FROM public.professional_areas
            WHERE active = TRUE
            ORDER BY name;
            """;

        var result = new List<ProfessionalAreaData>();

        await using var connection =
            await _dataSource.OpenConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new ProfessionalAreaData
            {
                Id = reader.GetInt64(0),
                Name = reader.GetString(1)
            });
        }

        return result;
    }

    public async Task<ProviderProfileData?> GetByProviderIdAsync(
        long providerId)
    {
        await using var connection =
            await _dataSource.OpenConnectionAsync();

        return await ReadProfileAsync(connection, null, providerId);
    }

    public async Task<ProviderProfileData?> UpsertAsync(
        long providerId,
        ProviderProfileData request)
    {
        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var transaction =
            await connection.BeginTransactionAsync();

        try
        {
            // Confirma que o profissional existe.
            const string providerSql = """
                SELECT EXISTS (
                    SELECT 1
                    FROM public.providers
                    WHERE id = @providerId
                );
                """;

            await using (var command = new NpgsqlCommand(
                providerSql, connection, transaction))
            {
                command.Parameters.AddWithValue("providerId", providerId);

                var exists = (bool)(await command.ExecuteScalarAsync()
                    ?? false);

                if (!exists)
                    return await RollbackAndReturnNullAsync(transaction);
            }

            // Confirma que a área existe e está ativa.
            const string areaSql = """
                SELECT EXISTS (
                    SELECT 1
                    FROM public.professional_areas
                    WHERE id = @areaId AND active = TRUE
                );
                """;

            await using (var command = new NpgsqlCommand(
                areaSql, connection, transaction))
            {
                command.Parameters.AddWithValue(
                    "areaId", request.ProfessionalAreaId);

                var exists = (bool)(await command.ExecuteScalarAsync()
                    ?? false);

                if (!exists)
                    throw new ArgumentException(
                        "A área de atuação selecionada não existe ou está inativa.");
            }

            const string upsertSql = """
                INSERT INTO public.provider_profiles (
                    provider_id, phone, postal_code, street,
                    street_number, neighborhood, city, state, country,
                    professional_area_id, description, experience_years
                )
                VALUES (
                    @providerId, @phone, @postalCode, @street,
                    @streetNumber, @neighborhood, @city, @state, @country,
                    @areaId, @description, @experienceYears
                )
                ON CONFLICT (provider_id)
                DO UPDATE SET
                    phone = EXCLUDED.phone,
                    postal_code = EXCLUDED.postal_code,
                    street = EXCLUDED.street,
                    street_number = EXCLUDED.street_number,
                    neighborhood = EXCLUDED.neighborhood,
                    city = EXCLUDED.city,
                    state = EXCLUDED.state,
                    country = EXCLUDED.country,
                    professional_area_id = EXCLUDED.professional_area_id,
                    description = EXCLUDED.description,
                    experience_years = EXCLUDED.experience_years,
                    updated_at = NOW()
                RETURNING id;
                """;

            long profileId;

            await using (var command = new NpgsqlCommand(
                upsertSql, connection, transaction))
            {
                command.Parameters.AddWithValue("providerId", providerId);
                command.Parameters.AddWithValue("phone", request.Phone.Trim());
                command.Parameters.AddWithValue(
                    "postalCode", request.PostalCode.Trim());
                command.Parameters.AddWithValue("street", request.Street.Trim());
                command.Parameters.AddWithValue(
                    "streetNumber", request.StreetNumber.Trim());
                command.Parameters.AddWithValue(
                    "neighborhood", request.Neighborhood.Trim());
                command.Parameters.AddWithValue("city", request.City.Trim());
                command.Parameters.AddWithValue("state", request.State.Trim());
                command.Parameters.AddWithValue("country", request.Country.Trim());
                command.Parameters.AddWithValue(
                    "areaId", request.ProfessionalAreaId);
                command.Parameters.AddWithValue(
                    "description", request.Description.Trim());
                command.Parameters.AddWithValue(
                    "experienceYears", request.ExperienceYears);

                profileId = Convert.ToInt64(
                    await command.ExecuteScalarAsync());
            }

            // Normaliza, remove vazios e evita tópicos duplicados.
            var topics = request.Topics
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (topics.Any(t => t.Length > 100))
                throw new ArgumentException(
                    "Cada tópico deve ter no máximo 100 caracteres.");

            // Substitui a lista anterior pelos tópicos recebidos.
            const string deleteSql = """
                DELETE FROM public.provider_profile_topics
                WHERE provider_profile_id = @profileId;
                """;

            await using (var command = new NpgsqlCommand(
                deleteSql, connection, transaction))
            {
                command.Parameters.AddWithValue("profileId", profileId);
                await command.ExecuteNonQueryAsync();
            }

            const string topicSql = """
                INSERT INTO public.provider_profile_topics
                    (provider_profile_id, name)
                VALUES (@profileId, @name);
                """;

            foreach (var topic in topics)
            {
                await using var command = new NpgsqlCommand(
                    topicSql, connection, transaction);

                command.Parameters.AddWithValue("profileId", profileId);
                command.Parameters.AddWithValue("name", topic);

                await command.ExecuteNonQueryAsync();
            }

            var result = await ReadProfileAsync(
                connection, transaction, providerId);

            await transaction.CommitAsync();
            return result;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static async Task<ProviderProfileData?>
        RollbackAndReturnNullAsync(NpgsqlTransaction transaction)
    {
        await transaction.RollbackAsync();
        return null;
    }

    private static async Task<ProviderProfileData?> ReadProfileAsync(
        NpgsqlConnection connection,
        NpgsqlTransaction? transaction,
        long providerId)
    {
        const string sql = """
            SELECT
                pp.id, pp.provider_id, pp.phone, pp.postal_code,
                pp.street, pp.street_number, pp.neighborhood,
                pp.city, pp.state, pp.country,
                pp.professional_area_id, pa.name,
                pp.description, pp.experience_years,
                pp.created_at, pp.updated_at
            FROM public.provider_profiles pp
            INNER JOIN public.professional_areas pa
                ON pa.id = pp.professional_area_id
            WHERE pp.provider_id = @providerId;
            """;

        long profileId;
        ProviderProfileData result;

        await using (var command = new NpgsqlCommand(
            sql, connection, transaction))
        {
            command.Parameters.AddWithValue("providerId", providerId);

            await using var reader = await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            profileId = reader.GetInt64(0);

            result = new ProviderProfileData
            {
                Id = profileId,
                ProviderId = reader.GetInt64(1),
                Phone = reader.GetString(2),
                PostalCode = reader.GetString(3),
                Street = reader.GetString(4),
                StreetNumber = reader.GetString(5),
                Neighborhood = reader.GetString(6),
                City = reader.GetString(7),
                State = reader.GetString(8),
                Country = reader.GetString(9),
                ProfessionalAreaId = reader.GetInt64(10),
                ProfessionalAreaName = reader.GetString(11),
                Description = reader.GetString(12),
                ExperienceYears = reader.GetInt32(13),
                CreatedAt = reader.GetDateTime(14),
                UpdatedAt = reader.GetDateTime(15)
            };
        }

        const string topicsSql = """
            SELECT name
            FROM public.provider_profile_topics
            WHERE provider_profile_id = @profileId
            ORDER BY name;
            """;

        await using (var command = new NpgsqlCommand(
            topicsSql, connection, transaction))
        {
            command.Parameters.AddWithValue("profileId", profileId);

            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
                result.Topics.Add(reader.GetString(0));
        }

        return result;
    }
    
    public async Task<long?> AddTopicAsync(
        long providerId,
        string name)
    {
        const string sql = """
            INSERT INTO public.provider_profile_topics
                (provider_profile_id, name)
            SELECT pp.id, @name
            FROM public.provider_profiles pp
            WHERE pp.provider_id = @providerId
            ON CONFLICT (provider_profile_id, name) DO NOTHING
            RETURNING id;
            """;

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("providerId", providerId);
        command.Parameters.AddWithValue("name", name.Trim());

        var result = await command.ExecuteScalarAsync();

        return result is null ? null : Convert.ToInt64(result);
    }

    public async Task<bool> RemoveTopicAsync(
        long providerId,
        long topicId)
    {
        const string sql = """
            DELETE FROM public.provider_profile_topics t
            USING public.provider_profiles pp
            WHERE t.provider_profile_id = pp.id
            AND pp.provider_id = @providerId
            AND t.id = @topicId
            RETURNING t.id;
            """;

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("providerId", providerId);
        command.Parameters.AddWithValue("topicId", topicId);

        var result = await command.ExecuteScalarAsync();

        return result is not null;
    }

}
