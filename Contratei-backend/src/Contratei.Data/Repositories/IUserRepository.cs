using Contratei.Domain.Entities;

namespace Contratei.Data.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);

    Task<User?> CreateAsync(User user);
}