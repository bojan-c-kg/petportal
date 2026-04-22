using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PetPortal.Api.Data.Entities;

namespace PetPortal.Api.Data.Configurations;

public class ConditionConfiguration : IEntityTypeConfiguration<Condition>
{
    public void Configure(EntityTypeBuilder<Condition> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Notes).HasMaxLength(1000);
        builder.HasOne(c => c.Pet)
            .WithMany(p => p.Conditions)
            .HasForeignKey(c => c.PetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
