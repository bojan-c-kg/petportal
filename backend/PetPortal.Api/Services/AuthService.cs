using Microsoft.EntityFrameworkCore;
using PetPortal.Api.Auth;
using PetPortal.Api.Data;
using PetPortal.Api.Data.Entities;
using PetPortal.Api.Dtos;
using PetPortal.Api.Errors;

namespace PetPortal.Api.Services;

public class AuthService : IAuthService
{
    private readonly PetPortalDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenIssuer _tokenIssuer;
    private readonly TimeProvider _time;

    public AuthService(PetPortalDbContext db, IPasswordHasher hasher, IJwtTokenIssuer tokenIssuer, TimeProvider time)
    {
        _db = db;
        _hasher = hasher;
        _tokenIssuer = tokenIssuer;
        _time = time;
    }

    public async Task<(User User, string Token)> SignupAsync(SignupRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await _db.Users.AnyAsync(u => u.Email == email, cancellationToken);
        if (exists)
        {
            throw new ConflictException("An account with this email already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = _hasher.Hash(request.Password),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Phone = request.Phone.Trim(),
            Address = request.Address.Trim(),
            CreatedAt = _time.GetUtcNow().UtcDateTime,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        var token = _tokenIssuer.Issue(user.Id, user.Email);
        return (user, token);
    }

    public async Task<(User User, string Token)> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user is null || !_hasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email or password.");
        }
        var token = _tokenIssuer.Issue(user.Id, user.Email);
        return (user, token);
    }
}
