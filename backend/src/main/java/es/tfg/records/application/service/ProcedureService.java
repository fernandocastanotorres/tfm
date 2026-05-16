package es.tfg.records.application.service;

import es.tfg.records.application.dto.ProcedureItem;
import es.tfg.records.application.dto.ProcedureTaskDto;

import java.util.List;

/**
 * Application service port for procedure catalog operations.
 */
public interface ProcedureService {

    List<ProcedureItem> listAllProcedures();

    ProcedureItem getProcedureBySlug(String slug);

    List<ProcedureTaskDto> getFormSchema(String slug);

    List<ProcedureTaskDto> getTaskSchema(String slug, String taskId);
}
