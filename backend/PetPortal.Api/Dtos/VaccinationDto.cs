namespace PetPortal.Api.Dtos;

public record VaccinationDto(
    Guid Id,
    string Name,
    DateTime DateAdministered,
    DateTime? NextDueDate);
