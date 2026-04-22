namespace PetPortal.Api.Auth;

public interface IJwtTokenIssuer
{
    string Issue(Guid userId, string email);
}
