using PetPortal.Api.Data.Entities;

namespace PetPortal.Api.Dtos;

public record PetDto(
    Guid Id,
    string Name,
    Species Species,
    string? Breed,
    DateOnly? DateOfBirth,
    string? Notes);
