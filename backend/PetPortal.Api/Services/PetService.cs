using Microsoft.EntityFrameworkCore;
using PetPortal.Api.Data;
using PetPortal.Api.Data.Entities;
using PetPortal.Api.Dtos;
using PetPortal.Api.Errors;
using PetPortal.Api.Extensions;

namespace PetPortal.Api.Services;

public class PetService : IPetService
{
    private readonly PetPortalDbContext _db;
    private readonly TimeProvider _time;

    public PetService(PetPortalDbContext db, TimeProvider time)
    {
        _db = db;
        _time = time;
    }

    public async Task<IReadOnlyList<PetDto>> ListAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _db.Pets
            .Where(p => p.UserId == userId)
            .OrderBy(p => p.Name)
            .Select(p => new PetDto(p.Id, p.Name, p.Species, p.Breed, p.DateOfBirth, p.Notes))
            .ToListAsync(cancellationToken);
    }

    public async Task<PetDto> CreateAsync(Guid userId, CreatePetRequest request, CancellationToken cancellationToken)
    {
        var pet = new Pet
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name.Trim(),
            Species = request.Species,
            Breed = request.Breed?.Trim(),
            DateOfBirth = request.DateOfBirth,
            Notes = request.Notes?.Trim(),
        };

        _db.Pets.Add(pet);
        await _db.SaveChangesAsync(cancellationToken);
        return pet.ToPetDto();
    }

    public async Task<PetDetailDto> GetDetailAsync(Guid userId, Guid petId, CancellationToken cancellationToken)
    {
        var pet = await _db.Pets
            .Include(p => p.Vaccinations)
            .Include(p => p.Conditions)
            .FirstOrDefaultAsync(p => p.Id == petId && p.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Pet not found.");
        return pet.ToPetDetailDto();
    }

    public async Task<PetDto> UpdateAsync(Guid userId, Guid petId, UpdatePetRequest request, CancellationToken cancellationToken)
    {
        var pet = await _db.Pets.FirstOrDefaultAsync(p => p.Id == petId && p.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Pet not found.");

        pet.Name = request.Name.Trim();
        pet.Species = request.Species;
        pet.Breed = request.Breed?.Trim();
        pet.DateOfBirth = request.DateOfBirth;
        pet.Notes = request.Notes?.Trim();

        await _db.SaveChangesAsync(cancellationToken);
        return pet.ToPetDto();
    }

    public async Task DeleteAsync(Guid userId, Guid petId, CancellationToken cancellationToken)
    {
        var pet = await _db.Pets.FirstOrDefaultAsync(p => p.Id == petId && p.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Pet not found.");

        var now = _time.GetUtcNow().UtcDateTime;
        var hasFutureBooked = await _db.Appointments.AnyAsync(
            a => a.PetId == petId
                 && a.Status == AppointmentStatus.Booked
                 && a.Slot.StartTime > now,
            cancellationToken);
        if (hasFutureBooked)
        {
            throw new ConflictException("Cannot delete a pet with upcoming appointments.");
        }

        _db.Pets.Remove(pet);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
