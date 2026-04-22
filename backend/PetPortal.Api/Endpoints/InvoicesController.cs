using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetPortal.Api.Auth;
using PetPortal.Api.Services;

namespace PetPortal.Api.Endpoints;

[ApiController]
[Authorize]
[Route("api/appointments")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoices;
    private readonly ICurrentUserAccessor _currentUser;

    public InvoicesController(IInvoiceService invoices, ICurrentUserAccessor currentUser)
    {
        _invoices = invoices;
        _currentUser = currentUser;
    }

    [HttpGet("{id:guid}/invoice.pdf")]
    public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
    {
        var (bytes, fileName) = await _invoices.GetInvoicePdfAsync(id, _currentUser.UserId, cancellationToken);
        return File(bytes, "application/pdf", fileName);
    }
}
