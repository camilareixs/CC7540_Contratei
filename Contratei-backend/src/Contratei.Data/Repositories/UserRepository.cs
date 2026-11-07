using Contratei.Domain.Entities;
using Npgsql;

namespace Contratei.Data.Repositories;

public class UserRepository : IUserRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public UserRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = """
            SELECT id, name, email, password_hash, role, created_at
            FROM public.app_users
            WHERE email = @email
            LIMIT 1;
            """;

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command =
            new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("email", email);

        await using var reader =
            await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
        {
            return null;
        }

        return new User
        {
            Id = reader.GetInt64(0),
            Name = reader.GetString(1),
            Email = reader.GetString(2),
            PasswordHash = reader.GetString(3),
            Role = reader.GetString(4),
            CreatedAt = reader.GetDateTime(5)
        };
    }

    public async Task<User?> CreateAsync(User user)
    {
        const string sql = """
            INSERT INTO public.app_users
                (name, email, password_hash, role, created_at)
            VALUES
                (@name, @email, @passwordHash, @role, @createdAt)
            ON CONFLICT (email) DO NOTHING
            RETURNING id;
            """;

        await using var connection =
            await _dataSource.OpenConnectionAsync();

        await using var command =
            new NpgsqlCommand(sql, connection);

        command.Parameters.AddWithValue("name", user.Name);
        command.Parameters.AddWithValue("email", user.Email);
        command.Parameters.AddWithValue("passwordHash", user.PasswordHash);
        command.Parameters.AddWithValue("role", user.Role);
        command.Parameters.AddWithValue("createdAt", user.CreatedAt);

        var result = await command.ExecuteScalarAsync();

        if (result is null)
        {
            return null;
        }

        user.Id = Convert.ToInt64(result);

        return user;
    }
}