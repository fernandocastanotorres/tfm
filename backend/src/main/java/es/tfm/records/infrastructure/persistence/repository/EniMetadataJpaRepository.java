package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.infrastructure.persistence.entity.EniMetadataEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EniMetadataJpaRepository extends JpaRepository<EniMetadataEntity, UUID> {
    Optional<EniMetadataEntity> findByResourceTypeAndResourceId(String resourceType, UUID resourceId);
}
