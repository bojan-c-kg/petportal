using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetPortal.Api.Auth;
using PetPortal.Api.Dtos;
using PetPortal.Api.Services;

namespace PetPortal.Api.Endpoints;

[ApiController]
[Authorize]
[Route("api/appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly IBookingService _booking;
    private readonly ICurrentUserAccessor _currentUser;

    public AppointmentsController(IBookingService booking, ICurrentUserAccessor currentUser)
    {
        _booking = booking;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AppointmentDto>>> List(
        [FromQuery] string scope,
        CancellationToken cancellationToken)
    {
        var list = await _booking.ListAsync(_currentUser.UserId, scope ?? "upcoming", cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentDto>> Create(
        [FromBody] CreateAppointmentRequest request,
        CancellationToken cancellationToken)
    {
        var appointment = await _booking.CreateAsync(_currentUser.UserId, request, cancellationToken);
        return Ok(appointment);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
    {
        await _booking.CancelAsync(_currentUser.UserId, id, cancellationToken);
        return NoContent();
    }
}
