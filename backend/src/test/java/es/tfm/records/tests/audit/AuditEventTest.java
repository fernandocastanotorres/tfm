package es.tfm.records.tests.audit;

import es.tfm.records.infrastructure.audit.AuditEvent;
import es.tfm.records.infrastructure.persistence.entity.AuditLogEntity.AuditAction;
import es.tfm.records.infrastructure.persistence.entity.AuditLogEntity.AuditResult;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class AuditEventTest {

    @Test
    void builder_shouldCreateAuditEvent_withAllFields() {
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

        assertThat(event.userId()).isEqualTo("user-123");
        assertThat(event.action()).isEqualTo(AuditAction.LOGIN);
        assertThat(event.resourceType()).isEqualTo("USER");
        assertThat(event.resourceUuid()).isEqualTo(resourceUuid);
        assertThat(event.clientIp()).isEqualTo("192.168.1.1");
        assertThat(event.appContext()).isEqualTo("BACKOFFICE");
        assertThat(event.result()).isEqualTo(AuditResult.SUCCESS);
        assertThat(event.details()).isEqualTo("Login exitoso");
    }

    @Test
    void builder_shouldCreateAuditEvent_withMinimalFields() {
        AuditEvent event = AuditEvent.builder()
                .userId("user-123")
                .action(AuditAction.VIEW)
                .resourceType("DOCUMENT")
                .clientIp("10.0.0.1")
                .appContext("CITIZEN")
                .result(AuditResult.SUCCESS)
                .build();

        assertThat(event.userId()).isEqualTo("user-123");
        assertThat(event.action()).isEqualTo(AuditAction.VIEW);
        assertThat(event.resourceType()).isEqualTo("DOCUMENT");
        assertThat(event.resourceUuid()).isNull();
        assertThat(event.clientIp()).isEqualTo("10.0.0.1");
        assertThat(event.appContext()).isEqualTo("CITIZEN");
        assertThat(event.result()).isEqualTo(AuditResult.SUCCESS);
        assertThat(event.details()).isNull();
    }

    @Test
    void builder_shouldReturnSameClass() {
        AuditEvent.AuditEventBuilder builder = AuditEvent.builder()
                .userId("user-1")
                .action(AuditAction.CREATE)
                .resourceType("CASE")
                .clientIp("127.0.0.1")
                .appContext("API")
                .result(AuditResult.SUCCESS);

        assertThat(builder.userId("other")).isInstanceOf(AuditEvent.AuditEventBuilder.class);
        assertThat(builder.action(AuditAction.DELETE)).isInstanceOf(AuditEvent.AuditEventBuilder.class);
        assertThat(builder.resourceType("other")).isInstanceOf(AuditEvent.AuditEventBuilder.class);
        assertThat(builder.clientIp("other")).isInstanceOf(AuditEvent.AuditEventBuilder.class);
        assertThat(builder.appContext("other")).isInstanceOf(AuditEvent.AuditEventBuilder.class);
        assertThat(builder.result(AuditResult.FAILURE)).isInstanceOf(AuditEvent.AuditEventBuilder.class);
        assertThat(builder.details("test")).isInstanceOf(AuditEvent.AuditEventBuilder.class);
    }

    @Test
    void record_shouldBeImmutable() {
        UUID resourceUuid = UUID.randomUUID();
        AuditEvent event = AuditEvent.builder()
                .userId("user-1")
                .action(AuditAction.LOGIN)
                .resourceType("USER")
                .resourceUuid(resourceUuid)
                .clientIp("192.168.1.1")
                .appContext("BACKOFFICE")
                .result(AuditResult.SUCCESS)
                .details("test")
                .build();

        assertThat(event.userId()).isEqualTo("user-1");
        assertThat(event.action()).isEqualTo(AuditAction.LOGIN);
        assertThat(event.resourceType()).isEqualTo("USER");
        assertThat(event.resourceUuid()).isEqualTo(resourceUuid);
        assertThat(event.clientIp()).isEqualTo("192.168.1.1");
        assertThat(event.appContext()).isEqualTo("BACKOFFICE");
        assertThat(event.result()).isEqualTo(AuditResult.SUCCESS);
        assertThat(event.details()).isEqualTo("test");

        String toString = event.toString();
        assertThat(toString).contains("user-1", "LOGIN");
    }

    @Test
    void builder_shouldAllowNullOptionals() {
        AuditEvent event = AuditEvent.builder()
                .userId("user-1")
                .action(AuditAction.VIEW)
                .resourceType("DOCUMENT")
                .clientIp("10.0.0.1")
                .appContext("API")
                .result(AuditResult.SUCCESS)
                .build();

        assertThat(event.resourceUuid()).isNull();
        assertThat(event.details()).isNull();
    }
}
