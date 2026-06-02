package es.tfg.records.tests.service;

import es.tfg.records.application.dto.TransparencyDtos;
import es.tfg.records.application.service.TransparencyMetricsService;
import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TransparencyMetricsServiceTest {

    @Mock
    private ProcedureJpaRepository procedureRepository;

    @Mock
    private ProcedureTypeJpaRepository procedureTypeRepository;

    @InjectMocks
    private TransparencyMetricsService service;

    private UUID procedureTypeId;
    private ProcedureTypeEntity licenseType;

    @BeforeEach
    void setUp() {
        procedureTypeId = UUID.randomUUID();
        licenseType = new ProcedureTypeEntity();
        licenseType.setId(procedureTypeId);
        licenseType.setTitle("License Request");
        licenseType.setDeadlineDays(10);
    }

    // ========== computeMetrics ==========

    @Test
    void computeMetrics_shouldReturnCorrectMetricsForMixedProcedures() {
        // Given
        Instant now = Instant.now();
        Instant tenDaysAgo = now.minusSeconds(10L * 24 * 60 * 60);
        Instant fiveDaysAgo = now.minusSeconds(5L * 24 * 60 * 60);

        // Resolved within SLA (approved, 5 days < 10 day deadline)
        ProcedureEntity approved = buildProcedure(CaseStatus.APPROVED, tenDaysAgo, fiveDaysAgo);

        // Resolved outside SLA (rejected, 15 days > 10 day deadline)
        Instant fifteenDaysAgo = now.minusSeconds(15L * 24 * 60 * 60);
        ProcedureEntity rejected = buildProcedure(CaseStatus.REJECTED, fifteenDaysAgo, now);

        // Pending (submitted)
        ProcedureEntity pending = buildProcedure(CaseStatus.SUBMITTED, tenDaysAgo, null);

        // Another pending (in review)
        ProcedureEntity inReview = buildProcedure(CaseStatus.IN_REVIEW, tenDaysAgo, null);

        when(procedureRepository.findAll()).thenReturn(List.of(approved, rejected, pending, inReview));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(licenseType));

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.totalProcedures()).isEqualTo(4);
        assertThat(result.resolvedProcedures()).isEqualTo(2);
        // Pending counts ALL non-resolved: DRAFT + SUBMITTED + IN_REVIEW + AMENDMENT_REQUIRED + RESUBMITTED
        assertThat(result.pendingProcedures()).isEqualTo(2); // SUBMITTED + IN_REVIEW
        assertThat(result.avgResolutionDays()).isGreaterThan(0);
        assertThat(result.slaComplianceRate()).isEqualTo(50.0); // 1 out of 2 resolved within SLA
        assertThat(result.digitalProceduresPct()).isEqualTo(100.0);
    }

    @Test
    void computeMetrics_shouldReturnZerosWhenNoProcedures() {
        // Given
        when(procedureRepository.findAll()).thenReturn(List.of());
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.totalProcedures()).isEqualTo(0);
        assertThat(result.resolvedProcedures()).isEqualTo(0);
        assertThat(result.pendingProcedures()).isEqualTo(0);
        assertThat(result.avgResolutionDays()).isEqualTo(0);
        assertThat(result.slaComplianceRate()).isEqualTo(0);
        assertThat(result.digitalProceduresPct()).isEqualTo(100.0);
    }

    @Test
    void computeMetrics_shouldReturnZeroAvgWhenNoResolvedProcedures() {
        // Given
        ProcedureEntity draft = buildProcedure(CaseStatus.DRAFT, Instant.now(), null);
        ProcedureEntity submitted = buildProcedure(CaseStatus.SUBMITTED, Instant.now(), null);

        when(procedureRepository.findAll()).thenReturn(List.of(draft, submitted));
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.totalProcedures()).isEqualTo(2);
        assertThat(result.resolvedProcedures()).isEqualTo(0);
        assertThat(result.pendingProcedures()).isEqualTo(2); // DRAFT + SUBMITTED (all non-resolved)
        assertThat(result.avgResolutionDays()).isEqualTo(0);
        assertThat(result.slaComplianceRate()).isEqualTo(0);
    }

    @Test
    void computeMetrics_shouldUseSubmittedAtForResolutionDays() {
        // Given
        Instant submittedAt = Instant.now().minusSeconds(48L * 60 * 60); // 2 days ago
        Instant updatedAt = Instant.now();

        ProcedureEntity resolved = buildProcedure(CaseStatus.APPROVED, submittedAt, updatedAt);

        when(procedureRepository.findAll()).thenReturn(List.of(resolved));
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.avgResolutionDays()).isEqualTo(2.0);
    }

    @Test
    void computeMetrics_shouldFallbackToCreatedAtWhenSubmittedAtIsNull() {
        // Given
        Instant createdAt = Instant.now().minusSeconds(72L * 60 * 60); // 3 days ago
        Instant updatedAt = Instant.now();

        ProcedureEntity resolved = new ProcedureEntity();
        resolved.setId(UUID.randomUUID());
        resolved.setStatus(CaseStatus.APPROVED);
        resolved.setSubmittedAt(null);
        resolved.setCreatedAt(createdAt);
        resolved.setUpdatedAt(updatedAt);

        when(procedureRepository.findAll()).thenReturn(List.of(resolved));
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.avgResolutionDays()).isEqualTo(3.0);
    }

    @Test
    void computeMetrics_shouldReturnZeroDaysWhenUpdatedAtIsNull() {
        // Given
        ProcedureEntity resolved = buildProcedure(CaseStatus.APPROVED, Instant.now(), null);

        when(procedureRepository.findAll()).thenReturn(List.of(resolved));
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.resolvedProcedures()).isEqualTo(1);
        assertThat(result.avgResolutionDays()).isEqualTo(0);
    }

    @Test
    void computeMetrics_shouldReturnZeroDaysWhenBothTimestampsAreNull() {
        // Given
        ProcedureEntity resolved = new ProcedureEntity();
        resolved.setId(UUID.randomUUID());
        resolved.setStatus(CaseStatus.APPROVED);
        resolved.setSubmittedAt(null);
        resolved.setCreatedAt(null);
        resolved.setUpdatedAt(null);

        when(procedureRepository.findAll()).thenReturn(List.of(resolved));
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.resolvedProcedures()).isEqualTo(1);
        assertThat(result.avgResolutionDays()).isEqualTo(0);
    }

    @Test
    void computeMetrics_shouldUseDefaultDeadlineWhenTypeNotFound() {
        // Given
        Instant now = Instant.now();
        Instant eightDaysAgo = now.minusSeconds(8L * 24 * 60 * 60);

        // Resolved in 8 days — within default 10-day deadline but no type exists
        ProcedureEntity resolved = buildProcedure(CaseStatus.APPROVED, eightDaysAgo, now);

        UUID unknownTypeId = UUID.randomUUID();
        resolved.setProcedureTypeId(unknownTypeId);

        when(procedureRepository.findAll()).thenReturn(List.of(resolved));
        when(procedureTypeRepository.findAll()).thenReturn(List.of()); // No types, so type lookup returns null

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.slaComplianceRate()).isEqualTo(100.0); // 8 days < 10 default days
    }

    @Test
    void computeMetrics_shouldCalculateSlaRateCorrectly() {
        // Given
        Instant now = Instant.now();
        Instant fiveDaysAgo = now.minusSeconds(5L * 24 * 60 * 60);
        Instant twentyDaysAgo = now.minusSeconds(20L * 24 * 60 * 60);

        // Within SLA (5 days < 10 day deadline)
        ProcedureEntity withinSla = buildProcedure(CaseStatus.APPROVED, fiveDaysAgo, now);

        // Outside SLA (20 days > 10 day deadline)
        ProcedureEntity outsideSla = buildProcedure(CaseStatus.REJECTED, twentyDaysAgo, now);

        when(procedureRepository.findAll()).thenReturn(List.of(withinSla, outsideSla));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(licenseType));

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.slaComplianceRate()).isEqualTo(50.0);
    }

    @Test
    void computeMetrics_shouldReturnZeroSlaRateWhenResolvedButAllOutsideSla() {
        // Given
        Instant now = Instant.now();
        Instant twentyDaysAgo = now.minusSeconds(20L * 24 * 60 * 60);

        ProcedureEntity outsideSla1 = buildProcedure(CaseStatus.APPROVED, twentyDaysAgo, now);
        ProcedureEntity outsideSla2 = buildProcedure(CaseStatus.REJECTED, twentyDaysAgo, now);

        when(procedureRepository.findAll()).thenReturn(List.of(outsideSla1, outsideSla2));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(licenseType));

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.slaComplianceRate()).isEqualTo(0.0);
    }

    @Test
    void computeMetrics_shouldCountAllNonResolvedAsPending() {
        // Given
        ProcedureEntity draft = buildProcedure(CaseStatus.DRAFT, Instant.now(), null);
        ProcedureEntity submitted = buildProcedure(CaseStatus.SUBMITTED, Instant.now(), null);
        ProcedureEntity inReview = buildProcedure(CaseStatus.IN_REVIEW, Instant.now(), null);
        ProcedureEntity amendment = buildProcedure(CaseStatus.AMENDMENT_REQUIRED, Instant.now(), null);
        ProcedureEntity resubmitted = buildProcedure(CaseStatus.RESUBMITTED, Instant.now(), null);

        when(procedureRepository.findAll()).thenReturn(List.of(draft, submitted, inReview, amendment, resubmitted));
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.pendingProcedures()).isEqualTo(5); // All non-resolved: DRAFT + SUBMITTED + IN_REVIEW + AMENDMENT_REQUIRED + RESUBMITTED
    }

    @Test
    void computeMetrics_shouldRoundAvgDaysToTwoDecimals() {
        // Given
        Instant now = Instant.now();
        // 1 day and 12 hours = 1.5 days
        Instant oneAndHalfDaysAgo = now.minusSeconds(36L * 60 * 60);

        ProcedureEntity resolved = buildProcedure(CaseStatus.APPROVED, oneAndHalfDaysAgo, now);

        when(procedureRepository.findAll()).thenReturn(List.of(resolved));
        when(procedureTypeRepository.findAll()).thenReturn(List.of());

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.avgResolutionDays()).isEqualTo(1.5);
    }

    @Test
    void computeMetrics_shouldRoundSlaRateToTwoDecimals() {
        // Given
        Instant now = Instant.now();
        Instant fiveDaysAgo = now.minusSeconds(5L * 24 * 60 * 60);
        Instant twentyDaysAgo = now.minusSeconds(20L * 24 * 60 * 60);

        // 2 within SLA, 1 outside = 66.67%
        ProcedureEntity w1 = buildProcedure(CaseStatus.APPROVED, fiveDaysAgo, now);
        ProcedureEntity w2 = buildProcedure(CaseStatus.REJECTED, fiveDaysAgo, now);
        ProcedureEntity o1 = buildProcedure(CaseStatus.APPROVED, twentyDaysAgo, now);

        when(procedureRepository.findAll()).thenReturn(List.of(w1, w2, o1));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(licenseType));

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        assertThat(result.slaComplianceRate()).isEqualTo(66.67);
    }

    @Test
    void computeMetrics_shouldHandleProcedureTypeNotMatchingAnyProcedure() {
        // Given
        ProcedureEntity resolved = buildProcedure(CaseStatus.APPROVED,
                Instant.now().minusSeconds(5L * 24 * 60 * 60), Instant.now());
        resolved.setProcedureTypeId(UUID.randomUUID()); // Different from licenseType

        when(procedureRepository.findAll()).thenReturn(List.of(resolved));
        when(procedureTypeRepository.findAll()).thenReturn(List.of(licenseType));

        // When
        TransparencyDtos.TransparencyMetricsDto result = service.computeMetrics();

        // Then
        // Type not found for this procedure, so default deadline of 10 days is used
        assertThat(result.slaComplianceRate()).isEqualTo(100.0);
    }

    // ========== Helper ==========

    private ProcedureEntity buildProcedure(CaseStatus status, Instant submittedAt, Instant updatedAt) {
        ProcedureEntity entity = new ProcedureEntity();
        entity.setId(UUID.randomUUID());
        entity.setProcedureTypeId(procedureTypeId);
        entity.setStatus(status);
        entity.setSubmittedAt(submittedAt);
        entity.setCreatedAt(submittedAt != null ? submittedAt : Instant.now());
        entity.setUpdatedAt(updatedAt);
        return entity;
    }
}
