using Contratei.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Contratei.Api.Controllers;

[ApiController]
[Route("api/providers")]
public class ProvidersController : ControllerBase
{
    private readonly IProviderService _providerService;

    public ProvidersController(IProviderService providerService)
    {
        _providerService = providerService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateProviderRequest request)
    {
        try
        {
            var provider =
                await _providerService.CreateAsync(request);

            if (provider is null)
            {
                return Conflict(new
                {
                    message = "Não foi possível criar o perfil profissional."
                });
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = provider.Id },
                new
                {
                    provider.Id,
                    provider.UserId,
                    provider.DisplayName,
                    provider.Description,
                    provider.Active,
                    provider.CreatedAt,
                    Role = "provider"
                });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (PostgresException ex) when (ex.SqlState == "23505")
        {
            return Conflict(new
            {
                message = "Este e-mail já está cadastrado ou o perfil profissional já existe."
            });
        }
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured()
    {
        var providers = await _providerService.GetFeaturedAsync();
        return Ok(providers);
    }

    [HttpGet]
    public async Task<IActionResult> GetActive()
    {
        var providers = await _providerService.GetActiveAsync();
        return Ok(providers);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        try
        {
            var provider = await _providerService.GetByIdAsync(id);

            if (provider is null)
            {
                return NotFound(new
                {
                    message = "Profissional não encontrado."
                });
            }

            return Ok(provider);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
