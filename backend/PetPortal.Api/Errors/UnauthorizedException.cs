namespace PetPortal.Api.Errors;

public class UnauthorizedException : DomainException
{
    public UnauthorizedException(string message) : base(message) { }
}
