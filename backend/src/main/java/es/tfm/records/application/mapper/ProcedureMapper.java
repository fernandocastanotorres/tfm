package es.tfm.records.application.mapper;

import es.tfm.records.domain.model.Procedure;
import es.tfm.records.application.dto.CaseItem;
import es.tfm.records.application.dto.CaseDetail;
import es.tfm.records.application.dto.CaseStatusResponse;
import es.tfm.records.application.dto.CaseAttachmentDto;
import es.tfm.records.application.dto.CaseTimelineEventDto;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Manual mapper for Procedure domain model to DTOs.
 */
public final class ProcedureMapper {

    private ProcedureMapper() {
    }

    public static CaseItem toCaseItem(Procedure procedure, String category) {
        return new CaseItem(
                procedure.getId(),
                procedure.getTitle(),
                procedure.getStatus().name(),
                procedure.getUpdatedAt(),
                procedure.getSubmittedAt(),
                category,
                procedure.getAssignedUnit(),
                procedure.getRecordNumber(),
                procedure.getEntryNumber()
        );
    }

    public static CaseDetail toCaseDetail(Procedure procedure,
                                          String category,
                                          String description,
                                          List<CaseTimelineEventDto> timeline,
                                          List<CaseAttachmentDto> attachments,
                                          Map<String, Object> formData) {
        return new CaseDetail(
                procedure.getId(),
                procedure.getTitle(),
                procedure.getStatus().name(),
                category,
                procedure.getAssignedUnit(),
                procedure.getSubmittedAt(),
                description,
                timeline == null ? Collections.emptyList() : timeline,
                attachments == null ? Collections.emptyList() : attachments,
                procedure.getProcedureTypeId(),
                formData,
                procedure.getRecordNumber(),
                procedure.getEntryNumber()
        );
    }

    public static CaseStatusResponse toCaseStatusResponse(Procedure procedure, String currentTask) {
        return new CaseStatusResponse(
                procedure.getId(),
                procedure.getStatus().name(),
                procedure.getUpdatedAt(),
                currentTask,
                procedure.getRecordNumber(),
                procedure.getEntryNumber()
        );
    }
}
