package es.tfg.records.tests.mapper;

import es.tfg.records.application.dto.*;
import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.model.TaskType;
import es.tfg.records.application.mapper.ProcedureTypeMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProcedureTypeMapperTest {

    @Test
    void toProcedureItem_shouldMapCorrectly() {
        ProcedureType type = new ProcedureType();
        type.setId(UUID.randomUUID());
        type.setTitle("Birth Certificate");
        type.setDescription("Application for birth certificate");
        type.setFeeAmount(BigDecimal.TEN);
        type.setDeadlineDays(15);
        type.setStatus("ACTIVE");
        type.setUnit("Civil Registry");

        List<ProcedureTaskDto> tasks = List.of(
                new ProcedureTaskDto("t1", "FORM", "Task 1", "Desc 1", List.of(), List.of())
        );

        ProcedureItem result = ProcedureTypeMapper.toProcedureItem(type, tasks);

        assertThat(result.id()).isEqualTo(type.getId().toString());
        assertThat(result.slug()).isEqualTo("birth-certificate");
        assertThat(result.title()).isEqualTo("Birth Certificate");
        assertThat(result.description()).isEqualTo("Application for birth certificate");
        assertThat(result.feeAmount()).isEqualTo(BigDecimal.TEN);
        assertThat(result.deadlineDays()).isEqualTo(15);
        assertThat(result.status()).isEqualTo("ACTIVE");
        assertThat(result.unit()).isEqualTo("Civil Registry");
        assertThat(result.tasks()).hasSize(1);
    }

    @Test
    void toProcedureTaskDto_shouldMapBasicFields() {
        ProcedureTask task = new ProcedureTask();
        task.setId(UUID.randomUUID());
        task.setType(TaskType.FORM);
        task.setTitle("Fill Form");
        task.setDescription("Complete the required fields");
        task.setFormSchema(null);
        task.setUploadRequirements(null);

        ProcedureTaskDto result = ProcedureTypeMapper.toProcedureTaskDto(task);

        assertThat(result.id()).isEqualTo(task.getId().toString());
        assertThat(result.type()).isEqualTo("FORM");
        assertThat(result.title()).isEqualTo("Fill Form");
        assertThat(result.fields()).isEmpty();
        assertThat(result.uploadRequirements()).isEmpty();
    }

    @Test
    void toProcedureTaskDto_shouldParseFormFields() {
        ProcedureTask task = new ProcedureTask();
        task.setId(UUID.randomUUID());
        task.setType(TaskType.FORM);
        task.setTitle("Form Task");
        task.setDescription("Desc");
        task.setFormSchema("""
                [{"id":"f1","label":"Full Name","placeholder":"Enter name","required":true,"type":"text","options":[]}]
                """);

        ProcedureTaskDto result = ProcedureTypeMapper.toProcedureTaskDto(task);

        assertThat(result.fields()).hasSize(1);
        assertThat(result.fields().get(0).label()).isEqualTo("Full Name");
        assertThat(result.fields().get(0).required()).isTrue();
    }

    @Test
    void toProcedureTaskDto_shouldParseUploadRequirements() {
        ProcedureTask task = new ProcedureTask();
        task.setId(UUID.randomUUID());
        task.setType(TaskType.UPLOAD);
        task.setTitle("Upload Task");
        task.setDescription("Desc");
        task.setUploadRequirements("""
                [{"id":"r1","label":"ID Copy","required":true}]
                """);

        ProcedureTaskDto result = ProcedureTypeMapper.toProcedureTaskDto(task);

        assertThat(result.uploadRequirements()).hasSize(1);
        assertThat(result.uploadRequirements().get(0).label()).isEqualTo("ID Copy");
        assertThat(result.uploadRequirements().get(0).required()).isTrue();
    }

    @Test
    void toProcedureTaskDto_shouldHandleInvalidJson() {
        ProcedureTask task = new ProcedureTask();
        task.setId(UUID.randomUUID());
        task.setType(TaskType.FORM);
        task.setFormSchema("invalid-json");
        task.setUploadRequirements("invalid-json");

        ProcedureTaskDto result = ProcedureTypeMapper.toProcedureTaskDto(task);

        assertThat(result.fields()).isEmpty();
        assertThat(result.uploadRequirements()).isEmpty();
    }
}
