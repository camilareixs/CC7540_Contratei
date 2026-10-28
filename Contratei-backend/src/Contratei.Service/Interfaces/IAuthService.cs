namespace Contratei.Service.Interfaces;

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterUserRequest request);

    Task<AuthResult> LoginAsync(LoginUserRequest request);
}