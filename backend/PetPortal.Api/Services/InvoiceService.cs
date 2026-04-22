using Microsoft.EntityFrameworkCore;
using PetPortal.Api.Data;
using PetPortal.Api.Errors;
using PetPortal.Api.Pdf;
using QuestPDF.Fluent;

namespace PetPortal.Api.Services;

public class InvoiceService : IInvoiceService
{
    private readonly PetPortalDbContext _db;

    public InvoiceService(PetPortalDbContext db)
    {
        _db = db;
    }

    public async Task<(byte[] Bytes, string FileName)> GetInvoicePdfAsync(Guid appointmentId, Guid userId, CancellationToken cancellationToken)
    {
        var appointment = await _db.Appointments
            .Include(a => a.User)
            .Include(a => a.Pet)
            .Include(a => a.Vet)
            .Include(a => a.Service)
            .Include(a => a.Slot)
            .Include(a => a.Invoice)
            .FirstOrDefaultAsync(a => a.Id == appointmentId && a.UserId == userId, cancellationToken);

        if (appointment is null)
        {
            throw new NotFoundException("Appointment not found.");
        }

        var invoice = appointment.Invoice
            ?? throw new NotFoundException("Invoice not found for this appointment.");

        var data = new InvoicePdfData(
            invoice.Number,
            appointment.Id,
            $"{appointment.User.FirstName} {appointment.User.LastName}",
            appointment.User.Address,
            appointment.Pet.Name,
            $"{appointment.Vet.FirstName} {appointment.Vet.LastName}",
            appointment.Service.Name,
            appointment.Service.DurationMinutes,
            appointment.Service.Price,
            appointment.Slot.StartTime,
            invoice.Amount,
            invoice.IssuedAt);

        var bytes = new InvoicePdfDocument(data).GeneratePdf();
        bytes = PdfPostProcessor.AddLanguage(bytes, "en");
        return (bytes, $"{invoice.Number}.pdf");
    }
}
