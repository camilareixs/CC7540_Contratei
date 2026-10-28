
using Contratei.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Contratei.Api.Controllers;

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly IServiceCatalogService _service;

    public ServicesController(IServiceCatalogService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateServiceRequest request)
    {
        try
        {
            var service = await _service.CreateAsync(request);

            if (service is null)
                return StatusCode(500, new
                {
                    message = "Não foi possível cadastrar o serviço."
                });

            return CreatedAtAction(
                nameof(GetById),
                new { id = service.Id },
                service);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        try
        {
            var service = await _service.GetByIdAsync(id);

            return service is null
                ? NotFound(new { message = "Serviço não encontrado." })
                : Ok(service);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(
        long id,
        UpdateServiceRequest request)
    {
        try
        {
            var service = await _service.UpdateAsync(id, request);

            return service is null
                ? NotFound(new { message = "Serviço não encontrado." })
                : Ok(service);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
