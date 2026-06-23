package es.tfm.records.tests.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfm.records.application.service.PublicSignatureVerificationService;
import es.tfm.records.application.service.RegistryService;
import es.tfm.records.application.service.SignatureService;
import es.tfm.records.application.service.SummaryDocumentService;
import es.tfm.records.domain.model.Document;
import es.tfm.records.domain.model.Procedure;
import es.tfm.records.domain.port.DocumentRepository;
import es.tfm.records.domain.port.ProcedureTypeRepository;
import es.tfm.records.infrastructure.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SummaryDocumentServiceTest {

    @Mock
    private ProcedureTypeRepository procedureTypeRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private SignatureService signatureService;

    @Mock
    private PublicSignatureVerificationService publicSignatureVerificationService;

    @Mock
    private RegistryService registryService;

    private ObjectMapper objectMapper;

    private SummaryDocumentService service;

    private UUID procedureId;
    private Procedure procedure;
    private Document existingDoc;
    private byte[] signedBytes;
    private String storagePath;
    private String exitNumber;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        service = new SummaryDocumentService(
                procedureTypeRepository, documentRepository, fileStorageService,
                signatureService, publicSignatureVerificationService, registryService, objectMapper);

        procedureId = UUID.randomUUID();
        procedure = new Procedure();
        procedure.setId(procedureId);
        procedure.setTitle("Test Procedure");
        procedure.setUnitCode("TEST");
        procedure.setEntryNumber("RE/TEST/2026/000001");
        procedure.setSubmittedAt(Instant.now());

        existingDoc = new Document();
        existingDoc.setId(UUID.randomUUID());
        existingDoc.setProcedureId(procedureId);
        existingDoc.setName("attachment.pdf");
        existingDoc.setSize(1024);
        existingDoc.setGenerated(false);
        existingDoc.setExitNumber("RS/TEST/2026/000001");

        signedBytes = "signed-pdf-content".getBytes();
        storagePath = "summary/test-procedure.pdf";
        exitNumber = "RS/TEST/2026/000001";
    }

    @Test
    void generateAndStoreSummary_shouldCreateAndPersistDocument() throws Exception {
        when(documentRepository.findByProcedureId(procedureId)).thenReturn(List.of(existingDoc));
        when(signatureService.signDocument(any(byte[].class), eq("application/pdf"))).thenReturn(signedBytes);
        when(fileStorageService.storeBytes(eq(procedureId), anyString(), eq(signedBytes))).thenReturn(storagePath);
        when(registryService.generateExitNumber(eq("TEST"), any(Instant.class))).thenReturn(exitNumber);
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Document result = service.generateAndStoreSummary(procedure);

        assertThat(result).isNotNull();
        assertThat(result.getProcedureId()).isEqualTo(procedureId);
        assertThat(result.getName()).isEqualTo("Documento Resumen del Expediente.pdf");
        assertThat(result.getMimeType()).isEqualTo("application/pdf");
        assertThat(result.getStoragePath()).isEqualTo(storagePath);
        assertThat(result.getSignedStoragePath()).isEqualTo(storagePath);
        assertThat(result.getExitNumber()).isEqualTo(exitNumber);
        assertThat(result.isGenerated()).isTrue();
        assertThat(result.getStatus()).isEqualTo(es.tfm.records.domain.model.DocumentStatus.SIGNED);

        verify(documentRepository).save(any(Document.class));
        verify(publicSignatureVerificationService).registerSignedDocument(any(Document.class), eq(signedBytes));
    }

    @Test
    void generateAndStoreSummary_shouldHandleNullUnitCode() throws Exception {
        procedure.setUnitCode(null);

        when(documentRepository.findByProcedureId(procedureId)).thenReturn(List.of(existingDoc));
        when(signatureService.signDocument(any(byte[].class), eq("application/pdf"))).thenReturn(signedBytes);
        when(fileStorageService.storeBytes(eq(procedureId), anyString(), eq(signedBytes))).thenReturn(storagePath);
        when(registryService.generateExitNumber(eq("GEN"), any(Instant.class))).thenReturn("RS/GEN/2026/000001");
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Document result = service.generateAndStoreSummary(procedure);

        assertThat(result).isNotNull();
        assertThat(result.getExitNumber()).isEqualTo("RS/GEN/2026/000001");
        verify(registryService).generateExitNumber(eq("GEN"), any(Instant.class));
    }

    @Test
    void generateAndStoreSummary_shouldThrow_whenSignFails() throws Exception {
        when(documentRepository.findByProcedureId(procedureId)).thenReturn(List.of(existingDoc));
        when(signatureService.signDocument(any(byte[].class), eq("application/pdf")))
                .thenThrow(new RuntimeException("Signing service unavailable"));

        assertThatThrownBy(() -> service.generateAndStoreSummary(procedure))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to sign summary document");
    }
}
