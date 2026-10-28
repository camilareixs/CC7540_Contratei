using Contratei.Data.Repositories;
using Contratei.Domain.Entities;
using Contratei.Service.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Contratei.Service.Services;

public class ProviderService : IProviderService
{
    private readonly IProviderRepository _repository;
    private readonly IPasswordHasher<User> _passwordHasher;

    public ProviderService(
        IProviderRepository repository,
        IPasswordHasher<User> passwordHasher)
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Provider?> CreateAsync(
        CreateProviderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.DisplayName))
        {
            throw new ArgumentException(
                "Nome, e-mail, senha e nome público são obrigatórios.");
        }

        var email = request.Email.Trim().ToLowerInvariant();

        if (!email.Contains('@'))
        {
            throw new ArgumentException(
                "Informe um e-mail válido.");
        }

        if (request.Password.Length < 8)
        {
            throw new ArgumentException(
                "A senha deve ter pelo menos 8 caracteres.");
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            Role = "provider",
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password);

        var provider = new Provider
        {
            DisplayName = request.DisplayName.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim()
        };

        return await _repository.CreateAsync(user, provider);
    }

    public Task<Provider?> GetByIdAsync(long id)
    {
        if (id <= 0)
        {
            throw new ArgumentException(
                "Informe um ID de profissional válido.");
        }

        return _repository.GetByIdAsync(id);
    }

    public Task<IReadOnlyList<Provider>> GetActiveAsync()
    {
        return _repository.GetActiveAsync();
    }

    public Task<IReadOnlyList<FeaturedProvider>> GetFeaturedAsync()
    {
        return _repository.GetFeaturedAsync();
    }
}
