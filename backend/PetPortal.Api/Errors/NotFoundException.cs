namespace PetPortal.Api.Errors;

public class NotFoundException : DomainException
{
    public NotFoundException(string message) : base(message) { }
}
