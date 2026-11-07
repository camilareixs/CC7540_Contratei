
using Contratei.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Contratei.Api.Controllers;

[ApiController]
[Route("api")]
public class AvailabilityController : ControllerBase
{
    private readonly IAvailabilityService _service;

    public AvailabilityController(IAvailabilityService service)
    {
        _service = service;
    }

    [HttpPost("providers/{providerId:long}/availability")]
    public async Task<IActionResult> Create(
        long providerId,
        [FromBody] CreateAvailabilityRequest request)
    {
        try
        {
            var slot = await _service.CreateAsync(providerId, request);

            if (slot is null)
                return NotFound(new
                {
                    message = "Profissional não encontrado ou inativo."
                });

            return StatusCode(StatusCodes.Status201Created, slot);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (PostgresException ex)
            when (ex.SqlState == "23P01" || ex.SqlState == "23505")
        {
            return Conflict(new
            {
                message = "O horário conflita com outro horário cadastrado."
            });
        }
    }

    [HttpGet("providers/{providerId:long}/availability")]
    public async Task<IActionResult> GetByProvider(long providerId)
    {
        try
        {
            return Ok(await _service.GetByProviderIdAsync(providerId));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("providers/{providerId:long}/availability/available")]
    public async Task<IActionResult> GetAvailable(long providerId)
    {
        try
        {
            return Ok(
                await _service.GetAvailableByProviderIdAsync(providerId));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("availability/{id:long}/block")]
    public async Task<IActionResult> Block(long id)
    {
        try
        {
            var blocked = await _service.BlockAsync(id);

            if (!blocked)
                return Conflict(new
                {
                    message = "Horário inexistente, passado ou indisponível para bloqueio."
                });

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
