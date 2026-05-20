package es.tfg.records.infrastructure.persistence.repository;

import es.tfg.records.infrastructure.persistence.entity.ContactMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ContactMessageJpaRepository extends JpaRepository<ContactMessageEntity, UUID> {

    long countByReadFalse();
}
