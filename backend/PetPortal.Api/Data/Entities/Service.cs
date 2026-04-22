namespace PetPortal.Api.Data.Entities;

public class Service
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }

    public ICollection<VetService> VetServices { get; set; } = new List<VetService>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
