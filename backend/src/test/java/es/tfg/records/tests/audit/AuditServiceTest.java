package es.tfg.records.tests.audit;

import es.tfg.records.infrastructure.audit.AuditEvent;
import es.tfg.records.infrastructure.audit.AuditService;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity.AuditAction;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity.AuditResult;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuditServiceTest {

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private HttpServletRequest request;

    @Mock
    private Authentication authentication;

    @Captor
    private ArgumentCaptor<AuditEvent> eventCaptor;

    private AuditService auditService;

    private static final String USER_ID = "user-123";
    private static final String CLIENT_IP = "192.168.1.1";

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(USER_ID);
        when(authentication.getPrincipal()).thenReturn(USER_ID);
        when(request.getRemoteAddr()).thenReturn(CLIENT_IP);
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);

        auditService = new AuditService(eventPublisher, request);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void record_shouldPublishEvent_withAllFields() {
        UUID resourceUuid = UUID.randomUUID();

        auditService.record(AuditAction.LOGIN, "USER", resourceUuid, AuditResult.SUCCESS, "Login exitoso");

        verifyEvent(event -> {
            assertThat(event.userId()).isEqualTo(USER_ID);
            assertThat(event.action()).isEqualTo(AuditAction.LOGIN);
            assertThat(event.resourceType()).isEqualTo("USER");
            assertThat(event.resourceUuid()).isEqualTo(resourceUuid);
            assertThat(event.result()).isEqualTo(AuditResult.SUCCESS);
            assertThat(event.details()).isEqualTo("Login exitoso");
            assertThat(event.clientIp()).isEqualTo(CLIENT_IP);
        });
    }

    @Test
    void record_shouldPublishEvent_withoutResourceUuid() {
        auditService.record(AuditAction.DELETE, "DOCUMENT", AuditResult.SUCCESS);

        verifyEvent(event -> {
            assertThat(event.userId()).isEqualTo(USER_ID);
            assertThat(event.action()).isEqualTo(AuditAction.DELETE);
            assertThat(event.resourceType()).isEqualTo("DOCUMENT");
            assertThat(event.resourceUuid()).isNull();
            assertThat(event.result()).isEqualTo(AuditResult.SUCCESS);
            assertThat(event.details()).isNull();
        });
    }

    @Test
    void record_shouldPublishEvent_withoutDetails() {
        UUID resourceUuid = UUID.randomUUID();

        auditService.record(AuditAction.UPDATE, "CASE", resourceUuid, AuditResult.FAILURE);

        verifyEvent(event -> {
            assertThat(event.userId()).isEqualTo(USER_ID);
            assertThat(event.action()).isEqualTo(AuditAction.UPDATE);
            assertThat(event.resourceType()).isEqualTo("CASE");
            assertThat(event.resourceUuid()).isEqualTo(resourceUuid);
            assertThat(event.result()).isEqualTo(AuditResult.FAILURE);
            assertThat(event.details()).isNull();
        });
    }

    @Test
    void record_shouldPublishEvent_withOnlyActionResourceAndResult() {
        auditService.record(AuditAction.VIEW, "TRANSPARENCY", AuditResult.SUCCESS);

        verifyEvent(event -> {
            assertThat(event.action()).isEqualTo(AuditAction.VIEW);
            assertThat(event.resourceType()).isEqualTo("TRANSPARENCY");
            assertThat(event.resourceUuid()).isNull();
            assertThat(event.result()).isEqualTo(AuditResult.SUCCESS);
            assertThat(event.details()).isNull();
        });
    }

    @Test
    void record_shouldResolveAppContext_forBackofficePaths() {
        when(request.getRequestURI()).thenReturn("/api/admin/users");

        auditService.record(AuditAction.VIEW, "USER", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.appContext()).isEqualTo("BACKOFFICE"));
    }

    @Test
    void record_shouldResolveAppContext_forBackofficePathsWithBackoffice() {
        when(request.getRequestURI()).thenReturn("/api/backoffice/config");

        auditService.record(AuditAction.UPDATE, "CONFIG", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.appContext()).isEqualTo("BACKOFFICE"));
    }

    @Test
    void record_shouldResolveAppContext_forCitizenPaths() {
        when(request.getRequestURI()).thenReturn("/api/citizen/procedures");

        auditService.record(AuditAction.VIEW, "PROCEDURE", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.appContext()).isEqualTo("CITIZEN"));
    }

    @Test
    void record_shouldResolveAppContext_forApiPaths() {
        when(request.getRequestURI()).thenReturn("/api/public/info");

        auditService.record(AuditAction.VIEW, "INFO", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.appContext()).isEqualTo("API"));
    }

    @Test
    void record_shouldResolveAppContext_forApiPaths_whenNoMatch() {
        when(request.getRequestURI()).thenReturn("/api/health");

        auditService.record(AuditAction.VIEW, "HEALTH", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.appContext()).isEqualTo("API"));
    }

    @Test
    void record_shouldResolveClientIp_fromXForwardedFor() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("10.0.0.1, 192.168.1.1");

        auditService.record(AuditAction.LOGIN, "USER", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.clientIp()).isEqualTo("10.0.0.1"));
    }

    @Test
    void record_shouldResolveClientIp_fromXRealIp() {
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn("10.0.0.5");

        auditService.record(AuditAction.LOGIN, "USER", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.clientIp()).isEqualTo("10.0.0.5"));
    }

    @Test
    void record_shouldResolveClientIp_fromRemoteAddr() {
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("10.0.0.9");

        auditService.record(AuditAction.LOGIN, "USER", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.clientIp()).isEqualTo("10.0.0.9"));
    }

    @Test
    void record_shouldResolveClientIp_whenXForwardedForIsEmpty() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("");
        when(request.getHeader("X-Real-IP")).thenReturn("10.0.0.5");

        auditService.record(AuditAction.LOGIN, "USER", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.clientIp()).isEqualTo("10.0.0.5"));
    }

    @Test
    void record_shouldHandleNullUserId_whenNotAuthenticated() {
        when(authentication.isAuthenticated()).thenReturn(false);

        auditService.record(AuditAction.VIEW, "PUBLIC", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.userId()).isNull());
    }

    @Test
    void record_shouldHandleNullUserId_whenAnonymousUser() {
        when(authentication.getPrincipal()).thenReturn("anonymousUser");

        auditService.record(AuditAction.VIEW, "PUBLIC", AuditResult.SUCCESS);

        verifyEvent(event -> assertThat(event.userId()).isNull());
    }

    private void verifyEvent(java.util.function.Consumer<AuditEvent> assertions) {
        java.util.List<AuditEvent> events = captureEvents();
        assertThat(events).hasSize(1);
        assertions.accept(events.get(0));
    }

    private java.util.List<AuditEvent> captureEvents() {
        // Use the method reference approach to capture events from the publisher
        // Since MockitoExtension doesn't reinit ArgumentCaptor between verify calls
        // we use this helper
        org.mockito.Mockito.verify(eventPublisher).publishEvent(eventCaptor.capture());
        return eventCaptor.getAllValues();
    }
}
