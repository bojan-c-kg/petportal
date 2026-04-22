namespace PetPortal.Api.Data.Entities;

public class Appointment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PetId { get; set; }
    public Guid VetId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid SlotId { get; set; }
    public AppointmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
    public Pet Pet { get; set; } = null!;
    public Vet Vet { get; set; } = null!;
    public Service Service { get; set; } = null!;
    public AvailabilitySlot Slot { get; set; } = null!;
    public Invoice? Invoice { get; set; }
}
