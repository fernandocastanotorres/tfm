package es.tfm.records.infrastructure.persistence.adapter;

import es.tfm.records.domain.model.ProcedureType;
import es.tfm.records.domain.port.ProcedureTypeRepository;
import es.tfm.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfm.records.infrastructure.persistence.entity.ProcedureTaskEntity;
import es.tfm.records.domain.model.ProcedureTask;
import es.tfm.records.infrastructure.persistence.repository.ProcedureTaskJpaRepository;
import es.tfm.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Infrastructure adapter implementing the ProcedureTypeRepository port using Spring Data JPA.
 */
@Component
public class ProcedureTypeJpaAdapter implements ProcedureTypeRepository {

    private final ProcedureTypeJpaRepository typeJpaRepository;
    private final ProcedureTaskJpaRepository taskJpaRepository;

    public ProcedureTypeJpaAdapter(ProcedureTypeJpaRepository typeJpaRepository,
                                    ProcedureTaskJpaRepository taskJpaRepository) {
        this.typeJpaRepository = typeJpaRepository;
        this.taskJpaRepository = taskJpaRepository;
    }

    @Override
    public List<ProcedureType> findAll() {
        return typeJpaRepository.findByStatus("ACTIVE").stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<ProcedureType> findById(UUID id) {
        return typeJpaRepository.findById(id)
                .map(this::toDomain);
    }

    private ProcedureType toDomain(ProcedureTypeEntity entity) {
        ProcedureType procedureType = new ProcedureType();
        procedureType.setId(entity.getId());
        procedureType.setTitle(entity.getTitle());
        procedureType.setDescription(entity.getDescription());
        procedureType.setFeeAmount(entity.getFeeAmount());
        procedureType.setDeadlineDays(entity.getDeadlineDays());
        procedureType.setStatus(entity.getStatus());
        procedureType.setUnit(entity.getUnit());
        procedureType.setUnitCode(entity.getUnitCode());
        procedureType.setProcessKey(entity.getProcessKey());
        procedureType.setCreatedAt(entity.getCreatedAt());
        procedureType.setUpdatedAt(entity.getUpdatedAt());

        List<ProcedureTask> tasks = taskJpaRepository
                .findByProcedureTypeIdOrderByOrderIndexAsc(entity.getId())
                .stream()
                .map(this::toTaskDomain)
                .toList();
        procedureType.setTasks(tasks);

        return procedureType;
    }

    private ProcedureTask toTaskDomain(ProcedureTaskEntity entity) {
        ProcedureTask task = new ProcedureTask();
        task.setId(entity.getId());
        task.setProcedureTypeId(entity.getProcedureTypeId());
        task.setType(entity.getType());
        task.setOrderIndex(entity.getOrderIndex());
        task.setTitle(entity.getTitle());
        task.setDescription(entity.getDescription());
        task.setFormSchema(entity.getFormSchema());
        task.setUploadRequirements(entity.getUploadRequirements());
        return task;
    }
}
