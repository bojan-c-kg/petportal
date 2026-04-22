using Microsoft.EntityFrameworkCore;
using PetPortal.Api.Data.Entities;

namespace PetPortal.Api.Data;

public class PetPortalDbContext : DbContext
{
    public PetPortalDbContext(DbContextOptions<PetPortalDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<Vaccination> Vaccinations => Set<Vaccination>();
    public DbSet<Condition> Conditions => Set<Condition>();
    public DbSet<Vet> Vets => Set<Vet>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<VetService> VetServices => Set<VetService>();
    public DbSet<AvailabilitySlot> AvailabilitySlots => Set<AvailabilitySlot>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Invoice> Invoices => Set<Invoice>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PetPortalDbContext).Assembly);
    }
}
