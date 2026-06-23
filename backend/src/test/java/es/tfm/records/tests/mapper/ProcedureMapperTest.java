package es.tfm.records.tests.mapper;

import es.tfm.records.application.dto.CaseDetail;
import es.tfm.records.application.dto.CaseItem;
import es.tfm.records.application.dto.CaseStatusResponse;
import es.tfm.records.application.mapper.ProcedureMapper;
import es.tfm.records.domain.model.CaseStatus;
import es.tfm.records.domain.model.Procedure;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProcedureMapperTest {

    private UUID procedureId = UUID.randomUUID();
    private UUID ownerId = UUID.randomUUID();
    private Instant now = Instant.now();

    // ===== toCaseItem Tests =====

    @Test
    void toCaseItem_shouldMapProcedureToCaseItem() {
        // Given
        Procedure procedure = new Procedure(
                procedureId, UUID.randomUUID(), ownerId,
                "Birth Certificate Application",
                CaseStatus.DRAFT, null, "Civil Registry",
                null
        );
        procedure.setUpdatedAt(now);
        procedure.setSubmittedAt(null);

        // When
        CaseItem result = ProcedureMapper.toCaseItem(procedure, "Registry");

        // Then
        assertThat(result.id()).isEqualTo(procedureId);
        assertThat(result.title()).isEqualTo("Birth Certificate Application");
        assertThat(result.status()).isEqualTo("DRAFT");
        assertThat(result.lastUpdated()).isEqualTo(now);
        assertThat(result.submittedAt()).isNull();
        assertThat(result.category()).isEqualTo("Registry");
        assertThat(result.assignedUnit()).isEqualTo("Civil Registry");
    }

    @Test
    void toCaseItem_shouldMapSubmittedCase() {
        // Given
        Procedure procedure = new Procedure(
                procedureId, UUID.randomUUID(), ownerId,
                "Marriage License",
                CaseStatus.SUBMITTED, null, "Office of Population",
                now
        );
        procedure.setUpdatedAt(now);

        // When
        CaseItem result = ProcedureMapper.toCaseItem(procedure, "License");

        // Then
        assertThat(result.status()).isEqualTo("SUBMITTED");
        assertThat(result.submittedAt()).isEqualTo(now);
    }

    // ===== toCaseDetail Tests =====

    @Test
    void toCaseDetail_shouldMapProcedureToCaseDetail() {
        // Given
        Procedure procedure = new Procedure(
                procedureId, UUID.randomUUID(), ownerId,
                "Driver License Renewal",
                CaseStatus.IN_REVIEW, null, "Traffic Department",
                now
        );
        procedure.setUpdatedAt(now);

        // When
        CaseDetail result = ProcedureMapper.toCaseDetail(procedure, "Transportation", "License renewal for drivers", null, null, null);

        // Then
        assertThat(result.id()).isEqualTo(procedureId);
        assertThat(result.title()).isEqualTo("Driver License Renewal");
        assertThat(result.status()).isEqualTo("IN_REVIEW");
        assertThat(result.category()).isEqualTo("Transportation");
        assertThat(result.assignedUnit()).isEqualTo("Traffic Department");
        assertThat(result.submittedAt()).isEqualTo(now);
        assertThat(result.description()).isEqualTo("License renewal for drivers");
        assertThat(result.attachments()).isEmpty();
        assertThat(result.timeline()).isEmpty();
    }

    @Test
    void toCaseDetail_shouldHandleAllCaseStatuses() {
        // Given - test each status
        CaseStatus[] statuses = CaseStatus.values();

        for (CaseStatus status : statuses) {
            Procedure procedure = new Procedure(
                    procedureId, UUID.randomUUID(), ownerId,
                    "Test Procedure",
                    status, null, "Test Unit",
                    now
            );
            procedure.setUpdatedAt(now);

            // When
            CaseDetail result = ProcedureMapper.toCaseDetail(procedure, "Test", "Test description", null, null, null);

            // Then
            assertThat(result.status()).isEqualTo(status.name());
        }
    }

    // ===== toCaseStatusResponse Tests =====

    @Test
    void toCaseStatusResponse_shouldMapProcedureToStatusResponse() {
        // Given
        Procedure procedure = new Procedure(
                procedureId, UUID.randomUUID(), ownerId,
                "Building Permit",
                CaseStatus.AMENDMENT_REQUIRED, null, "Urban Planning",
                null
        );
        procedure.setUpdatedAt(now);

        // When
        CaseStatusResponse result = ProcedureMapper.toCaseStatusResponse(procedure, "Document Review");

        // Then
        assertThat(result.id()).isEqualTo(procedureId);
        assertThat(result.status()).isEqualTo("AMENDMENT_REQUIRED");
        assertThat(result.statusUpdatedAt()).isEqualTo(now);
        assertThat(result.currentTask()).isEqualTo("Document Review");
    }

    @Test
    void toCaseStatusResponse_shouldHandleNullCurrentTask() {
        // Given
        Procedure procedure = new Procedure(
                procedureId, UUID.randomUUID(), ownerId,
                "Test Procedure",
                CaseStatus.DRAFT, null, "Test Unit",
                null
        );
        procedure.setUpdatedAt(now);

        // When
        CaseStatusResponse result = ProcedureMapper.toCaseStatusResponse(procedure, null);

        // Then
        assertThat(result.currentTask()).isNull();
    }
}