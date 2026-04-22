using System.Security.Claims;
using PetPortal.Api.Errors;

namespace PetPortal.Api.Auth;

public class CurrentUserAccessor : ICurrentUserAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var sub = user?.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user?.FindFirstValue("sub");
            if (!Guid.TryParse(sub, out var id))
            {
                throw new UnauthorizedException("Missing or invalid authentication.");
            }
            return id;
        }
    }
}
