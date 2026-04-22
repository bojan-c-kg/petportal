namespace PetPortal.Api.Data.Entities;

public class Vet
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Bio { get; set; } = null!;
    public string Specialties { get; set; } = null!;

    public ICollection<VetService> VetServices { get; set; } = new List<VetService>();
    public ICollection<AvailabilitySlot> AvailabilitySlots { get; set; } = new List<AvailabilitySlot>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
