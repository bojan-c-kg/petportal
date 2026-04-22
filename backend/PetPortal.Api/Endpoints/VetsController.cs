using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetPortal.Api.Data;
using PetPortal.Api.Dtos;

namespace PetPortal.Api.Endpoints;

[ApiController]
[Authorize]
[Route("api/vets")]
public class VetsController : ControllerBase
{
    private readonly PetPortalDbContext _db;

    public VetsController(PetPortalDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VetDto>>> List([FromQuery] Guid? serviceId, CancellationToken cancellationToken)
    {
        var query = _db.Vets.AsQueryable();
        if (serviceId.HasValue)
        {
            query = query.Where(v => v.VetServices.Any(vs => vs.ServiceId == serviceId.Value));
        }

        var vets = await query
            .OrderBy(v => v.LastName)
            .ThenBy(v => v.FirstName)
            .Select(v => new VetDto(v.Id, v.FirstName, v.LastName, v.Bio, v.Specialties))
            .ToListAsync(cancellationToken);
        return Ok(vets);
    }
}
