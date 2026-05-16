package es.tfg.records.tests.service;

import es.tfg.records.application.dto.CaseDetail;
import es.tfg.records.application.dto.CaseItem;
import es.tfg.records.application.dto.CaseStatusResponse;
import es.tfg.records.application.dto.CreateCaseRequest;
import es.tfg.records.application.dto.PagedResponse;
import es.tfg.records.application.exception.AccessDeniedException;
import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.InvalidProcedureException;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.application.exception.ValidationException;
import es.tfg.records.application.service.CaseServiceImpl;
import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.Procedure;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.port.ProcedureRepository;
import es.tfg.records.domain.port.ProcedureTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

        // When
        var result = caseService.submitCase(caseId, ownerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("SUBMITTED");
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
}
