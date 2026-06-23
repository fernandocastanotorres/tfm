package es.tfm.records.tests.service;

import es.tfm.records.application.dto.CaseDetail;
import es.tfm.records.application.dto.CaseItem;
import es.tfm.records.application.dto.CaseStatusResponse;
import es.tfm.records.application.dto.CreateCaseRequest;
import es.tfm.records.application.dto.PagedResponse;
import es.tfm.records.application.dto.RegistryEntryReceiptDto;
import es.tfm.records.application.dto.WorkflowDtos;
import es.tfm.records.application.exception.AccessDeniedException;
import es.tfm.records.application.exception.ConflictException;
import es.tfm.records.application.exception.InvalidProcedureException;
import es.tfm.records.application.exception.ResourceNotFoundException;
import es.tfm.records.application.exception.ValidationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfm.records.application.service.CaseServiceImpl;
import es.tfm.records.application.service.EniMetadataService;
import es.tfm.records.application.service.PublicSignatureVerificationService;
import es.tfm.records.application.service.RegistryService;
import es.tfm.records.application.service.SignatureService;
import es.tfm.records.application.service.SummaryDocumentService;
import es.tfm.records.application.service.WorkflowService;
import es.tfm.records.domain.model.CaseStatus;
import es.tfm.records.domain.model.Document;
import es.tfm.records.domain.model.Procedure;
import es.tfm.records.domain.model.ProcedureType;
import es.tfm.records.domain.port.DocumentRepository;
import es.tfm.records.domain.port.ProcedureRepository;
import es.tfm.records.domain.port.ProcedureTypeRepository;
import es.tfm.records.infrastructure.persistence.repository.CaseTimelineEventJpaRepository;
import es.tfm.records.infrastructure.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CaseServiceImplTest {

    @Mock
    private ProcedureRepository procedureRepository;

    @Mock
    private ProcedureTypeRepository procedureTypeRepository;

    @Mock
    private EniMetadataService eniMetadataService;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private CaseTimelineEventJpaRepository timelineRepository;

    @Mock
    private SignatureService signatureService;

    @Mock
    private PublicSignatureVerificationService publicSignatureVerificationService;

    @Mock
    private WorkflowService workflowService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private RegistryService registryService;

    @Mock
    private SummaryDocumentService summaryDocumentService;

    @InjectMocks
    private CaseServiceImpl caseService;

    private UUID ownerId;
    private UUID procedureTypeId;
    private UUID caseId;

    @BeforeEach
    void setUp() {
        ownerId = UUID.randomUUID();
        procedureTypeId = UUID.randomUUID();
        caseId = UUID.randomUUID();
    }

    @Test
    void listCases_shouldReturnPagedResponse() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setTitle("Test Procedure");
        procedure.setStatus(CaseStatus.DRAFT);
        procedure.setProcedureTypeId(procedureTypeId);

        when(procedureRepository.findByOwnerId(eq(ownerId), anyInt(), anyInt()))
                .thenReturn(List.of(procedure));
        when(procedureRepository.countByOwnerId(ownerId)).thenReturn(1L);
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        PagedResponse<CaseItem> result = caseService.listCases(ownerId, 0, 10, "createdAt");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.items()).hasSize(1);
        assertThat(result.totalItems()).isEqualTo(1);
        assertThat(result.totalPages()).isEqualTo(1);
    }

    @Test
    void createCase_shouldCreateProcedureWithValidProcedureType() {
        // Given
        ProcedureType procedureType = new ProcedureType();
        procedureType.setId(procedureTypeId);
        procedureType.setTitle("License Request");

        CreateCaseRequest request = new CreateCaseRequest(
                procedureTypeId.toString(),
                null,
                null
        );

        when(procedureTypeRepository.findById(procedureTypeId))
                .thenReturn(Optional.of(procedureType));
        when(procedureRepository.save(any(Procedure.class))).thenAnswer(invocation -> {
            Procedure p = invocation.getArgument(0);
            p.setId(caseId);
            return p;
        });
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        CaseItem result = caseService.createCase(ownerId, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(caseId);
        verify(procedureRepository).save(any(Procedure.class));
        verify(eniMetadataService).upsertProcedureMetadata(any(Procedure.class));
    }

    @Test
    void createCase_shouldThrowExceptionWhenProcedureTypeNotFound() {
        // Given
        CreateCaseRequest request = new CreateCaseRequest(
                procedureTypeId.toString(),
                null,
                null
        );

        when(procedureTypeRepository.findById(procedureTypeId))
                .thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> caseService.createCase(ownerId, request))
                .isInstanceOf(InvalidProcedureException.class);
    }

    @Test
    void getCaseDetail_shouldReturnCaseWhenOwnerIsValid() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setTitle("Test Procedure");
        procedure.setStatus(CaseStatus.DRAFT);
        procedure.setProcedureTypeId(procedureTypeId);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        var result = caseService.getCaseDetail(caseId, ownerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(caseId);
    }

    @Test
    void getCaseDetail_shouldThrowExceptionWhenCaseNotFound() {
        // Given
        when(procedureRepository.findById(caseId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> caseService.getCaseDetail(caseId, ownerId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void submitCase_shouldSubmitCaseInDraftStatus() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);
        procedure.setTitle("Test Procedure");
        procedure.setProcedureTypeId(procedureTypeId);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(procedureRepository.save(any(Procedure.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ProcedureType procedureType = new ProcedureType();
        procedureType.setId(procedureTypeId);
        procedureType.setProcessKey("simpleCitizenProcedure");
        when(procedureTypeRepository.findById(procedureTypeId)).thenReturn(Optional.of(procedureType));
        when(workflowService.startProcess(any())).thenReturn(new WorkflowDtos.ProcessInstanceResponse(
                "proc-1",
                "def-1",
                "simpleCitizenProcedure",
                caseId.toString(),
                ownerId.toString(),
                java.time.Instant.now(),
                false));

        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of());
        when(registryService.generateEntryNumber(any(), any())).thenReturn("RE/GEN/2026/000001");
        when(registryService.generateRecordNumber(any(), any())).thenReturn("EXP/GEN/2026/000001");
        when(summaryDocumentService.generateAndStoreSummary(any())).thenReturn(new Document());

        // When
        var result = caseService.submitCase(caseId, ownerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("SUBMITTED");
        verify(eniMetadataService).upsertProcedureMetadata(any(Procedure.class));
    }

    @Test
    void submitCase_shouldThrowExceptionWhenCaseNotInDraftStatus() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.SUBMITTED);
        procedure.setTitle("Test Procedure");
        procedure.setProcedureTypeId(procedureTypeId);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        // When/Then
        assertThatThrownBy(() -> caseService.submitCase(caseId, ownerId))
                .isInstanceOf(Exception.class);
    }

    @Test
    void requestAmendment_shouldAmendCaseInAmendmentRequiredStatus() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.AMENDMENT_REQUIRED);
        procedure.setTitle("Test Procedure");
        procedure.setProcedureTypeId(procedureTypeId);

        CreateCaseRequest request = new CreateCaseRequest(
                procedureTypeId.toString(),
                java.util.Map.of("field", "value"),
                null
        );

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(procedureRepository.save(any(Procedure.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        var result = caseService.requestAmendment(caseId, ownerId, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("RESUBMITTED");
        verify(eniMetadataService).upsertProcedureMetadata(any(Procedure.class));
    }

    @Test
    void updateCaseStatus_shouldUpdateStatusWhenCaseExists() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);
        procedure.setTitle("Test Procedure");
        procedure.setProcedureTypeId(procedureTypeId);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(procedureRepository.save(any(Procedure.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        var result = caseService.updateCaseStatus(caseId, ownerId, "SUBMITTED");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("SUBMITTED");
        verify(eniMetadataService).upsertProcedureMetadata(any(Procedure.class));
    }

    @Test
    void updateCaseStatus_shouldThrowExceptionForInvalidStatus() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);
        procedure.setTitle("Test Procedure");
        procedure.setProcedureTypeId(procedureTypeId);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        // When/Then
        assertThatThrownBy(() -> caseService.updateCaseStatus(caseId, ownerId, "INVALID_STATUS"))
                .isInstanceOf(Exception.class);
    }

    @Test
    void listCases_shouldClampNegativePageAndOversizedPageSize() {
        when(procedureRepository.findByOwnerId(eq(ownerId), eq(0), eq(100))).thenReturn(List.of());
        when(procedureRepository.countByOwnerId(ownerId)).thenReturn(0L);
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        PagedResponse<CaseItem> result = caseService.listCases(ownerId, -5, 1000, "createdAt");

        assertThat(result.page()).isEqualTo(0);
        assertThat(result.size()).isEqualTo(100);
        verify(procedureRepository).findByOwnerId(ownerId, 0, 100);
    }

    @Test
    void getCaseDetail_shouldThrowWhenCaseNotFound() {
        when(procedureRepository.findById(caseId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> caseService.getCaseDetail(caseId, ownerId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getCaseDetail_shouldThrowWhenOwnerDoesNotMatch() {
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(UUID.randomUUID());
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        assertThatThrownBy(() -> caseService.getCaseDetail(caseId, ownerId))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void createCase_shouldThrowWhenProcedureIdIsNotUuid() {
        CreateCaseRequest request = new CreateCaseRequest("not-a-uuid", null, null);

        assertThatThrownBy(() -> caseService.createCase(ownerId, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void submitCase_shouldThrowConflictWhenNotDraft() {
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.SUBMITTED);
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        assertThatThrownBy(() -> caseService.submitCase(caseId, ownerId))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void requestAmendment_shouldThrowConflictWhenNotAmendmentRequired() {
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        CreateCaseRequest request = new CreateCaseRequest(procedureTypeId.toString(), java.util.Map.of("f", "v"), null);

        assertThatThrownBy(() -> caseService.requestAmendment(caseId, ownerId, request))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void updateCaseStatus_shouldThrowValidationExceptionForInvalidStatus() {
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);
        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        assertThatThrownBy(() -> caseService.updateCaseStatus(caseId, ownerId, "bad_status"))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void getCaseStatus_shouldReturnCaseStatusResponse() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        // When
        CaseStatusResponse result = caseService.getCaseStatus(caseId, ownerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("DRAFT");
    }

    @Test
    void getCaseStatus_shouldThrowExceptionWhenCaseNotFound() {
        // Given
        when(procedureRepository.findById(caseId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> caseService.getCaseStatus(caseId, ownerId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getCaseStatus_shouldThrowExceptionWhenOwnerDoesNotMatch() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(UUID.randomUUID());

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        // When/Then
        assertThatThrownBy(() -> caseService.getCaseStatus(caseId, ownerId))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void getRegistryEntryReceipt_shouldReturnReceiptWithoutCsv() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.SUBMITTED);
        procedure.setRecordNumber("REC-001");
        procedure.setEntryNumber("ENT-001");
        procedure.setSubmittedAt(Instant.now());

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of());

        // When
        RegistryEntryReceiptDto result = caseService.getRegistryEntryReceipt(caseId, ownerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.caseId()).isEqualTo(caseId);
        assertThat(result.recordNumber()).isEqualTo("REC-001");
        assertThat(result.entryNumber()).isEqualTo("ENT-001");
        assertThat(result.csvCode()).isNull();
        assertThat(result.verificationUrl()).isNull();
    }

    @Test
    void getRegistryEntryReceipt_shouldReturnReceiptWithCsv() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.SUBMITTED);
        procedure.setRecordNumber("REC-001");
        procedure.setEntryNumber("ENT-001");
        procedure.setSubmittedAt(Instant.now());

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        Document doc = new Document();
        doc.setId(UUID.randomUUID());
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of(doc));
        when(publicSignatureVerificationService.findCsvCodeByDocumentId(doc.getId())).thenReturn("CSV-123");

        // When
        RegistryEntryReceiptDto result = caseService.getRegistryEntryReceipt(caseId, ownerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.caseId()).isEqualTo(caseId);
        assertThat(result.csvCode()).isEqualTo("CSV-123");
        assertThat(result.verificationUrl()).contains("CSV-123");
    }

    @Test
    void updateDraft_shouldUpdateFormData() throws Exception {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);
        procedure.setFormData("{\"field\":\"value\"}");

        CreateCaseRequest request = new CreateCaseRequest(
                procedureTypeId.toString(),
                java.util.Map.of("field", "new value"),
                null
        );

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        doReturn("{\"field\":\"new value\"}").when(objectMapper).writeValueAsString(any());
        when(procedureRepository.save(any(Procedure.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        CaseStatusResponse result = caseService.updateDraft(caseId, ownerId, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("DRAFT");
        verify(objectMapper).writeValueAsString(any());
        verify(procedureRepository).save(any(Procedure.class));
        verify(eniMetadataService).upsertProcedureMetadata(any(Procedure.class));
    }

    @Test
    void updateDraft_shouldUpdateWithoutFormData() throws Exception {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.DRAFT);

        CreateCaseRequest request = new CreateCaseRequest(
                procedureTypeId.toString(),
                null,
                null
        );

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(procedureRepository.save(any(Procedure.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        CaseStatusResponse result = caseService.updateDraft(caseId, ownerId, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("DRAFT");
        verify(objectMapper, never()).writeValueAsString(any());
        verify(procedureRepository).save(any(Procedure.class));
        verify(eniMetadataService).upsertProcedureMetadata(any(Procedure.class));
    }

    @Test
    void updateDraft_shouldThrowConflictWhenNotDraft() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.SUBMITTED);

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        CreateCaseRequest request = new CreateCaseRequest(procedureTypeId.toString(), null, null);

        // When/Then
        assertThatThrownBy(() -> caseService.updateDraft(caseId, ownerId, request))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void downloadReceipt_shouldGeneratePdfWithoutCsv() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.APPROVED);
        procedure.setTitle("Test Procedure");
        procedure.setRecordNumber("REC-001");
        procedure.setEntryNumber("ENT-001");
        procedure.setSubmittedAt(Instant.now());
        procedure.setAssignedUnit("Test Unit");

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of());

        // When
        Resource result = caseService.downloadReceipt(caseId, ownerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(ByteArrayResource.class);
        assertThat(((ByteArrayResource) result).getByteArray()).isNotEmpty();
    }

    @Test
    void downloadReceipt_shouldGeneratePdfWithCsv() {
        // Given
        Procedure procedure = new Procedure();
        procedure.setId(caseId);
        procedure.setOwnerId(ownerId);
        procedure.setStatus(CaseStatus.APPROVED);
        procedure.setTitle("Test Procedure");
        procedure.setRecordNumber("REC-001");
        procedure.setEntryNumber("ENT-001");
        procedure.setSubmittedAt(Instant.now());
        procedure.setAssignedUnit("Test Unit");

        when(procedureRepository.findById(caseId)).thenReturn(Optional.of(procedure));

        Document doc = new Document();
        doc.setId(UUID.randomUUID());
        when(documentRepository.findByProcedureId(caseId)).thenReturn(List.of(doc));
        when(publicSignatureVerificationService.findCsvCodeByDocumentId(doc.getId())).thenReturn("CSV-123");

        // When
        Resource result = caseService.downloadReceipt(caseId, ownerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(ByteArrayResource.class);
        assertThat(((ByteArrayResource) result).getByteArray()).isNotEmpty();
    }
}
