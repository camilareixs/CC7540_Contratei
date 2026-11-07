using Contratei.Api.DTOs;
using Contratei.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Contratei.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var serviceRequest = new RegisterUserRequest
        {
            Name = request.Name,
            Email = request.Email,
            Password = request.Password
        };

        var result = await _authService.RegisterAsync(serviceRequest);

        return StatusCode(result.StatusCode, new
        {
            message = result.Message,
            user = result.Success
                ? new
                {
                    id = result.UserId,
                    name = result.Name,
                    email = result.Email
                }
                : null
        });
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var serviceRequest = new LoginUserRequest
        {
            Email = request.Email,
            Password = request.Password
        };

        var result = await _authService.LoginAsync(serviceRequest);

        return StatusCode(result.StatusCode, new
        {
            message = result.Message,
            user = result.Success
                ? new
                {
                    id = result.UserId,
                    name = result.Name,
                    email = result.Email,
                    role = result.Role,
                    providerId = result.ProviderId
                }
                : null
        });
    }
}