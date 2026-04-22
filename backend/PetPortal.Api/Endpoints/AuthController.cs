using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PetPortal.Api.Auth;
using PetPortal.Api.Dtos;
using PetPortal.Api.Services;

namespace PetPortal.Api.Endpoints;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly IWebHostEnvironment _env;

    public AuthController(IAuthService auth, IWebHostEnvironment env)
    {
        _auth = auth;
        _env = env;
    }

    [HttpPost("signup")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request, CancellationToken cancellationToken)
    {
        var (_, token) = await _auth.SignupAsync(request, cancellationToken);
        AuthCookie.Set(HttpContext, token, _env.IsDevelopment());
        return NoContent();
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var (_, token) = await _auth.LoginAsync(request, cancellationToken);
        AuthCookie.Set(HttpContext, token, _env.IsDevelopment());
        return NoContent();
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        AuthCookie.Clear(HttpContext, _env.IsDevelopment());
        return NoContent();
    }
}
