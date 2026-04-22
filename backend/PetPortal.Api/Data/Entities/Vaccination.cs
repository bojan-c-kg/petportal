namespace PetPortal.Api.Data.Entities;

public class Vaccination
{
    public Guid Id { get; set; }
    public Guid PetId { get; set; }
    public string Name { get; set; } = null!;
    public DateTime DateAdministered { get; set; }
    public DateTime? NextDueDate { get; set; }

    public Pet Pet { get; set; } = null!;
}
