using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetPortal.Api.Auth;
using PetPortal.Api.Dtos;
using PetPortal.Api.Services;

namespace PetPortal.Api.Endpoints;

[ApiController]
[Authorize]
[Route("api/pets")]
public class PetsController : ControllerBase
{
    private readonly IPetService _pets;
    private readonly ICurrentUserAccessor _currentUser;

    public PetsController(IPetService pets, ICurrentUserAccessor currentUser)
    {
        _pets = pets;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PetDto>>> List(CancellationToken cancellationToken)
    {
        var pets = await _pets.ListAsync(_currentUser.UserId, cancellationToken);
        return Ok(pets);
    }

    [HttpPost]
    public async Task<ActionResult<PetDto>> Create([FromBody] CreatePetRequest request, CancellationToken cancellationToken)
    {
        var pet = await _pets.CreateAsync(_currentUser.UserId, request, cancellationToken);
        return CreatedAtAction(nameof(GetDetail), new { id = pet.Id }, pet);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PetDetailDto>> GetDetail(Guid id, CancellationToken cancellationToken)
    {
        var pet = await _pets.GetDetailAsync(_currentUser.UserId, id, cancellationToken);
        return Ok(pet);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PetDto>> Update(Guid id, [FromBody] UpdatePetRequest request, CancellationToken cancellationToken)
    {
        var pet = await _pets.UpdateAsync(_currentUser.UserId, id, request, cancellationToken);
        return Ok(pet);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _pets.DeleteAsync(_currentUser.UserId, id, cancellationToken);
        return NoContent();
    }
}
