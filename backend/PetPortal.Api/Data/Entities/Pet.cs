namespace PetPortal.Api.Data.Entities;

public class Pet
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public Species Species { get; set; }
    public string? Breed { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Notes { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Vaccination> Vaccinations { get; set; } = new List<Vaccination>();
    public ICollection<Condition> Conditions { get; set; } = new List<Condition>();
}
