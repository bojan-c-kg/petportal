namespace PetPortal.Api.Dtos;

public record AvailabilitySlotDto(
    Guid Id,
    DateTime StartTime,
    DateTime EndTime);
