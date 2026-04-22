namespace PetPortal.Api.Services;

public interface IInvoiceService
{
    Task<(byte[] Bytes, string FileName)> GetInvoicePdfAsync(Guid appointmentId, Guid userId, CancellationToken cancellationToken);
}
