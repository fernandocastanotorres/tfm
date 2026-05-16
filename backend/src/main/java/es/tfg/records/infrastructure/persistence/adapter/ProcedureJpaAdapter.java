package es.tfg.records.infrastructure.persistence.adapter;

import es.tfg.records.domain.model.Procedure;
import es.tfg.records.domain.port.ProcedureRepository;
import es.tfg.records.infrastructure.persistence.mapper.ProcedureEntityMapper;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Infrastructure adapter implementing the ProcedureRepository port using Spring Data JPA.
 */
@Component
public class ProcedureJpaAdapter implements ProcedureRepository {

    private final ProcedureJpaRepository jpaRepository;

    public ProcedureJpaAdapter(ProcedureJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Procedure> findByOwnerId(UUID ownerId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var pageResult = jpaRepository.findByOwnerId(ownerId, pageable);
        return ProcedureEntityMapper.toDomainList(pageResult.getContent());
    }

    @Override
    public long countByOwnerId(UUID ownerId) {
        return jpaRepository.countByOwnerId(ownerId);
    }

    @Override
    public Optional<Procedure> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(ProcedureEntityMapper::toDomain);
    }

    @Override
    public Procedure save(Procedure procedure) {
        var entity = ProcedureEntityMapper.toEntity(procedure);
        var saved = jpaRepository.save(entity);
        return ProcedureEntityMapper.toDomain(saved);
    }

    @Override
    public boolean existsById(UUID id) {
        return jpaRepository.existsById(id);
    }
}
