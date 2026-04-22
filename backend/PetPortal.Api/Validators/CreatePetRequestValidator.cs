using FluentValidation;
using PetPortal.Api.Dtos;

namespace PetPortal.Api.Validators;

public class CreatePetRequestValidator : AbstractValidator<CreatePetRequest>
{
    public CreatePetRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Species).IsInEnum();
        RuleFor(x => x.Breed).MaximumLength(100);
        RuleFor(x => x.Notes).MaximumLength(1000);
    }
}
