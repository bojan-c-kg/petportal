using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PetPortal.Api.Data.Entities;

namespace PetPortal.Api.Data.Configurations;

public class VetConfiguration : IEntityTypeConfiguration<Vet>
{
    public void Configure(EntityTypeBuilder<Vet> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(v => v.LastName).IsRequired().HasMaxLength(100);
        builder.Property(v => v.Bio).IsRequired().HasMaxLength(2000);
        builder.Property(v => v.Specialties).IsRequired().HasMaxLength(500);
    }
}
