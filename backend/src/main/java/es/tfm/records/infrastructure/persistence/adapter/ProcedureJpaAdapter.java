package es.tfm.records.infrastructure.persistence.adapter;

import es.tfm.records.domain.model.Procedure;
import es.tfm.records.domain.port.ProcedureRepository;
import es.tfm.records.infrastructure.persistence.mapper.ProcedureEntityMapper;
import es.tfm.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
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
