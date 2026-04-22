using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetPortal.Api.Data;
using PetPortal.Api.Dtos;

namespace PetPortal.Api.Endpoints;

[ApiController]
[Authorize]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly PetPortalDbContext _db;

    public ServicesController(PetPortalDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServiceDto>>> List(CancellationToken cancellationToken)
    {
        var services = await _db.Services
            .OrderBy(s => s.Name)
            .Select(s => new ServiceDto(s.Id, s.Name, s.Description, s.DurationMinutes, s.Price))
            .ToListAsync(cancellationToken);
        return Ok(services);
    }
}
