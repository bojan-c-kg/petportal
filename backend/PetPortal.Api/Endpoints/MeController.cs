using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetPortal.Api.Auth;
using PetPortal.Api.Data;
using PetPortal.Api.Dtos;
using PetPortal.Api.Errors;
using PetPortal.Api.Extensions;

namespace PetPortal.Api.Endpoints;

[ApiController]
[Authorize]
[Route("api/me")]
public class MeController : ControllerBase
{
    private readonly PetPortalDbContext _db;
    private readonly ICurrentUserAccessor _currentUser;

    public MeController(PetPortalDbContext db, ICurrentUserAccessor currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<MeResponse>> Get(CancellationToken cancellationToken)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("User not found.");
        return Ok(user.ToMeResponse());
    }

    [HttpPut]
    public async Task<ActionResult<MeResponse>> Update([FromBody] UpdateMeRequest request, CancellationToken cancellationToken)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("User not found.");
        user.Phone = request.Phone.Trim();
        user.Address = request.Address.Trim();
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(user.ToMeResponse());
    }
}
