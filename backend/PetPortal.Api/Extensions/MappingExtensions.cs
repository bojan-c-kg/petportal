using PetPortal.Api.Data.Entities;
using PetPortal.Api.Dtos;

namespace PetPortal.Api.Extensions;

public static class MappingExtensions
{
    public static MeResponse ToMeResponse(this User user) =>
        new(user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.Address);

    public static PetDto ToPetDto(this Pet pet) =>
        new(pet.Id, pet.Name, pet.Species, pet.Breed, pet.DateOfBirth, pet.Notes);

    public static VaccinationDto ToVaccinationDto(this Vaccination vaccination) =>
        new(vaccination.Id, vaccination.Name, vaccination.DateAdministered, vaccination.NextDueDate);

    public static ConditionDto ToConditionDto(this Condition condition) =>
        new(condition.Id, condition.Name, condition.DiagnosedDate, condition.Notes);

    public static PetDetailDto ToPetDetailDto(this Pet pet) =>
        new(
            pet.Id,
            pet.Name,
            pet.Species,
            pet.Breed,
            pet.DateOfBirth,
            pet.Notes,
            pet.Vaccinations.OrderByDescending(v => v.DateAdministered).Select(v => v.ToVaccinationDto()).ToList(),
            pet.Conditions.OrderByDescending(c => c.DiagnosedDate).Select(c => c.ToConditionDto()).ToList());

    public static AppointmentDto ToAppointmentDto(this Appointment appointment) =>
        new(
            appointment.Id,
            appointment.PetId,
            appointment.Pet.Name,
            appointment.VetId,
            $"{appointment.Vet.FirstName} {appointment.Vet.LastName}",
            appointment.ServiceId,
            appointment.Service.Name,
            appointment.SlotId,
            appointment.Slot.StartTime,
            appointment.Slot.EndTime,
            appointment.Status,
            appointment.CreatedAt,
            appointment.Invoice?.Number ?? string.Empty);
}
