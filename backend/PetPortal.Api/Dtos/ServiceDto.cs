namespace PetPortal.Api.Dtos;

public record ServiceDto(
    Guid Id,
    string Name,
    string Description,
    int DurationMinutes,
    decimal Price);
