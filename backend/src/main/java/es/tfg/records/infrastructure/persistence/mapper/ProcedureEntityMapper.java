package es.tfg.records.infrastructure.persistence.mapper;

import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.Procedure;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;

import java.util.ArrayList;
import java.util.List;

/**
 * Mapper between JPA ProcedureEntity and domain Procedure model.
 */
public final class ProcedureEntityMapper {

    private ProcedureEntityMapper() {
    }

    public static Procedure toDomain(ProcedureEntity entity) {
        if (entity == null) return null;
        Procedure procedure = new Procedure();
        procedure.setId(entity.getId());
        procedure.setProcedureTypeId(entity.getProcedureTypeId());
        procedure.setOwnerId(entity.getOwnerId());
        procedure.setTitle(entity.getTitle());
        procedure.setStatus(entity.getStatus());
        procedure.setFormData(entity.getFormData());
        procedure.setAssignedUnit(entity.getAssignedUnit());
        procedure.setUnitCode(entity.getUnitCode());
        procedure.setProcessInstanceId(entity.getProcessInstanceId());
        procedure.setSubmittedAt(entity.getSubmittedAt());
        procedure.setRecordNumber(entity.getRecordNumber());
        procedure.setCreatedAt(entity.getCreatedAt());
        procedure.setUpdatedAt(entity.getUpdatedAt());
        return procedure;
    }

    public static ProcedureEntity toEntity(Procedure domain) {
        if (domain == null) return null;
        ProcedureEntity entity = new ProcedureEntity();
        entity.setId(domain.getId());
        entity.setProcedureTypeId(domain.getProcedureTypeId());
        entity.setOwnerId(domain.getOwnerId());
        entity.setTitle(domain.getTitle());
        entity.setStatus(domain.getStatus());
        entity.setFormData(domain.getFormData());
        entity.setAssignedUnit(domain.getAssignedUnit());
        entity.setUnitCode(domain.getUnitCode());
        entity.setProcessInstanceId(domain.getProcessInstanceId());
        entity.setSubmittedAt(domain.getSubmittedAt());
        entity.setRecordNumber(domain.getRecordNumber());
        return entity;
    }

    public static List<Procedure> toDomainList(List<ProcedureEntity> entities) {
        if (entities == null) return List.of();
        return entities.stream()
                .map(ProcedureEntityMapper::toDomain)
                .toList();
    }
}
