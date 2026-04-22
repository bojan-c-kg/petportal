using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace PetPortal.Api.Pdf;

public class InvoicePdfDocument : IDocument
{
    private const string ClinicName = "PetPortal Veterinary Clinic";
    private const string ClinicAddress = "123 Example Street";

    private readonly InvoicePdfData _data;

    public InvoicePdfDocument(InvoicePdfData data)
    {
        _data = data;
    }

    public DocumentMetadata GetMetadata() => new()
    {
        Title = $"Invoice {_data.InvoiceNumber}",
        Author = "PetPortal",
        Subject = "Invoice",
    };

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(40);
            page.DefaultTextStyle(x => x.FontSize(11));

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeContent);
            page.Footer().AlignCenter().Text(text =>
            {
                text.Span("Page ");
                text.CurrentPageNumber();
                text.Span(" of ");
                text.TotalPages();
            });
        });
    }

    private static void ComposeHeader(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().Text(ClinicName).FontSize(18).SemiBold();
            column.Item().Text(ClinicAddress);
        });
    }

    private void ComposeContent(IContainer container)
    {
        container.PaddingVertical(20).Column(column =>
        {
            column.Spacing(8);

            column.Item().Text($"Invoice {_data.InvoiceNumber}").FontSize(14).SemiBold();
            column.Item().Text($"Issued: {_data.IssuedAt:yyyy-MM-dd}");

            column.Item().PaddingTop(10).Text("Bill To").SemiBold();
            column.Item().Text(_data.CustomerName);
            column.Item().Text(_data.CustomerAddress);

            column.Item().PaddingTop(10).Text("Appointment").SemiBold();
            column.Item().Text($"Pet: {_data.PetName}");
            column.Item().Text($"Vet: {_data.VetName}");
            column.Item().Text($"When: {_data.AppointmentStartTime:yyyy-MM-dd HH:mm} UTC");

            column.Item().PaddingTop(10).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3);
                    columns.RelativeColumn();
                    columns.RelativeColumn();
                });

                table.Header(header =>
                {
                    header.Cell().Text("Service").SemiBold();
                    header.Cell().AlignRight().Text("Duration").SemiBold();
                    header.Cell().AlignRight().Text("Price").SemiBold();
                });

                table.Cell().Text(_data.ServiceName);
                table.Cell().AlignRight().Text($"{_data.DurationMinutes} min");
                table.Cell().AlignRight().Text($"${_data.ServicePrice:F2}");
            });

            column.Item().PaddingTop(10).AlignRight().Text($"Total: ${_data.Amount:F2}").FontSize(13).SemiBold();
        });
    }
}
