using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PetPortal.Api.Data.Entities;

namespace PetPortal.Api.Data.Configurations;

public class VaccinationConfiguration : IEntityTypeConfiguration<Vaccination>
{
    public void Configure(EntityTypeBuilder<Vaccination> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Name).IsRequired().HasMaxLength(100);
        builder.HasOne(v => v.Pet)
            .WithMany(p => p.Vaccinations)
            .HasForeignKey(v => v.PetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
