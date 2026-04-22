namespace PetPortal.Api.Dtos;

public record VetDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Bio,
    string Specialties);
