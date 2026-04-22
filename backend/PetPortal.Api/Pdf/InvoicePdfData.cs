namespace PetPortal.Api.Pdf;

public record InvoicePdfData(
    string InvoiceNumber,
    Guid AppointmentId,
    string CustomerName,
    string CustomerAddress,
    string PetName,
    string VetName,
    string ServiceName,
    int DurationMinutes,
    decimal ServicePrice,
    DateTime AppointmentStartTime,
    decimal Amount,
    DateTime IssuedAt);
