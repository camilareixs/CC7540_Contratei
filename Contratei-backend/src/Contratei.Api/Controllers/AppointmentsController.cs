
using Contratei.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Contratei.Api.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _service;

    public AppointmentsController(IAppointmentService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateAppointmentRequest request)
    {
        try
        {
            var appointment = await _service.CreateAsync(request);

            if (appointment is null)
            {
                return Conflict(new
                {
                    message =
                        "Não foi possível reservar. Confira o cliente, o serviço e a disponibilidade do horário."
                });
            }

            return StatusCode(
                StatusCodes.Status201Created, appointment);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (PostgresException ex)
            when (ex.SqlState == "23505")
        {
            return Conflict(new
            {
                message = "Esse horário já possui um agendamento."
            });
        }
    }

    [HttpGet("customer/{customerId:long}")]
    public async Task<IActionResult> GetByCustomer(long customerId)
    {
        try
        {
            return Ok(
                await _service.GetByCustomerIdAsync(customerId));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("customer/{customerId:long}/upcoming")]
    public async Task<IActionResult> GetUpcomingByCustomer(
        long customerId)
    {
        try
        {
            var appointments =
                await _service.GetUpcomingByCustomerIdAsync(customerId);

            return Ok(appointments);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("customer/{customerId:long}/history")]
    public async Task<IActionResult> GetHistoryByCustomer(
        long customerId)
    {
        try
        {
            var appointments =
                await _service.GetHistoryByCustomerIdAsync(customerId);

            return Ok(appointments);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
