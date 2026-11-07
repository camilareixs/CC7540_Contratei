using Contratei.Data.Repositories;
using Contratei.Domain.Entities;
using Contratei.Service.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Contratei.Service.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IProviderRepository _providerRepository;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher<User> passwordHasher,
        IProviderRepository providerRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _providerRepository = providerRepository;
    }

    public async Task<AuthResult> RegisterAsync(
        RegisterUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Role))
        {
            return Failure(400,
                "Nome, e-mail, senha e tipo de usuário são obrigatórios.");
        }

        var name = request.Name.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        var role = request.Role.Trim().ToLowerInvariant();

        if (role != "student" && role != "provider")
        {
            return Failure(400,
                "O tipo de conta deve ser student ou provider.");
        }

        if (!email.Contains('@') || request.Password.Length < 8)
        {
            return Failure(400,
                "Informe um e-mail válido e uma senha com pelo menos 8 caracteres.");
        }

        var existingUser =
            await _userRepository.GetByEmailAsync(email);

        if (existingUser is not null)
        {
            return Failure(409,
                "Este e-mail já está cadastrado.");
        }

        var user = new User
        {
            Name = name,
            Email = email,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password);

        var createdUser = await _userRepository.CreateAsync(user);

        if (createdUser is null)
        {
            return Failure(409,
                "Este e-mail já está cadastrado.");
        }

        return new AuthResult
        {
            Success = true,
            StatusCode = 200,
            Message = "Usuário cadastrado com sucesso.",
            UserId = createdUser.Id,
            Name = createdUser.Name,
            Email = createdUser.Email,
            Role = createdUser.Role
        };
    }

    public async Task<AuthResult> LoginAsync(
        LoginUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return Failure(400,
                "E-mail e senha são obrigatórios.");
        }

        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _userRepository.GetByEmailAsync(email);

        if (user is null)
        {
            return Failure(401,
                "E-mail ou senha inválidos.");
        }

        var verification = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (verification == PasswordVerificationResult.Failed)
        {
            return Failure(401,
                "E-mail ou senha inválidos.");
        }

        long? providerId = null;

        if (user.Role == "provider")
        {
            var provider = await _providerRepository
                .GetByUserIdAsync(user.Id);

            if (provider is null)
            {
                return Failure(
                    409,
                    "A conta profissional não possui um perfil cadastrado.");
            }

            providerId = provider.Id;
        }

        return new AuthResult
        {
            Success = true,
            StatusCode = 200,
            Message = "Login realizado com sucesso.",
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            ProviderId = providerId
        };
    }

    private static AuthResult Failure(int statusCode, string message)
    {
        return new AuthResult
        {
            Success = false,
            StatusCode = statusCode,
            Message = message
        };
    }
}