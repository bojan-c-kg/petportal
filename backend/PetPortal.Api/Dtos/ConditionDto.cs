namespace PetPortal.Api.Dtos;

public record ConditionDto(
    Guid Id,
    string Name,
    DateOnly DiagnosedDate,
    string? Notes);
