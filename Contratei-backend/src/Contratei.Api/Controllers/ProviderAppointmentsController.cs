using Contratei.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Contratei.Api.Controllers;

[ApiController]
[Route("api/providers/{providerId:long}/appointments")]
public class ProviderAppointmentsController : ControllerBase
{
    private readonly IProviderAppointmentService _service;

    public ProviderAppointmentsController(
        IProviderAppointmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(long providerId)
    {
        try
        {
            var appointments =
                await _service.GetAllByProviderIdAsync(providerId);

            return Ok(appointments);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("upcoming")]
    public async Task<IActionResult> GetUpcoming(long providerId)
    {
        try
        {
            var appointments =
                await _service.GetUpcomingByProviderIdAsync(providerId);

            return Ok(appointments);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(long providerId)
    {
        try
        {
            var appointments =
                await _service.GetHistoryByProviderIdAsync(providerId);

            return Ok(appointments);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}