using PetPortal.Api.Dtos;

namespace PetPortal.Api.Services;

public interface IBookingService
{
    Task<AppointmentDto> CreateAsync(Guid userId, CreateAppointmentRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<AppointmentDto>> ListAsync(Guid userId, string scope, CancellationToken cancellationToken);
    Task CancelAsync(Guid userId, Guid appointmentId, CancellationToken cancellationToken);
}
