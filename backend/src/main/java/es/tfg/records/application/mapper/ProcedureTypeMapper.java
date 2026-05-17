package es.tfg.records.application.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.application.dto.*;

import java.util.List;

/**
 * Manual mapper for ProcedureType domain model to DTOs.
 */
public final class ProcedureTypeMapper {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private ProcedureTypeMapper() {
    }

    public static ProcedureItem toProcedureItem(ProcedureType procedureType, List<ProcedureTaskDto> tasks) {
        return new ProcedureItem(
                procedureType.getId().toString(),
                toSlug(procedureType.getTitle()),
                procedureType.getTitle(),
                procedureType.getDescription(),
                procedureType.getFeeAmount(),
                procedureType.getDeadlineDays(),
                procedureType.getStatus(),
                procedureType.getUnit(),
                tasks
        );
    }

    public static ProcedureTaskDto toProcedureTaskDto(ProcedureTask task) {
        return new ProcedureTaskDto(
                task.getId().toString(),
                task.getType().name(),
                task.getTitle(),
                task.getDescription(),
                parseFormFields(task.getFormSchema()),
                parseUploadRequirements(task.getUploadRequirements())
        );
    }

    /**
     * Parse JSON form schema into FormFieldDto list.
     */
    private static List<FormFieldDto> parseFormFields(String formSchema) {
        if (formSchema == null || formSchema.isBlank()) {
            return List.of();
        }
        try {
            return OBJECT_MAPPER.readValue(formSchema, new TypeReference<List<FormFieldDto>>() {});
        } catch (Exception ignored) {
            return List.of();
        }
    }

    /**
     * Parse JSON upload requirements into UploadRequirementDto list.
     */
    private static List<UploadRequirementDto> parseUploadRequirements(String requirements) {
        if (requirements == null || requirements.isBlank()) {
            return List.of();
        }
        try {
            return OBJECT_MAPPER.readValue(requirements, new TypeReference<List<UploadRequirementDto>>() {});
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private static String toSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}
