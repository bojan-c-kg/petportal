using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.IO;

namespace PetPortal.Api.Pdf;

public static class PdfPostProcessor
{
    public static byte[] AddLanguage(byte[] pdfBytes, string language)
    {
        using var inputStream = new MemoryStream(pdfBytes);
        var document = PdfReader.Open(inputStream, PdfDocumentOpenMode.Modify);
        document.Language = language;
        using var outputStream = new MemoryStream();
        document.Save(outputStream, false);
        return outputStream.ToArray();
    }
}
