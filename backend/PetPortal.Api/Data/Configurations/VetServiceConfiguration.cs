using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PetPortal.Api.Data.Entities;

namespace PetPortal.Api.Data.Configurations;

public class VetServiceConfiguration : IEntityTypeConfiguration<VetService>
{
    public void Configure(EntityTypeBuilder<VetService> builder)
    {
        builder.HasKey(vs => new { vs.VetId, vs.ServiceId });
        builder.HasOne(vs => vs.Vet)
            .WithMany(v => v.VetServices)
            .HasForeignKey(vs => vs.VetId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(vs => vs.Service)
            .WithMany(s => s.VetServices)
            .HasForeignKey(vs => vs.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
