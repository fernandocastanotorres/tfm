package es.tfm.records.tests.domain;

import es.tfm.records.domain.model.ProcedureTask;
import es.tfm.records.domain.model.ProcedureType;
import es.tfm.records.domain.model.TaskType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProcedureTypeTest {

    @Test
    void defaultConstructor_shouldCreateEmptyType() {
        ProcedureType type = new ProcedureType();
        assertThat(type.getId()).isNull();
        assertThat(type.getTitle()).isNull();
        assertThat(type.getDescription()).isNull();
        assertThat(type.getFeeAmount()).isNull();
        assertThat(type.getDeadlineDays()).isZero();
        assertThat(type.getStatus()).isNull();
        assertThat(type.getUnit()).isNull();
        assertThat(type.getTasks()).isNull();
        assertThat(type.getCreatedAt()).isNull();
        assertThat(type.getUpdatedAt()).isNull();
    }

    @Test
    void parameterizedConstructor_shouldSetFields() {
        UUID id = UUID.randomUUID();
        String title = "Building Permit";
        String description = "Apply for a building permit";
        BigDecimal fee = new BigDecimal("150.00");
        int deadlineDays = 30;
        String status = "ACTIVE";
        String unit = "Urban Planning";

        ProcedureType type = new ProcedureType(id, title, description, fee, deadlineDays, status, unit);

        assertThat(type.getId()).isEqualTo(id);
        assertThat(type.getTitle()).isEqualTo(title);
        assertThat(type.getDescription()).isEqualTo(description);
        assertThat(type.getFeeAmount()).isEqualTo(fee);
        assertThat(type.getDeadlineDays()).isEqualTo(deadlineDays);
        assertThat(type.getStatus()).isEqualTo(status);
        assertThat(type.getUnit()).isEqualTo(unit);
    }

    @Test
    void setters_shouldUpdateFields() {
        ProcedureType type = new ProcedureType();
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();
        ProcedureTask task = new ProcedureTask(UUID.randomUUID(), id, TaskType.FORM, 1, "Step 1", "Description");

        type.setId(id);
        type.setTitle("Trade License");
        type.setDescription("Apply for a trade license");
        type.setFeeAmount(new BigDecimal("75.50"));
        type.setDeadlineDays(15);
        type.setStatus("DRAFT");
        type.setUnit("Commerce Department");
        type.setTasks(List.of(task));
        type.setCreatedAt(now);
        type.setUpdatedAt(now);

        assertThat(type.getId()).isEqualTo(id);
        assertThat(type.getTitle()).isEqualTo("Trade License");
        assertThat(type.getDescription()).isEqualTo("Apply for a trade license");
        assertThat(type.getFeeAmount()).isEqualByComparingTo(new BigDecimal("75.50"));
        assertThat(type.getDeadlineDays()).isEqualTo(15);
        assertThat(type.getStatus()).isEqualTo("DRAFT");
        assertThat(type.getUnit()).isEqualTo("Commerce Department");
        assertThat(type.getTasks()).hasSize(1);
        assertThat(type.getTasks().get(0).getTitle()).isEqualTo("Step 1");
        assertThat(type.getCreatedAt()).isEqualTo(now);
        assertThat(type.getUpdatedAt()).isEqualTo(now);
    }
}
