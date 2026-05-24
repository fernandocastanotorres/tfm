package es.tfg.records.tests.service;

import es.tfg.records.application.dto.DocumentItem;
import es.tfg.records.application.service.EniMetadataService;
import es.tfg.records.application.service.DocumentServiceImpl;
import es.tfg.records.application.service.PublicSignatureVerificationService;
import es.tfg.records.application.service.SignatureService;
import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.model.DocumentStatus;
import es.tfg.records.domain.model.Procedure;
import es.tfg.records.domain.port.DocumentRepository;
import es.tfg.records.domain.port.ProcedureRepository;
import es.tfg.records.infrastructure.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceImplTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private ProcedureRepository procedureRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private EniMetadataService eniMetadataService;

    @Mock
    private SignatureService signatureService;

    @Mock
    private PublicSignatureVerificationService publicSignatureVerificationService;

    @InjectMocks
    private DocumentServiceImpl documentService;

    private UUID ownerId;
    private UUID caseId;
    private UUID documentId;

    @BeforeEach
    void setUp() {
        ownerId = UUID.randomUUID();
        caseId = UUID.randomUUID();
        documentId = UUID.randomUUID();
    }

    @Test
    void uploadDocument_shouldUploadFileWhenCaseIsInDraftState() throws Exception {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                "test content".getBytes()
        );

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(fileStorageService.store(eq(caseId), any())).thenReturn("stored-test.pdf");
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> {
            Document d = invocation.getArgument(0);
            d.setId(documentId);
            return d;
        });

        // When
        DocumentItem result = documentService.uploadDocument(caseId, ownerId, file);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(documentId);
        assertThat(result.name()).isEqualTo("test.pdf");
        verify(documentRepository).save(any(Document.class));
        verify(eniMetadataService).upsertDocumentMetadata(any(Document.class));
    }

    @Test
    void uploadDocument_shouldThrowExceptionWhenFileIsEmpty() {
        // Given
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.pdf",
                "application/pdf",
                new byte[0]
        );

        // When/Then
        assertThatThrownBy(() -> documentService.uploadDocument(caseId, ownerId, emptyFile))
                .isInstanceOf(Exception.class);
    }

    @Test
    void uploadDocument_shouldThrowExceptionWhenFileExceedsMaxSize() {
        // Given - Create a file larger than 10MB
        byte[] largeContent = new byte[(int) (11 * 1024 * 1024)];
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.pdf",
                "application/pdf",
                largeContent
        );

        // When/Then
        assertThatThrownBy(() -> documentService.uploadDocument(caseId, ownerId, largeFile))
                .isInstanceOf(Exception.class);
    }

    @Test
    void getDocumentDetail_shouldReturnDocumentWhenOwnerIsValid() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);

        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("test.pdf");
        document.setMimeType("application/pdf");
        document.setSize(1024);
        document.setStatus(DocumentStatus.PENDING);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));

        // When
        var result = documentService.getDocumentDetail(caseId, documentId, ownerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(documentId);
    }

    @Test
    void getDocumentDetail_shouldThrowExceptionWhenDocumentNotFound() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> documentService.getDocumentDetail(caseId, documentId, ownerId))
                .isInstanceOf(Exception.class);
    }

    @Test
    void uploadDocument_shouldThrowExceptionWhenFileTypeIsNotAllowed() {
        // Given
        MockMultipartFile invalidFile = new MockMultipartFile(
                "file",
                "test.exe",
                "application/x-executable",
                "malicious content".getBytes()
        );

        // When/Then
        assertThatThrownBy(() -> documentService.uploadDocument(caseId, ownerId, invalidFile))
                .isInstanceOf(Exception.class);
    }

    @Test
    void listDocumentsByCase_shouldReturnDocumentsWhenOwnerIsValid() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);

        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("test.pdf");
        document.setStatus(DocumentStatus.PENDING);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of(document));

        // When
        List<DocumentItem> result = documentService.listDocumentsByCase(caseId, ownerId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("test.pdf");
    }

    @Test
    void uploadDocument_shouldThrowExceptionWhenCaseIsNotInAcceptingState() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.SUBMITTED); // Not DRAFT or AMENDMENT_REQUIRED

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                "test content".getBytes()
        );

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        // When/Then
        assertThatThrownBy(() -> documentService.uploadDocument(caseId, ownerId, file))
                .isInstanceOf(Exception.class);
    }
}
