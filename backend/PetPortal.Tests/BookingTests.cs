using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using PetPortal.Api.Data;
using PetPortal.Api.Data.Entities;
using PetPortal.Api.Dtos;

namespace PetPortal.Tests;

public class BookingTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly JsonSerializerOptions _json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    public BookingTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<(Guid VetId, Guid ServiceId, Guid SlotId)> SeedBookableAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<PetPortalDbContext>();

        var vet = new Vet
        {
            Id = Guid.NewGuid(),
            FirstName = "Anna",
            LastName = "Smith",
            Bio = "Small animal vet.",
            Specialties = "General, Dentistry",
        };
        var service = new Service
        {
            Id = Guid.NewGuid(),
            Name = "Checkup",
            Description = "General wellness exam",
            DurationMinutes = 30,
            Price = 50m,
        };
        var vetService = new VetService { VetId = vet.Id, ServiceId = service.Id };
        var start = DateTime.UtcNow.AddDays(7);
        var slot = new AvailabilitySlot
        {
            Id = Guid.NewGuid(),
            VetId = vet.Id,
            StartTime = start,
            EndTime = start.AddMinutes(30),
            IsBooked = false,
        };

        db.Vets.Add(vet);
        db.Services.Add(service);
        db.VetServices.Add(vetService);
        db.AvailabilitySlots.Add(slot);
        await db.SaveChangesAsync();

        return (vet.Id, service.Id, slot.Id);
    }

    private static SignupRequest NewSignup(string email) => new()
    {
        Email = email,
        Password = "Password123!",
        FirstName = "Test",
        LastName = "User",
        Phone = "555-0100",
        Address = "1 Test Lane",
    };

    private async Task<(HttpClient Client, Guid PetId)> CreateAuthenticatedUserWithPetAsync(string emailPrefix)
    {
        var client = _factory.CreateClient();
        var signup = await client.PostAsJsonAsync("/api/auth/signup", NewSignup($"{emailPrefix}-{Guid.NewGuid():N}@example.com"));
        signup.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var petBody = new CreatePetRequest { Name = "Rex", Species = Species.Dog };
        var petResp = await client.PostAsJsonAsync("/api/pets", petBody, _json);
        petResp.StatusCode.Should().Be(HttpStatusCode.Created);
        var pet = await petResp.Content.ReadFromJsonAsync<PetDto>(_json);
        pet.Should().NotBeNull();
        return (client, pet!.Id);
    }

    [Fact]
    public async Task Full_booking_flow_creates_lists_and_cancels()
    {
        var (client, petId) = await CreateAuthenticatedUserWithPetAsync("booking");
        var (vetId, serviceId, slotId) = await SeedBookableAsync();

        var services = await client.GetFromJsonAsync<List<ServiceDto>>("/api/services", _json);
        services.Should().NotBeNull();
        services!.Any(s => s.Id == serviceId).Should().BeTrue();

        var from = DateOnly.FromDateTime(DateTime.UtcNow);
        var to = from.AddDays(30);
        var available = await client.GetFromJsonAsync<List<AvailabilitySlotDto>>(
            $"/api/availability?vetId={vetId}&serviceId={serviceId}&from={from:yyyy-MM-dd}&to={to:yyyy-MM-dd}",
            _json);
        available.Should().NotBeNull();
        available!.Any(s => s.Id == slotId).Should().BeTrue();

        var createResp = await client.PostAsJsonAsync("/api/appointments",
            new CreateAppointmentRequest { PetId = petId, VetId = vetId, ServiceId = serviceId, SlotId = slotId },
            _json);
        createResp.EnsureSuccessStatusCode();
        var appointment = await createResp.Content.ReadFromJsonAsync<AppointmentDto>(_json);
        appointment.Should().NotBeNull();
        appointment!.Status.Should().Be(AppointmentStatus.Booked);

        var upcoming = await client.GetFromJsonAsync<List<AppointmentDto>>("/api/appointments?scope=upcoming", _json);
        upcoming.Should().NotBeNull();
        upcoming!.Any(a => a.Id == appointment.Id).Should().BeTrue();

        var cancel = await client.DeleteAsync($"/api/appointments/{appointment.Id}");
        cancel.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var upcomingAfter = await client.GetFromJsonAsync<List<AppointmentDto>>("/api/appointments?scope=upcoming", _json);
        upcomingAfter!.Any(a => a.Id == appointment.Id).Should().BeFalse();
    }

    [Fact]
    public async Task Double_book_same_slot_returns_409()
    {
        var (clientA, petA) = await CreateAuthenticatedUserWithPetAsync("double-a");
        var (clientB, petB) = await CreateAuthenticatedUserWithPetAsync("double-b");
        var (vetId, serviceId, slotId) = await SeedBookableAsync();

        var firstBooking = await clientA.PostAsJsonAsync("/api/appointments",
            new CreateAppointmentRequest { PetId = petA, VetId = vetId, ServiceId = serviceId, SlotId = slotId },
            _json);
        firstBooking.EnsureSuccessStatusCode();

        var secondBooking = await clientB.PostAsJsonAsync("/api/appointments",
            new CreateAppointmentRequest { PetId = petB, VetId = vetId, ServiceId = serviceId, SlotId = slotId },
            _json);
        secondBooking.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }
}
