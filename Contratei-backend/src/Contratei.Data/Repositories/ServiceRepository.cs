
using Contratei.Domain.Entities;
using Npgsql;

namespace Contratei.Data.Repositories;

public class ServiceRepository : IServiceRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public ServiceRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<ServiceItem?> CreateAsync(ServiceItem service)
    {
        const string sql = """
            INSERT INTO public.services (name, description, active)
            VALUES (@name, @description, true)
            RETURNING id, name, description, active;
            """;

        await using var connection = await _dataSource.OpenConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("name", service.Name);
        command.Parameters.AddWithValue(
            "description", (object?)service.Description ?? DBNull.Value);

        await using var reader = await command.ExecuteReaderAsync();

        return await reader.ReadAsync() ? ReadService(reader) : null;
    }

    public async Task<IReadOnlyList<ServiceItem>> GetAllAsync()
    {
        const string sql = """
            SELECT id, name, description, active
            FROM public.services
            ORDER BY name;
            """;

        var services = new List<ServiceItem>();

        await using var connection = await _dataSource.OpenConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
            services.Add(ReadService(reader));

        return services;
    }

    public async Task<ServiceItem?> GetByIdAsync(long id)
    {
        const string sql = """
            SELECT id, name, description, active
            FROM public.services
            WHERE id = @id;
            """;

        await using var connection = await _dataSource.OpenConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync();

        return await reader.ReadAsync() ? ReadService(reader) : null;
    }

    public async Task<ServiceItem?> UpdateAsync(
        long id,
        ServiceItem service)
    {
        const string sql = """
            UPDATE public.services
            SET name = @name,
                description = @description,
                active = @active
            WHERE id = @id
            RETURNING id, name, description, active;
            """;

        await using var connection = await _dataSource.OpenConnectionAsync();
        await using var command = new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("id", id);
        command.Parameters.AddWithValue("name", service.Name);
        command.Parameters.AddWithValue(
            "description", (object?)service.Description ?? DBNull.Value);
        command.Parameters.AddWithValue("active", service.Active);

        await using var reader = await command.ExecuteReaderAsync();

        return await reader.ReadAsync() ? ReadService(reader) : null;
    }

    private static ServiceItem ReadService(NpgsqlDataReader reader) => new()
    {
        Id = reader.GetInt64(0),
        Name = reader.GetString(1),
        Description = reader.IsDBNull(2) ? null : reader.GetString(2),
        Active = reader.GetBoolean(3)
    };
}
