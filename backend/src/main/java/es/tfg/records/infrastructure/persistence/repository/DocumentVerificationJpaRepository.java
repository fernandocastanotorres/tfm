package es.tfg.records.infrastructure.persistence.repository;

import es.tfg.records.infrastructure.persistence.entity.DocumentVerificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DocumentVerificationJpaRepository extends JpaRepository<DocumentVerificationEntity, UUID> {
    Optional<DocumentVerificationEntity> findByDocumentId(UUID documentId);
    Optional<DocumentVerificationEntity> findByCsvCode(String csvCode);
    boolean existsByCsvCode(String csvCode);
}
