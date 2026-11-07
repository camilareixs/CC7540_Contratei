using Microsoft.AspNetCore.Mvc;

namespace Contratei.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            application = "Contratei API",
            status = "Online",
            timestamp = DateTime.UtcNow
        });
    }
}