package es.tfm.records.tests.service;

import es.tfm.records.application.dto.DocumentItem;
import es.tfm.records.application.exception.ResourceNotFoundException;
import es.tfm.records.application.service.EniMetadataService;
import es.tfm.records.application.service.DocumentServiceImpl;
import es.tfm.records.application.service.DocumentDownloadVariant;
import es.tfm.records.application.service.PublicSignatureVerificationService;
import es.tfm.records.application.service.SignatureService;
import es.tfm.records.domain.model.CaseStatus;
import es.tfm.records.domain.model.Document;
import es.tfm.records.domain.model.DocumentStatus;
import es.tfm.records.domain.model.Procedure;
import es.tfm.records.domain.port.DocumentRepository;
import es.tfm.records.domain.port.ProcedureRepository;
import es.tfm.records.infrastructure.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
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

    @Test
    void downloadDocument_shouldUseStoragePathForCurrentVariant_whenAvailable() {
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);

        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("resumen.pdf");
        document.setStoragePath("current.pdf");
        document.setSize(12L);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(fileStorageService.openStream(caseId, "current.pdf"))
                .thenReturn(new ByteArrayInputStream(new byte[] {1, 2, 3}));

        Resource result = documentService.downloadDocument(documentId, ownerId, DocumentDownloadVariant.CURRENT);

        assertThat(result).isNotNull();
        verify(fileStorageService).openStream(caseId, "current.pdf");
    }

    @Test
    void downloadDocument_shouldFallbackToSignedStoragePathForCurrentVariant_whenStoragePathMissing() {
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);

        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("Documento Resumen del Expediente.pdf");
        document.setStoragePath(null);
        document.setSignedStoragePath("summary-signed.pdf");
        document.setSize(24L);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(fileStorageService.openStream(caseId, "summary-signed.pdf"))
                .thenReturn(new ByteArrayInputStream(new byte[] {9, 8, 7}));

        Resource result = documentService.downloadDocument(documentId, ownerId, DocumentDownloadVariant.CURRENT);

        assertThat(result).isNotNull();
        verify(fileStorageService).openStream(caseId, "summary-signed.pdf");
    }

    @Test
    void downloadDocument_shouldFallbackToOriginalStoragePathForCurrentVariant_whenCurrentAndSignedMissing() {
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);

        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("resumen.pdf");
        document.setStoragePath(null);
        document.setSignedStoragePath(null);
        document.setOriginalStoragePath("summary-original.pdf");
        document.setSize(36L);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(fileStorageService.openStream(caseId, "summary-original.pdf"))
                .thenReturn(new ByteArrayInputStream(new byte[] {4, 5, 6}));

        Resource result = documentService.downloadDocument(documentId, ownerId, DocumentDownloadVariant.CURRENT);

        assertThat(result).isNotNull();
        verify(fileStorageService).openStream(caseId, "summary-original.pdf");
    }

    @Test
    void downloadDocument_shouldThrowWhenNoStorageArtifactExistsForCurrentVariant() {
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);

        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("resumen.pdf");
        document.setStoragePath(null);
        document.setSignedStoragePath(null);
        document.setOriginalStoragePath(null);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        assertThatThrownBy(() -> documentService.downloadDocument(documentId, ownerId, DocumentDownloadVariant.CURRENT))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(fileStorageService, never()).openStream(any(), any());
    }

    @Test
    void deleteDocument_shouldDeleteFileAndSetRejected_whenStoragePathExists() {
        // Given
        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setStoragePath("file.pdf");

        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        documentService.deleteDocument(documentId, ownerId);

        // Then
        verify(fileStorageService).delete(caseId, "file.pdf");
        ArgumentCaptor<Document> captor = ArgumentCaptor.forClass(Document.class);
        verify(documentRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(DocumentStatus.REJECTED);
        verify(eniMetadataService).upsertDocumentMetadata(any(Document.class));
    }

    @Test
    void deleteDocument_shouldSkipFileDelete_whenStoragePathIsNull() {
        // Given
        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setStoragePath(null);

        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        documentService.deleteDocument(documentId, ownerId);

        // Then
        verify(fileStorageService, never()).delete(any(), any());
        verify(documentRepository).save(any(Document.class));
        verify(eniMetadataService).upsertDocumentMetadata(any(Document.class));
    }

    @Test
    void deleteDocument_shouldThrowException_whenDocumentNotFound() {
        // Given
        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> documentService.deleteDocument(documentId, ownerId))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(documentRepository, never()).save(any());
    }

    @Test
    void downloadDocumentForAdmin_shouldReturnCurrentVariant() {
        // Given
        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("test.pdf");
        document.setStoragePath("current.pdf");
        document.setSize(100L);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(fileStorageService.openStream(caseId, "current.pdf"))
                .thenReturn(new ByteArrayInputStream(new byte[]{1, 2, 3}));

        // When
        Resource result = documentService.downloadDocumentForAdmin(documentId, DocumentDownloadVariant.CURRENT);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFilename()).isEqualTo("test.pdf");
        verify(fileStorageService).openStream(caseId, "current.pdf");
    }

    @Test
    void downloadDocumentForAdmin_shouldReturnOriginalVariant() {
        // Given
        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("original.pdf");
        document.setOriginalStoragePath("original-path.pdf");
        document.setOriginalSize(50L);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(fileStorageService.openStream(caseId, "original-path.pdf"))
                .thenReturn(new ByteArrayInputStream(new byte[]{4, 5}));

        // When
        Resource result = documentService.downloadDocumentForAdmin(documentId, DocumentDownloadVariant.ORIGINAL);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFilename()).isEqualTo("original.pdf");
        verify(fileStorageService).openStream(caseId, "original-path.pdf");
    }

    @Test
    void downloadDocumentForAdmin_shouldReturnSignedVariant() {
        // Given
        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("test.pdf");
        document.setSignedStoragePath("signed.pdf");
        document.setSignedSize(200L);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(fileStorageService.openStream(caseId, "signed.pdf"))
                .thenReturn(new ByteArrayInputStream(new byte[]{6, 7, 8, 9}));

        // When
        Resource result = documentService.downloadDocumentForAdmin(documentId, DocumentDownloadVariant.SIGNED);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFilename()).isEqualTo("signed-test.pdf");
        verify(fileStorageService).openStream(caseId, "signed.pdf");
    }

    @Test
    void downloadDocumentForAdmin_shouldThrowException_whenArtifactNotAvailable() {
        // Given
        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("test.pdf");
        document.setOriginalStoragePath(null);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));

        // When/Then
        assertThatThrownBy(() -> documentService.downloadDocumentForAdmin(documentId, DocumentDownloadVariant.ORIGINAL))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(fileStorageService, never()).openStream(any(), any());
    }

    @Test
    void downloadDocument_shouldReturnOriginalVariant() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);

        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("original.pdf");
        document.setOriginalStoragePath("original-path.pdf");
        document.setOriginalSize(50L);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(fileStorageService.openStream(caseId, "original-path.pdf"))
                .thenReturn(new ByteArrayInputStream(new byte[]{1, 2}));

        // When
        Resource result = documentService.downloadDocument(documentId, ownerId, DocumentDownloadVariant.ORIGINAL);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFilename()).isEqualTo("original.pdf");
        verify(fileStorageService).openStream(caseId, "original-path.pdf");
    }

    @Test
    void downloadDocument_shouldReturnSignedVariant() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);

        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("test.pdf");
        document.setSignedStoragePath("signed.pdf");
        document.setSignedSize(200L);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(fileStorageService.openStream(caseId, "signed.pdf"))
                .thenReturn(new ByteArrayInputStream(new byte[]{6, 7, 8, 9}));

        // When
        Resource result = documentService.downloadDocument(documentId, ownerId, DocumentDownloadVariant.SIGNED);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFilename()).isEqualTo("signed-test.pdf");
        verify(fileStorageService).openStream(caseId, "signed.pdf");
    }

    @Test
    void downloadDocument_shouldThrowException_whenOriginalArtifactNotAvailable() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);

        Document document = new Document();
        document.setId(documentId);
        document.setProcedureId(caseId);
        document.setName("test.pdf");
        document.setOriginalStoragePath(null);

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        // When/Then
        assertThatThrownBy(() -> documentService.downloadDocument(documentId, ownerId, DocumentDownloadVariant.ORIGINAL))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(fileStorageService, never()).openStream(any(), any());
    }
}
