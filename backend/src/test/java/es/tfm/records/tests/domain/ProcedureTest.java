package es.tfm.records.tests.domain;

import es.tfm.records.domain.model.CaseStatus;
import es.tfm.records.domain.model.Procedure;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProcedureTest {

    @Test
    void procedure_shouldCreateWithAllFields() {
        // Given
        UUID id = UUID.randomUUID();
        UUID procedureTypeId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        String title = "Birth Certificate Application";
        CaseStatus status = CaseStatus.DRAFT;
        String formData = "{\"name\": \"John\"}";
        String assignedUnit = "Civil Registry";
        Instant submittedAt = null;

        // When
        Procedure procedure = new Procedure(
                id, procedureTypeId, ownerId, title,
                status, formData, assignedUnit, submittedAt
        );

        // Then
        assertThat(procedure.getId()).isEqualTo(id);
        assertThat(procedure.getProcedureTypeId()).isEqualTo(procedureTypeId);
        assertThat(procedure.getOwnerId()).isEqualTo(ownerId);
        assertThat(procedure.getTitle()).isEqualTo(title);
        assertThat(procedure.getStatus()).isEqualTo(status);
        assertThat(procedure.getFormData()).isEqualTo(formData);
        assertThat(procedure.getAssignedUnit()).isEqualTo(assignedUnit);
        assertThat(procedure.getSubmittedAt()).isNull();
    }

    @Test
    void procedure_shouldAllowDefaultConstructor() {
        // When
        Procedure procedure = new Procedure();

        // Then
        assertThat(procedure.getId()).isNull();
        assertThat(procedure.getTitle()).isNull();
        assertThat(procedure.getStatus()).isNull();
    }

    @Test
    void procedure_shouldAllowFieldModification() {
        // Given
        Procedure procedure = new Procedure();
        UUID newId = UUID.randomUUID();
        String newTitle = "Updated Title";
        CaseStatus newStatus = CaseStatus.SUBMITTED;

        // When
        procedure.setId(newId);
        procedure.setTitle(newTitle);
        procedure.setStatus(newStatus);
        procedure.setFormData("{}");
        procedure.setSubmittedAt(Instant.now());

        // Then
        assertThat(procedure.getId()).isEqualTo(newId);
        assertThat(procedure.getTitle()).isEqualTo(newTitle);
        assertThat(procedure.getStatus()).isEqualTo(newStatus);
        assertThat(procedure.getFormData()).isEqualTo("{}");
        assertThat(procedure.getSubmittedAt()).isNotNull();
    }

    @Test
    void procedure_shouldHandleAllCaseStatuses() {
        // Given
        Procedure procedure = new Procedure();

        // When/Then - verify all statuses can be assigned
        for (CaseStatus status : CaseStatus.values()) {
            procedure.setStatus(status);
            assertThat(procedure.getStatus()).isEqualTo(status);
        }
    }

    @Test
    void procedure_shouldTrackTimestamps() {
        // Given
        Procedure procedure = new Procedure();
        Instant now = Instant.now();

        // When
        procedure.setCreatedAt(now);
        procedure.setUpdatedAt(now);

        // Then
        assertThat(procedure.getCreatedAt()).isEqualTo(now);
        assertThat(procedure.getUpdatedAt()).isEqualTo(now);
    }
}