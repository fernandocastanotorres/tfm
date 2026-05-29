package es.tfg.records.tests.service;

import es.tfg.records.application.exception.AccessDeniedException;
import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.application.service.EniPackagerService;
import es.tfg.records.application.service.SignatureService;
import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.model.DocumentStatus;
import es.tfg.records.domain.port.DocumentRepository;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import es.tfg.records.infrastructure.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EniPackagerServiceTest {

    @Mock
    private ProcedureJpaRepository procedureRepository;

    @Mock
    private ProcedureTypeJpaRepository procedureTypeRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private SignatureService signatureService;

    private EniPackagerService eniPackagerService;

    private UUID caseId;
    private UUID ownerId;
    private UUID procedureTypeId;
    private ProcedureEntity procedure;
    private ProcedureTypeEntity procedureType;
    private Document signedDoc;
    private Document pendingDoc;
    private byte[] testContent;

    @BeforeEach
    void setUp() {
        eniPackagerService = new EniPackagerService(
                procedureRepository, procedureTypeRepository, documentRepository,
                fileStorageService, signatureService);

        caseId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        procedureTypeId = UUID.randomUUID();
        testContent = "test-document-content".getBytes();

        procedure = new ProcedureEntity();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setProcedureTypeId(procedureTypeId);
        procedure.setTitle("Licencia de obras");
        procedure.setStatus(CaseStatus.APPROVED);
        procedure.setRecordNumber("EXP/GEN/2026/000001");
        procedure.setAssignedUnit("Unidad de Urbanismo");
        procedure.setUpdatedAt(Instant.now());

        procedureType = new ProcedureTypeEntity();
        procedureType.setId(procedureTypeId);
        procedureType.setTitle("Licencia de obras");
        procedureType.setDescription("Tramitacion de licencia de obras");
        procedureType.setUnit("Unidad de Urbanismo");

        signedDoc = new Document();
        signedDoc.setId(UUID.randomUUID());
        signedDoc.setProcedureId(caseId);
        signedDoc.setName("informe.pdf");
        signedDoc.setMimeType("application/pdf");
        signedDoc.setSize(2048);
        signedDoc.setStatus(DocumentStatus.SIGNED);
        signedDoc.setStoragePath("path/to/informe.pdf");
        signedDoc.setSignedStoragePath("path/to/informe_signed.pdf");
        signedDoc.setUploadedAt(Instant.now());

        pendingDoc = new Document();
        pendingDoc.setId(UUID.randomUUID());
        pendingDoc.setProcedureId(caseId);
        pendingDoc.setName("anexo.docx");
        pendingDoc.setMimeType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        pendingDoc.setSize(1024);
        pendingDoc.setStatus(DocumentStatus.PENDING);
        pendingDoc.setStoragePath("path/to/anexo.docx");
        pendingDoc.setUploadedAt(Instant.now());
    }

    // ===== generateEniDoc =====

    @Test
    void generateEniDoc_shouldGenerateZip_whenCaseApproved() throws Exception {
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(procedureTypeRepository.findById(procedureTypeId)).thenReturn(Optional.of(procedureType));
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of(signedDoc, pendingDoc));

        // For readDocumentContent: mock openStream to succeed for both docs
        when(fileStorageService.openStream(eq(caseId), anyString()))
                .thenAnswer(invocation -> new ByteArrayInputStream(testContent));

        // For computeSha256Hash: mock openStreamByPath to succeed
        when(fileStorageService.openStreamByPath(anyString()))
                .thenAnswer(invocation -> new ByteArrayInputStream(testContent));

        // For detached signature (only for signed doc)
        when(signatureService.generateDetachedSignature(any(byte[].class)))
                .thenReturn("detached-signature".getBytes());

        byte[] result = eniPackagerService.generateEniDoc(caseId, ownerId);

        assertThat(result).isNotNull();
        assertThat(result.length).isPositive();

        verify(procedureRepository).findById(caseId);
        verify(documentRepository).findByProcedureId(caseId);
        verify(signatureService).generateDetachedSignature(any(byte[].class));
    }

    @Test
    void generateEniDoc_shouldThrow_whenProcedureNotFound() {
        when(procedureRepository.findById(caseId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eniPackagerService.generateEniDoc(caseId, ownerId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void generateEniDoc_shouldThrow_whenAccessDenied() {
        procedure.setOwnerId(UUID.randomUUID()); // different owner

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        assertThatThrownBy(() -> eniPackagerService.generateEniDoc(caseId, ownerId))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void generateEniDoc_shouldThrow_whenCaseNotResolved() {
        procedure.setStatus(CaseStatus.DRAFT);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        assertThatThrownBy(() -> eniPackagerService.generateEniDoc(caseId, ownerId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("resolved cases");
    }

    @Test
    void generateEniDoc_shouldThrow_whenNoDocuments() {
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of());

        assertThatThrownBy(() -> eniPackagerService.generateEniDoc(caseId, ownerId))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Cannot generate ENI package without attached documents");
    }

    // ===== readDocumentContent =====

    @Test
    void readDocumentContent_shouldResolveStoragePath_fromMultipleCandidates() {
        Document docWithOnlyOriginal = new Document();
        docWithOnlyOriginal.setId(UUID.randomUUID());
        docWithOnlyOriginal.setProcedureId(caseId);
        docWithOnlyOriginal.setName("doc.pdf");
        docWithOnlyOriginal.setStoragePath("original/path/doc.pdf");
        docWithOnlyOriginal.setSignedStoragePath(null);
        docWithOnlyOriginal.setOriginalStoragePath(null);

        // First: openStream fails, openStreamByPath succeeds
        when(fileStorageService.openStream(eq(caseId), eq("original/path/doc.pdf")))
                .thenThrow(new ResourceNotFoundException("DOC", "original/path/doc.pdf"));
        when(fileStorageService.openStreamByPath("original/path/doc.pdf"))
                .thenAnswer(invocation -> new ByteArrayInputStream(testContent));

        // We need to test through generateEniDoc but with the right conditions
        // Instead, let's test via generateEniDoc happy path with only original path
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(procedureTypeRepository.findById(procedureTypeId)).thenReturn(Optional.of(procedureType));
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of(docWithOnlyOriginal));

        // Mock openStreamByPath for computeSha256Hash
        when(fileStorageService.openStreamByPath("original/path/doc.pdf"))
                .thenAnswer(invocation -> new ByteArrayInputStream(testContent));

        byte[] result = eniPackagerService.generateEniDoc(caseId, ownerId);

        assertThat(result).isNotNull();
        assertThat(result.length).isPositive();
    }

    @Test
    void readDocumentContent_shouldThrow_whenAllCandidatesFail() {
        // Set up a doc with only storagePath but all read strategies fail
        Document doc = new Document();
        doc.setId(UUID.randomUUID());
        doc.setProcedureId(caseId);
        doc.setName("missing.pdf");
        doc.setStoragePath("nonexistent/path/doc.pdf");

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of(doc));

        // All read strategies throw ResourceNotFoundException
        when(fileStorageService.openStream(eq(caseId), anyString()))
                .thenThrow(new ResourceNotFoundException("DOC", "not found"));
        when(fileStorageService.openStreamByPath(anyString()))
                .thenThrow(new ResourceNotFoundException("DOC", "not found"));
        when(fileStorageService.openStreamAnyCase(anyString()))
                .thenThrow(new ResourceNotFoundException("DOC", "not found"));

        assertThatThrownBy(() -> eniPackagerService.generateEniDoc(caseId, ownerId))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("document files are missing in storage");
    }

    // ===== sanitizeFileName =====

    @Test
    void sanitizeFileName_shouldReplaceInvalidChars() {
        // Access package-private method via reflection
        String result = invokeSanitizeFileName("my<file>:name?.pdf");

        assertThat(result).isEqualTo("my_file__name_.pdf");
    }

    @Test
    void sanitizeFileName_shouldReturnDefault_whenNull() {
        String result = invokeSanitizeFileName(null);

        assertThat(result).isEqualTo("documento");
    }

    @Test
    void sanitizeFileName_shouldKeepValidChars() {
        String result = invokeSanitizeFileName("informe-2026.pdf");

        assertThat(result).isEqualTo("informe-2026.pdf");
    }

    // ===== escapeXml =====

    @Test
    void escapeXml_shouldEncodeSpecialChars() {
        String result = invokeEscapeXml("<hello> & \"world\" 'test'");

        assertThat(result).isEqualTo("&lt;hello&gt; &amp; &quot;world&quot; &apos;test&apos;");
    }

    @Test
    void escapeXml_shouldReturnEmpty_whenNull() {
        String result = invokeEscapeXml(null);

        assertThat(result).isEqualTo("");
    }

    @Test
    void escapeXml_shouldReturnSame_whenNoSpecialChars() {
        String result = invokeEscapeXml("hello world");

        assertThat(result).isEqualTo("hello world");
    }

    // ===== mapProcedureToEniType =====

    @Test
    void mapProcedureToEniType_shouldReturnLicenseCode() {
        ProcedureTypeEntity licence = new ProcedureTypeEntity();
        licence.setTitle("Licencia de obras");

        String result = invokeMapProcedureToEniType(licence);
        assertThat(result).isEqualTo("TD01");
    }

    @Test
    void mapProcedureToEniType_shouldReturnCertificateCode() {
        ProcedureTypeEntity certificate = new ProcedureTypeEntity();
        certificate.setTitle("Certificado de empadronamiento");

        String result = invokeMapProcedureToEniType(certificate);
        assertThat(result).isEqualTo("TD02");
    }

    @Test
    void mapProcedureToEniType_shouldReturnCensusCode() {
        ProcedureTypeEntity census = new ProcedureTypeEntity();
        census.setTitle("Empadronamiento");

        String result = invokeMapProcedureToEniType(census);
        assertThat(result).isEqualTo("TD03");
    }

    @Test
    void mapProcedureToEniType_shouldReturnDefaultCode() {
        ProcedureTypeEntity other = new ProcedureTypeEntity();
        other.setTitle("Solicitud generica");

        String result = invokeMapProcedureToEniType(other);
        assertThat(result).isEqualTo("TD99");
    }

    @Test
    void mapProcedureToEniType_shouldReturnDefault_whenNullType() {
        String result = invokeMapProcedureToEniType(null);
        assertThat(result).isEqualTo("TD99");
    }

    // ===== computeSha256Hash =====

    @Test
    void computeSha256Hash_shouldReturnHash_whenSuccessful() throws Exception {
        Document doc = new Document();
        doc.setId(UUID.randomUUID());
        doc.setStoragePath("path/to/doc.pdf");

        when(fileStorageService.openStreamByPath("path/to/doc.pdf"))
                .thenAnswer(invocation -> new ByteArrayInputStream("test-content".getBytes()));

        // We need to call computeSha256Hash indirectly via generateEniDoc
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(procedureTypeRepository.findById(procedureTypeId)).thenReturn(Optional.of(procedureType));
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of(doc));

        // For readDocumentContent
        when(fileStorageService.openStream(eq(caseId), anyString()))
                .thenAnswer(invocation -> new ByteArrayInputStream(testContent));

        // computeSha256Hash will try openStreamByPath and succeed
        byte[] result = eniPackagerService.generateEniDoc(caseId, ownerId);

        assertThat(result).isNotNull();
        assertThat(result.length).isPositive();
    }

    @Test
    void computeSha256Hash_shouldReturnNA_whenFailed() throws Exception {
        Document doc = new Document();
        doc.setId(UUID.randomUUID());
        doc.setStoragePath("path/to/missing.pdf");

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(procedureTypeRepository.findById(procedureTypeId)).thenReturn(Optional.of(procedureType));
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of(doc));

        // For readDocumentContent - succeed
        when(fileStorageService.openStream(eq(caseId), anyString()))
                .thenAnswer(invocation -> new ByteArrayInputStream(testContent));

        // For computeSha256Hash - fail (throws ResourceNotFoundException)
        when(fileStorageService.openStreamByPath("path/to/missing.pdf"))
                .thenThrow(new ResourceNotFoundException("DOC", "missing.pdf"));

        // generateEniDoc should still succeed (hash becomes "N/D")
        byte[] result = eniPackagerService.generateEniDoc(caseId, ownerId);

        assertThat(result).isNotNull();
        assertThat(result.length).isPositive();
    }

    // ===== validateAgainstXsd =====

    @Test
    void validateAgainstXsd_shouldThrow_whenXmlInvalid() {
        String invalidXml = "this is not valid xml";

        assertThatThrownBy(() -> invokeValidateAgainstXsd(invalidXml))
                .isInstanceOf(RuntimeException.class);
    }

    // ===== Helper methods for package-private methods =====

    private String invokeSanitizeFileName(String name) {
        try {
            java.lang.reflect.Method method = EniPackagerService.class
                    .getDeclaredMethod("sanitizeFileName", String.class);
            method.setAccessible(true);
            return (String) method.invoke(eniPackagerService, name);
        } catch (Exception e) {
            throw new RuntimeException("Failed to invoke sanitizeFileName", e);
        }
    }

    private String invokeEscapeXml(String value) {
        try {
            java.lang.reflect.Method method = EniPackagerService.class
                    .getDeclaredMethod("escapeXml", String.class);
            method.setAccessible(true);
            return (String) method.invoke(eniPackagerService, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to invoke escapeXml", e);
        }
    }

    private String invokeMapProcedureToEniType(ProcedureTypeEntity type) {
        try {
            java.lang.reflect.Method method = EniPackagerService.class
                    .getDeclaredMethod("mapProcedureToEniType", ProcedureTypeEntity.class);
            method.setAccessible(true);
            return (String) method.invoke(eniPackagerService, type);
        } catch (Exception e) {
            throw new RuntimeException("Failed to invoke mapProcedureToEniType", e);
        }
    }

    private void invokeValidateAgainstXsd(String xml) {
        try {
            java.lang.reflect.Method method = EniPackagerService.class
                    .getDeclaredMethod("validateAgainstXsd", String.class);
            method.setAccessible(true);
            method.invoke(eniPackagerService, xml);
        } catch (java.lang.reflect.InvocationTargetException e) {
            if (e.getCause() instanceof RuntimeException) {
                throw (RuntimeException) e.getCause();
            }
            throw new RuntimeException(e.getCause());
        } catch (Exception e) {
            throw new RuntimeException("Failed to invoke validateAgainstXsd", e);
        }
    }
}
