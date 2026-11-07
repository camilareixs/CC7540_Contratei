
using Contratei.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Contratei.Api.Controllers;

[ApiController]
[Route("api/providers/{providerId:long}/services")]
public class ProviderServicesController : ControllerBase
{
    private readonly IProviderServiceCatalog _service;

    public ProviderServicesController(IProviderServiceCatalog service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Associate(
        long providerId,
        AssociateProviderServiceRequest request)
    {
        try
        {
            var association = await _service.AssociateAsync(
                providerId, request);

            if (association is null)
            {
                return NotFound(new
                {
                    message = "Serviço não encontrado ou inativo."
                });
            }

            return StatusCode(201, association);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (PostgresException ex) when (ex.SqlState == "23505")
        {
            return Conflict(new
            {
                message = "Este serviço já está associado ao profissional."
            });
        }
        catch (PostgresException ex) when (ex.SqlState == "23503")
        {
            return BadRequest(new
            {
                message = "O profissional informado não existe."
            });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetByProvider(long providerId)
    {
        try
        {
            var services = await _service.GetByProviderIdAsync(providerId);
            return Ok(services);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
