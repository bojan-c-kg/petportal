using PetPortal.Api.Data.Entities;

namespace PetPortal.Api.Dtos;

public record PetDetailDto(
    Guid Id,
    string Name,
    Species Species,
    string? Breed,
    DateOnly? DateOfBirth,
    string? Notes,
    IReadOnlyList<VaccinationDto> Vaccinations,
    IReadOnlyList<ConditionDto> Conditions);
