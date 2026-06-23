package es.tfm.records.tests.service;

import es.tfm.records.application.dto.PublicSignatureVerificationDto;
import es.tfm.records.application.exception.ResourceNotFoundException;
import es.tfm.records.application.service.PublicSignatureVerificationService;
import es.tfm.records.domain.model.Document;
import es.tfm.records.domain.port.DocumentRepository;
import es.tfm.records.infrastructure.persistence.entity.DocumentVerificationEntity;
import es.tfm.records.infrastructure.persistence.repository.DocumentVerificationJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PublicSignatureVerificationServiceTest {

    @Mock
    private DocumentVerificationJpaRepository verificationRepository;

    @Mock
    private DocumentRepository documentRepository;

    private PublicSignatureVerificationService service;

    private UUID documentId;
    private UUID procedureId;
    private Document document;
    private DocumentVerificationEntity verificationEntity;
    private String csvCode;
    private byte[] signedContent;

    @BeforeEach
    void setUp() {
        service = new PublicSignatureVerificationService(verificationRepository, documentRepository);

        documentId = UUID.randomUUID();
        procedureId = UUID.randomUUID();
        csvCode = "CSVTEST1234567890ABCD";
        signedContent = "signed-content".getBytes();

        document = new Document();
        document.setId(documentId);
        document.setProcedureId(procedureId);
        document.setName("test.pdf");
        document.setSignedStoragePath("signed/test.pdf");
        document.setSignedAt(Instant.now());

        verificationEntity = new DocumentVerificationEntity();
        verificationEntity.setId(UUID.randomUUID());
        verificationEntity.setDocumentId(documentId);
        verificationEntity.setCsvCode(csvCode);
        verificationEntity.setSignedDigest("abcdef1234567890");
        verificationEntity.setSignedAt(Instant.now());
        verificationEntity.setCreatedAt(Instant.now());
    }

    @Test
    void registerSignedDocument_shouldCreateNewEntity_whenNotExists() {
        when(verificationRepository.findByDocumentId(documentId)).thenReturn(Optional.empty());
        when(verificationRepository.existsByCsvCode(anyString())).thenReturn(false);
        when(verificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.registerSignedDocument(document, signedContent);

        verify(verificationRepository).save(any(DocumentVerificationEntity.class));
    }

    @Test
    void registerSignedDocument_shouldUpdateExistingEntity_whenAlreadyExists() {
        when(verificationRepository.findByDocumentId(documentId)).thenReturn(Optional.of(verificationEntity));
        when(verificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.registerSignedDocument(document, signedContent);

        verify(verificationRepository).save(verificationEntity);
    }

    @Test
    void verifyByCsv_shouldReturnDto_whenFound() {
        when(verificationRepository.findByCsvCode(csvCode)).thenReturn(Optional.of(verificationEntity));
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));

        PublicSignatureVerificationDto result = service.verifyByCsv(csvCode);

        assertThat(result).isNotNull();
        assertThat(result.csvCode()).isEqualTo(csvCode);
        assertThat(result.documentId()).isEqualTo(documentId);
        assertThat(result.caseId()).isEqualTo(procedureId);
        assertThat(result.valid()).isTrue();
    }

    @Test
    void verifyByCsv_shouldThrow_whenCsvNotFound() {
        when(verificationRepository.findByCsvCode(csvCode)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.verifyByCsv(csvCode))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void verifyByCsv_shouldThrow_whenDocumentNotFound() {
        when(verificationRepository.findByCsvCode(csvCode)).thenReturn(Optional.of(verificationEntity));
        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.verifyByCsv(csvCode))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findCsvCodeByDocumentId_shouldReturnCode_whenFound() {
        when(verificationRepository.findByDocumentId(documentId))
                .thenReturn(Optional.of(verificationEntity));

        String result = service.findCsvCodeByDocumentId(documentId);

        assertThat(result).isEqualTo(csvCode);
    }

    @Test
    void findCsvCodeByDocumentId_shouldReturnNull_whenNotFound() {
        when(verificationRepository.findByDocumentId(documentId)).thenReturn(Optional.empty());

        String result = service.findCsvCodeByDocumentId(documentId);

        assertThat(result).isNull();
    }
}
