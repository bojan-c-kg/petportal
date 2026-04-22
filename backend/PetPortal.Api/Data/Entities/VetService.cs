namespace PetPortal.Api.Data.Entities;

public class VetService
{
    public Guid VetId { get; set; }
    public Guid ServiceId { get; set; }

    public Vet Vet { get; set; } = null!;
    public Service Service { get; set; } = null!;
}
