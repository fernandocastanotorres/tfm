package es.tfg.records.tests.domain;

import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.domain.model.TaskType;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProcedureTaskTest {

    @Test
    void defaultConstructor_shouldCreateEmptyTask() {
        ProcedureTask task = new ProcedureTask();
        assertThat(task.getId()).isNull();
        assertThat(task.getProcedureTypeId()).isNull();
        assertThat(task.getType()).isNull();
        assertThat(task.getOrderIndex()).isZero();
        assertThat(task.getTitle()).isNull();
        assertThat(task.getDescription()).isNull();
        assertThat(task.getFormSchema()).isNull();
        assertThat(task.getUploadRequirements()).isNull();
        assertThat(task.getCreatedAt()).isNull();
        assertThat(task.getUpdatedAt()).isNull();
    }

    @Test
    void parameterizedConstructor_shouldSetFields() {
        UUID id = UUID.randomUUID();
        UUID procedureTypeId = UUID.randomUUID();
        TaskType type = TaskType.FORM;
        int orderIndex = 1;
        String title = "Personal Information";
        String description = "Enter your personal details";

        ProcedureTask task = new ProcedureTask(id, procedureTypeId, type, orderIndex, title, description);

        assertThat(task.getId()).isEqualTo(id);
        assertThat(task.getProcedureTypeId()).isEqualTo(procedureTypeId);
        assertThat(task.getType()).isEqualTo(type);
        assertThat(task.getOrderIndex()).isEqualTo(orderIndex);
        assertThat(task.getTitle()).isEqualTo(title);
        assertThat(task.getDescription()).isEqualTo(description);
    }

    @Test
    void setters_shouldUpdateFields() {
        ProcedureTask task = new ProcedureTask();
        UUID id = UUID.randomUUID();
        UUID procedureTypeId = UUID.randomUUID();
        Instant now = Instant.now();

        task.setId(id);
        task.setProcedureTypeId(procedureTypeId);
        task.setType(TaskType.UPLOAD);
        task.setOrderIndex(2);
        task.setTitle("Document Upload");
        task.setDescription("Upload required documents");
        task.setFormSchema("{\"type\": \"object\"}");
        task.setUploadRequirements("PDF, max 5MB");
        task.setCreatedAt(now);
        task.setUpdatedAt(now);

        assertThat(task.getId()).isEqualTo(id);
        assertThat(task.getProcedureTypeId()).isEqualTo(procedureTypeId);
        assertThat(task.getType()).isEqualTo(TaskType.UPLOAD);
        assertThat(task.getOrderIndex()).isEqualTo(2);
        assertThat(task.getTitle()).isEqualTo("Document Upload");
        assertThat(task.getDescription()).isEqualTo("Upload required documents");
        assertThat(task.getFormSchema()).isEqualTo("{\"type\": \"object\"}");
        assertThat(task.getUploadRequirements()).isEqualTo("PDF, max 5MB");
        assertThat(task.getCreatedAt()).isEqualTo(now);
        assertThat(task.getUpdatedAt()).isEqualTo(now);
    }
}
