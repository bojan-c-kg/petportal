using PetPortal.Api.Dtos;

namespace PetPortal.Api.Services;

public interface IPetService
{
    Task<IReadOnlyList<PetDto>> ListAsync(Guid userId, CancellationToken cancellationToken);
    Task<PetDto> CreateAsync(Guid userId, CreatePetRequest request, CancellationToken cancellationToken);
    Task<PetDetailDto> GetDetailAsync(Guid userId, Guid petId, CancellationToken cancellationToken);
    Task<PetDto> UpdateAsync(Guid userId, Guid petId, UpdatePetRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid userId, Guid petId, CancellationToken cancellationToken);
}
