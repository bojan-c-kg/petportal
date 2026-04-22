namespace PetPortal.Api.Auth;

public interface ICurrentUserAccessor
{
    Guid UserId { get; }
}
