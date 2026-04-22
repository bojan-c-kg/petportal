using PetPortal.Api.Data.Entities;
using PetPortal.Api.Dtos;

namespace PetPortal.Api.Services;

public interface IAuthService
{
    Task<(User User, string Token)> SignupAsync(SignupRequest request, CancellationToken cancellationToken);
    Task<(User User, string Token)> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
}
