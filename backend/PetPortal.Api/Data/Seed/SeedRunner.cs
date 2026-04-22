using Microsoft.EntityFrameworkCore;
using PetPortal.Api.Data.Entities;
using PetPortal.Api.Services;

namespace PetPortal.Api.Data.Seed;

public static class SeedRunner
{
    private const string TestUserEmail = "test@example.com";
    private const string TestUserPassword = "Password123!";

    public static async Task RunAsync(PetPortalDbContext db, IPasswordHasher hasher, CancellationToken cancellationToken = default)
    {
        if (await db.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var now = DateTime.UtcNow;

        var checkup = new Service
        {
            Id = Guid.NewGuid(),
            Name = "Wellness Checkup",
            Description = "General physical exam and weight check.",
            DurationMinutes = 30,
            Price = 55m,
        };
        var vaccination = new Service
        {
            Id = Guid.NewGuid(),
            Name = "Vaccination",
            Description = "Core vaccinations updated according to schedule.",
            DurationMinutes = 30,
            Price = 45m,
        };
        var dental = new Service
        {
            Id = Guid.NewGuid(),
            Name = "Dental Cleaning",
            Description = "Professional dental cleaning under light sedation.",
            DurationMinutes = 60,
            Price = 180m,
        };
        var surgery = new Service
        {
            Id = Guid.NewGuid(),
            Name = "Minor Surgery Consult",
            Description = "Consultation for minor surgical procedures.",
            DurationMinutes = 30,
            Price = 85m,
        };
        var grooming = new Service
        {
            Id = Guid.NewGuid(),
            Name = "Grooming",
            Description = "Bath, nail trim, and coat care.",
            DurationMinutes = 60,
            Price = 65m,
        };
        db.Services.AddRange(checkup, vaccination, dental, surgery, grooming);

        var martinez = new Vet
        {
            Id = Guid.NewGuid(),
            FirstName = "Anna",
            LastName = "Martinez",
            Bio = "Fifteen years of general practice with a focus on nutrition.",
            Specialties = "General Practice, Nutrition",
        };
        var kim = new Vet
        {
            Id = Guid.NewGuid(),
            FirstName = "Devon",
            LastName = "Kim",
            Bio = "Board-certified in small animal dentistry and soft-tissue surgery.",
            Specialties = "Dentistry, Surgery",
        };
        var patel = new Vet
        {
            Id = Guid.NewGuid(),
            FirstName = "Priya",
            LastName = "Patel",
            Bio = "Preventive care and grooming for cats and dogs.",
            Specialties = "Preventive Care, Grooming",
        };
        db.Vets.AddRange(martinez, kim, patel);

        db.VetServices.AddRange(
            new VetService { VetId = martinez.Id, ServiceId = checkup.Id },
            new VetService { VetId = martinez.Id, ServiceId = vaccination.Id },
            new VetService { VetId = martinez.Id, ServiceId = surgery.Id },
            new VetService { VetId = martinez.Id, ServiceId = grooming.Id },
            new VetService { VetId = kim.Id, ServiceId = checkup.Id },
            new VetService { VetId = kim.Id, ServiceId = dental.Id },
            new VetService { VetId = kim.Id, ServiceId = surgery.Id },
            new VetService { VetId = patel.Id, ServiceId = checkup.Id },
            new VetService { VetId = patel.Id, ServiceId = vaccination.Id },
            new VetService { VetId = patel.Id, ServiceId = grooming.Id });

        var futureSlots = GenerateFutureSlots(new[] { martinez, patel, kim }, now);
        db.AvailabilitySlots.AddRange(futureSlots);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = TestUserEmail,
            PasswordHash = hasher.Hash(TestUserPassword),
            FirstName = "Alex",
            LastName = "Taylor",
            Phone = "555-0123",
            Address = "742 Evergreen Terrace",
            CreatedAt = now,
        };
        db.Users.Add(user);

        var rex = new Pet
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Name = "Rex",
            Species = Species.Dog,
            Breed = "Labrador Retriever",
            DateOfBirth = DateOnly.FromDateTime(now.AddYears(-4)),
            Notes = "Loves fetch and peanut butter.",
        };
        var luna = new Pet
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Name = "Luna",
            Species = Species.Cat,
            Breed = "Russian Blue",
            DateOfBirth = DateOnly.FromDateTime(now.AddYears(-2)),
            Notes = "Shy around new people but warms up quickly.",
        };
        db.Pets.AddRange(rex, luna);

        db.Vaccinations.AddRange(
            new Vaccination { Id = Guid.NewGuid(), PetId = rex.Id, Name = "Rabies", DateAdministered = now.AddMonths(-6), NextDueDate = now.AddMonths(6) },
            new Vaccination { Id = Guid.NewGuid(), PetId = rex.Id, Name = "DHPP", DateAdministered = now.AddMonths(-12), NextDueDate = now.AddMonths(-1) },
            new Vaccination { Id = Guid.NewGuid(), PetId = luna.Id, Name = "Rabies", DateAdministered = now.AddMonths(-3), NextDueDate = now.AddMonths(9) },
            new Vaccination { Id = Guid.NewGuid(), PetId = luna.Id, Name = "FVRCP", DateAdministered = now.AddMonths(-8), NextDueDate = now.AddMonths(4) });

        db.Conditions.AddRange(
            new Condition
            {
                Id = Guid.NewGuid(),
                PetId = rex.Id,
                Name = "Mild hip dysplasia",
                DiagnosedDate = DateOnly.FromDateTime(now.AddMonths(-10)),
                Notes = "Managed with joint supplements and weight control.",
            },
            new Condition
            {
                Id = Guid.NewGuid(),
                PetId = luna.Id,
                Name = "Seasonal allergies",
                DiagnosedDate = DateOnly.FromDateTime(now.AddMonths(-4)),
                Notes = "Responds well to antihistamines during spring.",
            });

        var past1Start = DateTime.SpecifyKind(now.Date.AddDays(-7).AddHours(10), DateTimeKind.Utc);
        var past1Slot = new AvailabilitySlot
        {
            Id = Guid.NewGuid(),
            VetId = martinez.Id,
            StartTime = past1Start,
            EndTime = past1Start.AddMinutes(checkup.DurationMinutes),
            IsBooked = true,
        };
        var past2Start = DateTime.SpecifyKind(now.Date.AddDays(-14).AddHours(14), DateTimeKind.Utc);
        var past2Slot = new AvailabilitySlot
        {
            Id = Guid.NewGuid(),
            VetId = kim.Id,
            StartTime = past2Start,
            EndTime = past2Start.AddMinutes(dental.DurationMinutes),
            IsBooked = true,
        };
        db.AvailabilitySlots.AddRange(past1Slot, past2Slot);

        var pastCheckup = new Appointment
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            PetId = rex.Id,
            VetId = martinez.Id,
            ServiceId = checkup.Id,
            SlotId = past1Slot.Id,
            Status = AppointmentStatus.Completed,
            CreatedAt = now.AddDays(-10),
        };
        var pastDental = new Appointment
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            PetId = luna.Id,
            VetId = kim.Id,
            ServiceId = dental.Id,
            SlotId = past2Slot.Id,
            Status = AppointmentStatus.Completed,
            CreatedAt = now.AddDays(-20),
        };
        db.Appointments.AddRange(pastCheckup, pastDental);

        var futureGroomingSlot = futureSlots
            .Where(s => s.VetId == patel.Id && s.StartTime.DayOfWeek == DayOfWeek.Wednesday)
            .OrderBy(s => s.StartTime)
            .Skip(1)
            .First();
        futureGroomingSlot.IsBooked = true;

        var futureVaccinationSlot = futureSlots
            .Where(s => s.VetId == martinez.Id && s.StartTime.DayOfWeek == DayOfWeek.Thursday)
            .OrderBy(s => s.StartTime)
            .Skip(2)
            .First();
        futureVaccinationSlot.IsBooked = true;

        var futureGrooming = new Appointment
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            PetId = rex.Id,
            VetId = patel.Id,
            ServiceId = grooming.Id,
            SlotId = futureGroomingSlot.Id,
            Status = AppointmentStatus.Booked,
            CreatedAt = now,
        };
        var futureVaccination = new Appointment
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            PetId = luna.Id,
            VetId = martinez.Id,
            ServiceId = vaccination.Id,
            SlotId = futureVaccinationSlot.Id,
            Status = AppointmentStatus.Booked,
            CreatedAt = now,
        };
        db.Appointments.AddRange(futureGrooming, futureVaccination);

        db.Invoices.AddRange(
            new Invoice
            {
                Id = Guid.NewGuid(),
                Number = "INV-001",
                AppointmentId = pastCheckup.Id,
                Amount = checkup.Price,
                IssuedAt = past1Start.AddHours(1),
            },
            new Invoice
            {
                Id = Guid.NewGuid(),
                Number = "INV-002",
                AppointmentId = pastDental.Id,
                Amount = dental.Price,
                IssuedAt = past2Start.AddHours(2),
            },
            new Invoice
            {
                Id = Guid.NewGuid(),
                Number = "INV-003",
                AppointmentId = futureGrooming.Id,
                Amount = grooming.Price,
                IssuedAt = now,
            },
            new Invoice
            {
                Id = Guid.NewGuid(),
                Number = "INV-004",
                AppointmentId = futureVaccination.Id,
                Amount = vaccination.Price,
                IssuedAt = now,
            });

        await db.SaveChangesAsync(cancellationToken);
    }

    private static List<AvailabilitySlot> GenerateFutureSlots(IEnumerable<Vet> vets, DateTime now)
    {
        const int weeks = 4;
        const int workStartHour = 9;
        const int workEndHour = 17;
        const int slotMinutes = 30;

        var slots = new List<AvailabilitySlot>();
        var startDate = DateOnly.FromDateTime(now);

        foreach (var vet in vets)
        {
            for (var dayOffset = 0; dayOffset < weeks * 7; dayOffset++)
            {
                var date = startDate.AddDays(dayOffset);
                if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                {
                    continue;
                }

                for (var minute = workStartHour * 60; minute < workEndHour * 60; minute += slotMinutes)
                {
                    var start = DateTime.SpecifyKind(
                        date.ToDateTime(TimeOnly.MinValue).AddMinutes(minute),
                        DateTimeKind.Utc);
                    if (start <= now)
                    {
                        continue;
                    }
                    slots.Add(new AvailabilitySlot
                    {
                        Id = Guid.NewGuid(),
                        VetId = vet.Id,
                        StartTime = start,
                        EndTime = start.AddMinutes(slotMinutes),
                        IsBooked = false,
                    });
                }
            }
        }

        return slots;
    }
}
