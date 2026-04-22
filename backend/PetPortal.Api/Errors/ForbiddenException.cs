namespace PetPortal.Api.Errors;

public class ForbiddenException : DomainException
{
    public ForbiddenException(string message) : base(message) { }
}
