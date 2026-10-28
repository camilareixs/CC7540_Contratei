
using Contratei.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Contratei.Api.Controllers;

[ApiController]
[Route("api")]
public class ProviderProfilesController : ControllerBase
{
    private readonly IProviderProfileService _service;

    public ProviderProfilesController(IProviderProfileService service)
    {
        _service = service;
    }

    [HttpGet("professional-areas")]
    public async Task<IActionResult> GetProfessionalAreas()
    {
        var areas = await _service.GetProfessionalAreasAsync();
        return Ok(areas);
    }

    [HttpGet("providers/{providerId:long}/profile")]
    public async Task<IActionResult> GetProfile(long providerId)
    {
        try
        {
            var profile = await _service.GetByProviderIdAsync(providerId);

            if (profile is null)
            {
                return NotFound(new
                {
                    message = "Perfil complementar ainda não cadastrado."
                });
            }

            return Ok(profile);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("providers/{providerId:long}/profile")]
    public async Task<IActionResult> SaveProfile(
        long providerId,
        [FromBody] ProviderProfileRequest request)
    {
        try
        {
            var profile = await _service.SaveAsync(providerId, request);

            if (profile is null)
            {
                return NotFound(new
                {
                    message = "Profissional não encontrado."
                });
            }

            return Ok(new
            {
                message = "Perfil profissional salvo com sucesso.",
                profile
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    public record AddProfileTopicRequest(string Name);

    [HttpPost("providers/{providerId:long}/profile/topics")]
    public async Task<IActionResult> AddTopic(
        long providerId,
        [FromBody] AddProfileTopicRequest request)
    {
        try
        {
            var topicId = await _service.AddTopicAsync(
                providerId,
                request.Name);

            if (topicId is null)
            {
                return NotFound(new
                {
                    message = "Perfil profissional não encontrado."
                });
            }

            return Created(
                $"/api/providers/{providerId}/profile",
                new
                {
                    id = topicId,
                    name = request.Name.Trim()
                });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("providers/{providerId:long}/profile/topics/{topicId:long}")]
    public async Task<IActionResult> RemoveTopic(
        long providerId,
        long topicId)
    {
        try
        {
            var removed = await _service.RemoveTopicAsync(
                providerId,
                topicId);

            if (!removed)
            {
                return NotFound(new
                {
                    message = "Tópico não encontrado nesse perfil."
                });
            }

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
