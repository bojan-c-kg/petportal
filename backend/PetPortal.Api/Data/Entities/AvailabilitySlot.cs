namespace PetPortal.Api.Data.Entities;

public class AvailabilitySlot
{
    public Guid Id { get; set; }
    public Guid VetId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsBooked { get; set; }

    public Vet Vet { get; set; } = null!;
}
