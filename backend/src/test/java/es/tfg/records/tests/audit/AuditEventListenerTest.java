package es.tfg.records.tests.audit;

import es.tfg.records.infrastructure.audit.AuditEvent;
import es.tfg.records.infrastructure.audit.AuditEventListener;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity.AuditAction;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity.AuditResult;
import es.tfg.records.infrastructure.persistence.repository.AuditLogJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuditEventListenerTest {

    @Mock
    private AuditLogJpaRepository auditLogRepository;

    @Captor
    private ArgumentCaptor<AuditLogEntity> entityCaptor;

    private AuditEventListener listener;

    @BeforeEach
    void setUp() {
        listener = new AuditEventListener(auditLogRepository);
    }

    @Test
    void onAuditEvent_shouldSaveEntity() {
        UUID resourceUuid = UUID.randomUUID();
        AuditEvent event = AuditEvent.builder()
                .userId("user-123")
                .action(AuditAction.LOGIN)
                .resourceType("USER")
                .resourceUuid(resourceUuid)
                .clientIp("192.168.1.1")
                .appContext("BACKOFFICE")
                .result(AuditResult.SUCCESS)
                .details("Login exitoso")
                .build();

        listener.onAuditEvent(event);

        verify(auditLogRepository).save(entityCaptor.capture());
        AuditLogEntity saved = entityCaptor.getValue();

        assertThat(saved.getUserId()).isEqualTo("user-123");
        assertThat(saved.getAction()).isEqualTo(AuditAction.LOGIN);
        assertThat(saved.getResourceType()).isEqualTo("USER");
        assertThat(saved.getResourceUuid()).isEqualTo(resourceUuid);
        assertThat(saved.getClientIp()).isEqualTo("192.168.1.1");
        assertThat(saved.getAppContext()).isEqualTo("BACKOFFICE");
        assertThat(saved.getResult()).isEqualTo(AuditResult.SUCCESS);
        assertThat(saved.getDetails()).isEqualTo("Login exitoso");
        assertThat(saved.getId()).isNotNull();
    }

    @Test
    void onAuditEvent_shouldHandleNullOptionals() {
        AuditEvent event = AuditEvent.builder()
                .userId("user-456")
                .action(AuditAction.VIEW)
                .resourceType("DOCUMENT")
                .clientIp("10.0.0.1")
                .appContext("CITIZEN")
                .result(AuditResult.FAILURE)
                .build();

        listener.onAuditEvent(event);

        verify(auditLogRepository).save(entityCaptor.capture());
        AuditLogEntity saved = entityCaptor.getValue();

        assertThat(saved.getUserId()).isEqualTo("user-456");
        assertThat(saved.getAction()).isEqualTo(AuditAction.VIEW);
        assertThat(saved.getResourceType()).isEqualTo("DOCUMENT");
        assertThat(saved.getResourceUuid()).isNull();
        assertThat(saved.getClientIp()).isEqualTo("10.0.0.1");
        assertThat(saved.getAppContext()).isEqualTo("CITIZEN");
        assertThat(saved.getResult()).isEqualTo(AuditResult.FAILURE);
        assertThat(saved.getDetails()).isNull();
    }

    @Test
    void onAuditEvent_shouldHandleException_gracefully() {
        AuditEvent event = AuditEvent.builder()
                .userId("user-789")
                .action(AuditAction.UPDATE)
                .resourceType("CASE")
                .clientIp("172.16.0.1")
                .appContext("API")
                .result(AuditResult.SUCCESS)
                .build();

        doThrow(new RuntimeException("Database connection failed"))
                .when(auditLogRepository).save(any(AuditLogEntity.class));

        assertThatCode(() -> listener.onAuditEvent(event))
                .doesNotThrowAnyException();
    }
}
