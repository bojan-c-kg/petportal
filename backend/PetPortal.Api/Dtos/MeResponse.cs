namespace PetPortal.Api.Dtos;

public record MeResponse(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Phone,
    string Address);
