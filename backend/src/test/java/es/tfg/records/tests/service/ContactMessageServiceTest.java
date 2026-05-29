package es.tfg.records.tests.service;

import es.tfg.records.application.dto.ContactMessageDto;
import es.tfg.records.application.dto.ContactMessageRequest;
import es.tfg.records.application.service.ContactMessageService;
import es.tfg.records.infrastructure.persistence.entity.ContactMessageEntity;
import es.tfg.records.infrastructure.persistence.repository.ContactMessageJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ContactMessageServiceTest {

    @Mock
    private ContactMessageJpaRepository repository;

    private ContactMessageService service;

    private UUID messageId;
    private ContactMessageRequest request;
    private ContactMessageEntity entity;

    @BeforeEach
    void setUp() {
        service = new ContactMessageService(repository);

        messageId = UUID.randomUUID();
        request = new ContactMessageRequest(
                "John Doe",
                "john@example.com",
                "Test Subject",
                "Test Message Body",
                "general"
        );

        entity = new ContactMessageEntity();
        entity.setId(messageId);
        entity.setFullName("John Doe");
        entity.setEmail("john@example.com");
        entity.setSubject("Test Subject");
        entity.setMessage("Test Message Body");
        entity.setCategory("general");
        entity.setRead(false);
        entity.setCreatedAt(Instant.now());
    }

    @Test
    void create_shouldSaveAndReturnDto() {
        when(repository.save(any(ContactMessageEntity.class))).thenReturn(entity);

        ContactMessageDto result = service.create(request);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(messageId);
        assertThat(result.fullName()).isEqualTo("John Doe");
        assertThat(result.email()).isEqualTo("john@example.com");
        assertThat(result.subject()).isEqualTo("Test Subject");
        assertThat(result.message()).isEqualTo("Test Message Body");
        assertThat(result.category()).isEqualTo("general");
        assertThat(result.read()).isFalse();

        verify(repository).save(any(ContactMessageEntity.class));
    }

    @Test
    void findAll_shouldReturnAllMessages() {
        ContactMessageEntity entity2 = new ContactMessageEntity();
        entity2.setId(UUID.randomUUID());
        entity2.setFullName("Jane Doe");
        entity2.setEmail("jane@example.com");
        entity2.setSubject("Another Subject");
        entity2.setMessage("Another Message");
        entity2.setCreatedAt(Instant.now());

        when(repository.findAll()).thenReturn(List.of(entity, entity2));

        List<ContactMessageDto> result = service.findAll();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(ContactMessageDto::fullName)
                .containsExactly("John Doe", "Jane Doe");
    }

    @Test
    void findById_shouldReturnMessage_whenFound() {
        when(repository.findById(messageId)).thenReturn(Optional.of(entity));

        ContactMessageDto result = service.findById(messageId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(messageId);
        assertThat(result.fullName()).isEqualTo("John Doe");
    }

    @Test
    void findById_shouldThrow_whenNotFound() {
        when(repository.findById(messageId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(messageId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Contact message not found");
    }

    @Test
    void markAsRead_shouldSetReadFlag() {
        entity.setRead(false);
        when(repository.findById(messageId)).thenReturn(Optional.of(entity));
        when(repository.save(entity)).thenReturn(entity);

        service.markAsRead(messageId);

        assertThat(entity.isRead()).isTrue();
        assertThat(entity.getReadAt()).isNotNull();
        verify(repository).save(entity);
    }

    @Test
    void markAsRead_shouldNotFail_whenNotFound() {
        when(repository.findById(messageId)).thenReturn(Optional.empty());

        service.markAsRead(messageId);

        verify(repository).findById(messageId);
        verify(repository, never()).save(any());
    }

    @Test
    void markAsRead_shouldNotChange_whenAlreadyRead() {
        entity.setRead(true);
        entity.setReadAt(Instant.now());
        when(repository.findById(messageId)).thenReturn(Optional.of(entity));

        service.markAsRead(messageId);

        verify(repository, never()).save(any());
    }

    @Test
    void countUnread_shouldReturnCorrectCount() {
        when(repository.countByReadFalse()).thenReturn(5L);

        long result = service.countUnread();

        assertThat(result).isEqualTo(5L);
        verify(repository).countByReadFalse();
    }
}
