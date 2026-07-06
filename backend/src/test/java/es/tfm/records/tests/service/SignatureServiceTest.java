package es.tfm.records.tests.service;

import es.tfm.records.application.service.SignatureService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.jodconverter.core.DocumentConverter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SignatureServiceTest {

    @Mock
    private DocumentConverter documentConverter;

    private SignatureService signatureService;

    @BeforeEach
    void setUp() throws Exception {
        signatureService = new SignatureService(documentConverter, "changeit");
    }

    @Test
    void computeDigest_shouldReturnSha256HexDigest() throws Exception {
        byte[] content = "Test document content".getBytes();
        String digest = signatureService.computeDigest(content);

        assertNotNull(digest);
        assertEquals(64, digest.length()); // SHA-256 produces 64 hex characters
        assertTrue(digest.matches("[0-9a-f]+"));
    }

    @Test
    void computeDigest_shouldReturnConsistentDigestForSameContent() throws Exception {
        byte[] content = "Consistent content".getBytes();
        String digest1 = signatureService.computeDigest(content);
        String digest2 = signatureService.computeDigest(content);

        assertEquals(digest1, digest2);
    }

    @Test
    void computeDigest_shouldReturnDifferentDigestForDifferentContent() throws Exception {
        byte[] content1 = "Content A".getBytes();
        byte[] content2 = "Content B".getBytes();

        String digest1 = signatureService.computeDigest(content1);
        String digest2 = signatureService.computeDigest(content2);

        assertNotEquals(digest1, digest2);
    }

    @Test
    void signDocument_shouldReturnSignedPdf() throws Exception {
        // Create a minimal valid PDF structure for testing
        byte[] pdfContent = createMinimalPdf();

        byte[] signedContent = signatureService.signDocument(pdfContent);

        assertNotNull(signedContent);
        assertTrue(signedContent.length > pdfContent.length); // Signed PDF should be larger
    }

    @Test
    void verifySignature_shouldReturnTrueForSignedDocument() throws Exception {
        byte[] pdfContent = createMinimalPdf();
        byte[] signedContent = signatureService.signDocument(pdfContent);

        boolean isValid = signatureService.verifySignature(signedContent);

        assertTrue(isValid);
    }

    @Test
    void verifySignature_shouldReturnFalseForUnsignedDocument() {
        byte[] pdfContent = createMinimalPdf();

        boolean isValid = signatureService.verifySignature(pdfContent);

        assertFalse(isValid);
    }

    @Test
    void getSigningCertificateSubject_shouldReturnServiceCertificate() {
        String subject = signatureService.getSigningCertificateSubject();

        assertNotNull(subject);
        assertTrue(subject.contains("TFG Service Signing"));
    }

    private byte[] createMinimalPdf() {
        // Minimal PDF structure for testing
        return ("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n115\n%%EOF").getBytes();
    }

    private byte[] createMinimalPdfWithCrLf() {
        return ("%PDF-1.4\r\n1 0 obj\r\n<< /Type /Catalog /Pages 2 0 R >>\r\nendobj\r\n2 0 obj\r\n<< /Type /Pages /Kids [] /Count 0 >>\r\nendobj\r\nxref\r\n0 3\r\n0000000000 65535 f \r\n0000000009 00000 n \r\n0000000058 00000 n \r\ntrailer\r\n<< /Size 3 /Root 1 0 R >>\r\nstartxref\r\n115\r\n%%EOF").getBytes();
    }

    @Test
    void signDocument_shouldWorkWithCrLfLineEndings() throws Exception {
        byte[] pdfContent = createMinimalPdfWithCrLf();

        byte[] signedContent = signatureService.signDocument(pdfContent);

        assertNotNull(signedContent);
        assertTrue(signedContent.length > pdfContent.length);
    }

    @Test
    void verifySignature_shouldValidateCrLfPdf() throws Exception {
        byte[] pdfContent = createMinimalPdfWithCrLf();
        byte[] signedContent = signatureService.signDocument(pdfContent);

        boolean isValid = signatureService.verifySignature(signedContent);

        assertTrue(isValid);
    }
}
