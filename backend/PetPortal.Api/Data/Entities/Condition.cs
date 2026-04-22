namespace PetPortal.Api.Data.Entities;

public class Condition
{
    public Guid Id { get; set; }
    public Guid PetId { get; set; }
    public string Name { get; set; } = null!;
    public DateOnly DiagnosedDate { get; set; }
    public string? Notes { get; set; }

    public Pet Pet { get; set; } = null!;
}
