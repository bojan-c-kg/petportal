namespace PetPortal.Api.Errors;

public class ConflictException : DomainException
{
    public ConflictException(string message) : base(message) { }
}
