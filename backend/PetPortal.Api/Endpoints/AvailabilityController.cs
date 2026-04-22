using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetPortal.Api.Data;
using PetPortal.Api.Dtos;

namespace PetPortal.Api.Endpoints;

[ApiController]
[Authorize]
[Route("api/availability")]
public class AvailabilityController : ControllerBase
{
    private const int MaxRangeDays = 90;

    private readonly PetPortalDbContext _db;

    public AvailabilityController(PetPortalDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AvailabilitySlotDto>>> Query(
        [FromQuery] Guid vetId,
        [FromQuery] Guid serviceId,
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        CancellationToken cancellationToken)
    {
        if (to < from)
        {
            return ValidationProblem("Query parameter 'to' must be on or after 'from'.");
        }

        if (to.DayNumber - from.DayNumber > MaxRangeDays)
        {
            return ValidationProblem($"Date range cannot exceed {MaxRangeDays} days.");
        }

        var vetProvidesService = await _db.VetServices
            .AnyAsync(vs => vs.VetId == vetId && vs.ServiceId == serviceId, cancellationToken);
        if (!vetProvidesService)
        {
            return ValidationProblem("The selected vet does not provide the selected service.");
        }

        var fromUtc = DateTime.SpecifyKind(from.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        var toUtc = DateTime.SpecifyKind(to.AddDays(1).ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);

        var slots = await _db.AvailabilitySlots
            .Where(s => s.VetId == vetId && !s.IsBooked && s.StartTime >= fromUtc && s.StartTime < toUtc)
            .OrderBy(s => s.StartTime)
            .Select(s => new AvailabilitySlotDto(s.Id, s.StartTime, s.EndTime))
            .ToListAsync(cancellationToken);

        return Ok(slots);
    }
}
