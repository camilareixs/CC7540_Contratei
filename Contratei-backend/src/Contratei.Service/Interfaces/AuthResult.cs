
namespace Contratei.Service.Interfaces;

public class AuthResult
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public long? UserId { get; set; }

    public string? Name { get; set; }

    public string? Email { get; set; }

    public string? Role { get; set; }

    public long? ProviderId { get; set; }
    
    public int StatusCode { get; set; }
}
