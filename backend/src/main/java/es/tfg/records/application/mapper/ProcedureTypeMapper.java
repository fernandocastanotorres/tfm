package es.tfg.records.application.mapper;

import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.application.dto.*;

import java.util.List;

/**
 * Manual mapper for ProcedureType domain model to DTOs.
 */
public final class ProcedureTypeMapper {

    private ProcedureTypeMapper() {
    }

    public static ProcedureItem toProcedureItem(ProcedureType procedureType, List<ProcedureTaskDto> tasks) {
        return new ProcedureItem(
                procedureType.getId().toString(),
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
     * Currently returns empty list; JSON parsing deferred to a future phase.
     */
    private static List<FormFieldDto> parseFormFields(String formSchema) {
        return formSchema != null ? List.of() : List.of();
    }

    /**
     * Parse JSON upload requirements into UploadRequirementDto list.
     * Currently returns empty list; JSON parsing deferred to a future phase.
     */
    private static List<UploadRequirementDto> parseUploadRequirements(String requirements) {
        return requirements != null ? List.of() : List.of();
    }
}
