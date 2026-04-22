namespace PetPortal.Api.Data.Entities;

public class Invoice
{
    public Guid Id { get; set; }
    public string Number { get; set; } = null!;
    public Guid AppointmentId { get; set; }
    public decimal Amount { get; set; }
    public DateTime IssuedAt { get; set; }

    public Appointment Appointment { get; set; } = null!;
}
