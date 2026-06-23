package es.tfm.records.application.service;

import es.tfm.records.application.dto.ContactMessageDto;
import es.tfm.records.application.dto.ContactMessageRequest;
import es.tfm.records.infrastructure.persistence.entity.ContactMessageEntity;
import es.tfm.records.infrastructure.persistence.repository.ContactMessageJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ContactMessageService {

    private final ContactMessageJpaRepository repository;

    public ContactMessageService(ContactMessageJpaRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ContactMessageDto create(ContactMessageRequest request) {
        ContactMessageEntity entity = new ContactMessageEntity();
        entity.setId(UUID.randomUUID());
        entity.setFullName(request.fullName());
        entity.setEmail(request.email());
        entity.setSubject(request.subject());
        entity.setMessage(request.message());
        entity.setCategory(request.category());
        entity.setCreatedAt(Instant.now());

        ContactMessageEntity saved = repository.save(entity);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ContactMessageDto> findAll() {
        return repository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ContactMessageDto findById(UUID id) {
        ContactMessageEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found: " + id));
        return toDto(entity);
    }

    @Transactional
    public void markAsRead(UUID id) {
        repository.findById(id).ifPresent(entity -> {
            if (!entity.isRead()) {
                entity.setRead(true);
                entity.setReadAt(Instant.now());
                repository.save(entity);
            }
        });
    }

    @Transactional(readOnly = true)
    public long countUnread() {
        return repository.countByReadFalse();
    }

    private ContactMessageDto toDto(ContactMessageEntity entity) {
        return new ContactMessageDto(
                entity.getId(),
                entity.getFullName(),
                entity.getEmail(),
                entity.getSubject(),
                entity.getMessage(),
                entity.getCategory(),
                entity.isRead(),
                entity.getCreatedAt()
        );
    }
}
