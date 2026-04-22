namespace PetPortal.Api.Dtos;

public class CreateAppointmentRequest
{
    public Guid PetId { get; set; }
    public Guid VetId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid SlotId { get; set; }
}
