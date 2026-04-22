using Microsoft.EntityFrameworkCore;
using PetPortal.Api.Data;
using PetPortal.Api.Data.Entities;
using PetPortal.Api.Dtos;
using PetPortal.Api.Errors;
using PetPortal.Api.Extensions;

namespace PetPortal.Api.Services;

public class BookingService : IBookingService
{
    private readonly PetPortalDbContext _db;
    private readonly TimeProvider _time;

    public BookingService(PetPortalDbContext db, TimeProvider time)
    {
        _db = db;
        _time = time;
    }

    public async Task<AppointmentDto> CreateAsync(Guid userId, CreateAppointmentRequest request, CancellationToken cancellationToken)
    {
        var pet = await _db.Pets.FirstOrDefaultAsync(p => p.Id == request.PetId && p.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Pet not found.");

        var vet = await _db.Vets.FirstOrDefaultAsync(v => v.Id == request.VetId, cancellationToken)
            ?? throw new NotFoundException("Vet not found.");

        var service = await _db.Services.FirstOrDefaultAsync(s => s.Id == request.ServiceId, cancellationToken)
            ?? throw new NotFoundException("Service not found.");

        var vetProvidesService = await _db.VetServices.AnyAsync(
            vs => vs.VetId == request.VetId && vs.ServiceId == request.ServiceId, cancellationToken);
        if (!vetProvidesService)
        {
            throw new ConflictException("The selected vet does not provide the selected service.");
        }

        var slot = await _db.AvailabilitySlots.FirstOrDefaultAsync(s => s.Id == request.SlotId, cancellationToken)
            ?? throw new NotFoundException("Slot not found.");

        if (slot.VetId != request.VetId)
        {
            throw new ConflictException("Slot does not belong to the selected vet.");
        }
        if (slot.IsBooked)
        {
            throw new ConflictException("Slot has already been booked.");
        }

        var now = _time.GetUtcNow().UtcDateTime;
        if (slot.StartTime <= now)
        {
            throw new ConflictException("Cannot book a slot in the past.");
        }

        slot.IsBooked = true;
        var appointment = new Appointment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PetId = pet.Id,
            VetId = vet.Id,
            ServiceId = service.Id,
            SlotId = slot.Id,
            Status = AppointmentStatus.Booked,
            CreatedAt = now,
            Pet = pet,
            Vet = vet,
            Service = service,
            Slot = slot,
        };
        _db.Appointments.Add(appointment);

        var nextInvoiceSequence = await _db.Invoices.CountAsync(cancellationToken) + 1;
        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            Number = $"INV-{nextInvoiceSequence:D3}",
            AppointmentId = appointment.Id,
            Amount = service.Price,
            IssuedAt = now,
            Appointment = appointment,
        };
        _db.Invoices.Add(invoice);
        appointment.Invoice = invoice;

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("Slot has already been booked.");
        }

        return appointment.ToAppointmentDto();
    }

    public async Task<IReadOnlyList<AppointmentDto>> ListAsync(Guid userId, string scope, CancellationToken cancellationToken)
    {
        var now = _time.GetUtcNow().UtcDateTime;
        var baseQuery = _db.Appointments
            .Include(a => a.Pet)
            .Include(a => a.Vet)
            .Include(a => a.Service)
            .Include(a => a.Slot)
            .Include(a => a.Invoice)
            .Where(a => a.UserId == userId);

        var isUpcoming = string.Equals(scope, "upcoming", StringComparison.OrdinalIgnoreCase);
        var results = isUpcoming
            ? await baseQuery
                .Where(a => a.Status == AppointmentStatus.Booked && a.Slot.StartTime >= now)
                .OrderBy(a => a.Slot.StartTime)
                .ToListAsync(cancellationToken)
            : await baseQuery
                .Where(a => a.Status != AppointmentStatus.Booked || a.Slot.StartTime < now)
                .OrderByDescending(a => a.Slot.StartTime)
                .ToListAsync(cancellationToken);

        return results.Select(a => a.ToAppointmentDto()).ToList();
    }

    public async Task CancelAsync(Guid userId, Guid appointmentId, CancellationToken cancellationToken)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Slot)
            .FirstOrDefaultAsync(a => a.Id == appointmentId && a.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Appointment not found.");

        if (appointment.Status != AppointmentStatus.Booked)
        {
            throw new ConflictException("Only booked appointments can be cancelled.");
        }

        var now = _time.GetUtcNow().UtcDateTime;
        if (appointment.Slot.StartTime <= now)
        {
            throw new ConflictException("Cannot cancel an appointment that has already started.");
        }

        appointment.Status = AppointmentStatus.Cancelled;
        appointment.Slot.IsBooked = false;
        await _db.SaveChangesAsync(cancellationToken);
    }
}
