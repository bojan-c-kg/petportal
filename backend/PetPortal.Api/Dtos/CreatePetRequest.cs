using PetPortal.Api.Data.Entities;

namespace PetPortal.Api.Dtos;

public class CreatePetRequest
{
    public string Name { get; set; } = string.Empty;
    public Species Species { get; set; }
    public string? Breed { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Notes { get; set; }
}
