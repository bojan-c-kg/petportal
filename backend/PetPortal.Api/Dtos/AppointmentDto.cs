using PetPortal.Api.Data.Entities;

namespace PetPortal.Api.Dtos;

public record AppointmentDto(
    Guid Id,
    Guid PetId,
    string PetName,
    Guid VetId,
    string VetName,
    Guid ServiceId,
    string ServiceName,
    Guid SlotId,
    DateTime SlotStartTime,
    DateTime SlotEndTime,
    AppointmentStatus Status,
    DateTime CreatedAt,
    string InvoiceNumber);
