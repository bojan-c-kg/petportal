using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PetPortal.Api.Data.Entities;

namespace PetPortal.Api.Data.Configurations;

public class AvailabilitySlotConfiguration : IEntityTypeConfiguration<AvailabilitySlot>
{
    public void Configure(EntityTypeBuilder<AvailabilitySlot> builder)
    {
        builder.HasKey(s => s.Id);
        builder.HasIndex(s => new { s.VetId, s.StartTime }).IsUnique();
        builder.HasOne(s => s.Vet)
            .WithMany(v => v.AvailabilitySlots)
            .HasForeignKey(s => s.VetId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
