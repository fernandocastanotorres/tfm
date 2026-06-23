package es.tfm.records.infrastructure.persistence.repository;

import es.tfm.records.infrastructure.persistence.entity.PublicContentEntryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PublicContentEntryJpaRepository extends JpaRepository<PublicContentEntryEntity, UUID> {

    List<PublicContentEntryEntity> findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc(String entryKind);

    List<PublicContentEntryEntity> findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc(String entryKind);

    List<PublicContentEntryEntity> findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc(String entryKind, String locale);

    Optional<PublicContentEntryEntity> findByEntryKindAndTranslationGroupIdAndLocale(String entryKind, UUID translationGroupId, String locale);

    List<PublicContentEntryEntity> findByEntryKindAndTranslationGroupIdOrderByLocaleAsc(String entryKind, UUID translationGroupId);

    void deleteByEntryKindAndTranslationGroupId(String entryKind, UUID translationGroupId);
}
