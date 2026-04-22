using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using PetPortal.Api.Data;

#nullable disable

namespace PetPortal.Api.Data.Migrations
{
    [DbContext(typeof(PetPortalDbContext))]
    [Migration("InitialSchema")]
    partial class InitialSchema
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.11")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Appointment", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("PetId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("ServiceId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("SlotId")
                        .HasColumnType("uuid");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("character varying(20)");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("VetId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("PetId");

                    b.HasIndex("ServiceId");

                    b.HasIndex("SlotId")
                        .IsUnique();

                    b.HasIndex("UserId");

                    b.HasIndex("VetId");

                    b.ToTable("Appointments");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.AvailabilitySlot", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("EndTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("IsBooked")
                        .HasColumnType("boolean");

                    b.Property<DateTime>("StartTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("VetId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("VetId", "StartTime")
                        .IsUnique();

                    b.ToTable("AvailabilitySlots");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Condition", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateOnly>("DiagnosedDate")
                        .HasColumnType("date");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("Notes")
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)");

                    b.Property<Guid>("PetId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("PetId");

                    b.ToTable("Conditions");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Invoice", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<decimal>("Amount")
                        .HasColumnType("numeric(10,2)");

                    b.Property<Guid>("AppointmentId")
                        .HasColumnType("uuid");

                    b.Property<DateTime>("IssuedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Number")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("character varying(20)");

                    b.HasKey("Id");

                    b.HasIndex("AppointmentId")
                        .IsUnique();

                    b.HasIndex("Number")
                        .IsUnique();

                    b.ToTable("Invoices");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Pet", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Breed")
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<DateOnly?>("DateOfBirth")
                        .HasColumnType("date");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("Notes")
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)");

                    b.Property<string>("Species")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("character varying(20)");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Pets");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Service", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("character varying(1000)");

                    b.Property<int>("DurationMinutes")
                        .HasColumnType("integer");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<decimal>("Price")
                        .HasColumnType("numeric(10,2)");

                    b.HasKey("Id");

                    b.ToTable("Services");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Address")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("character varying(500)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(320)
                        .HasColumnType("character varying(320)");

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("Phone")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.HasKey("Id");

                    b.HasIndex("Email")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Vaccination", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("DateAdministered")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<DateTime?>("NextDueDate")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("PetId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("PetId");

                    b.ToTable("Vaccinations");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Vet", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Bio")
                        .IsRequired()
                        .HasMaxLength(2000)
                        .HasColumnType("character varying(2000)");

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<string>("Specialties")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("character varying(500)");

                    b.HasKey("Id");

                    b.ToTable("Vets");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.VetService", b =>
                {
                    b.Property<Guid>("VetId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("ServiceId")
                        .HasColumnType("uuid");

                    b.HasKey("VetId", "ServiceId");

                    b.HasIndex("ServiceId");

                    b.ToTable("VetServices");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Appointment", b =>
                {
                    b.HasOne("PetPortal.Api.Data.Entities.Pet", "Pet")
                        .WithMany()
                        .HasForeignKey("PetId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("PetPortal.Api.Data.Entities.Service", "Service")
                        .WithMany("Appointments")
                        .HasForeignKey("ServiceId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("PetPortal.Api.Data.Entities.AvailabilitySlot", "Slot")
                        .WithOne()
                        .HasForeignKey("PetPortal.Api.Data.Entities.Appointment", "SlotId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("PetPortal.Api.Data.Entities.User", "User")
                        .WithMany("Appointments")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("PetPortal.Api.Data.Entities.Vet", "Vet")
                        .WithMany("Appointments")
                        .HasForeignKey("VetId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Pet");

                    b.Navigation("Service");

                    b.Navigation("Slot");

                    b.Navigation("User");

                    b.Navigation("Vet");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.AvailabilitySlot", b =>
                {
                    b.HasOne("PetPortal.Api.Data.Entities.Vet", "Vet")
                        .WithMany("AvailabilitySlots")
                        .HasForeignKey("VetId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Vet");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Condition", b =>
                {
                    b.HasOne("PetPortal.Api.Data.Entities.Pet", "Pet")
                        .WithMany("Conditions")
                        .HasForeignKey("PetId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Pet");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Invoice", b =>
                {
                    b.HasOne("PetPortal.Api.Data.Entities.Appointment", "Appointment")
                        .WithOne("Invoice")
                        .HasForeignKey("PetPortal.Api.Data.Entities.Invoice", "AppointmentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Appointment");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Pet", b =>
                {
                    b.HasOne("PetPortal.Api.Data.Entities.User", "User")
                        .WithMany("Pets")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Vaccination", b =>
                {
                    b.HasOne("PetPortal.Api.Data.Entities.Pet", "Pet")
                        .WithMany("Vaccinations")
                        .HasForeignKey("PetId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Pet");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.VetService", b =>
                {
                    b.HasOne("PetPortal.Api.Data.Entities.Service", "Service")
                        .WithMany("VetServices")
                        .HasForeignKey("ServiceId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("PetPortal.Api.Data.Entities.Vet", "Vet")
                        .WithMany("VetServices")
                        .HasForeignKey("VetId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Service");

                    b.Navigation("Vet");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Appointment", b =>
                {
                    b.Navigation("Invoice");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Pet", b =>
                {
                    b.Navigation("Conditions");

                    b.Navigation("Vaccinations");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Service", b =>
                {
                    b.Navigation("Appointments");

                    b.Navigation("VetServices");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.User", b =>
                {
                    b.Navigation("Appointments");

                    b.Navigation("Pets");
                });

            modelBuilder.Entity("PetPortal.Api.Data.Entities.Vet", b =>
                {
                    b.Navigation("Appointments");

                    b.Navigation("AvailabilitySlots");

                    b.Navigation("VetServices");
                });
#pragma warning restore 612, 618
        }
    }
}
