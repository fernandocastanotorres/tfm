package es.tfm.records.infrastructure.audit;

import es.tfm.records.infrastructure.persistence.entity.AuditLogEntity.AuditAction;
import es.tfm.records.infrastructure.persistence.entity.AuditLogEntity.AuditResult;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for publishing security audit events.
 * Events are published asynchronously via Spring's event mechanism.
 */
@Service
public class AuditService {

    private final ApplicationEventPublisher eventPublisher;
    private final HttpServletRequest request;

    public AuditService(ApplicationEventPublisher eventPublisher, HttpServletRequest request) {
        this.eventPublisher = eventPublisher;
        this.request = request;
    }

    public void record(AuditAction action, String resourceType, AuditResult result) {
        record(action, resourceType, null, result, null);
    }

    public void record(AuditAction action, String resourceType, UUID resourceUuid, AuditResult result) {
        record(action, resourceType, resourceUuid, result, null);
    }

    public void record(AuditAction action, String resourceType, AuditResult result, String details) {
        record(action, resourceType, null, result, details);
    }

    public void record(AuditAction action, String resourceType, UUID resourceUuid, AuditResult result, String details) {
        String userId = getCurrentUserId();
        String appContext = resolveAppContext();
        String clientIp = resolveClientIp();

        AuditEvent event = AuditEvent.builder()
                .userId(userId)
                .action(action)
                .resourceType(resourceType)
                .resourceUuid(resourceUuid)
                .clientIp(clientIp)
                .appContext(appContext)
                .result(result)
                .details(details)
                .build();

        eventPublisher.publishEvent(event);
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return null;
    }

    private String resolveAppContext() {
        String path = request.getRequestURI();
        if (path != null) {
            if (path.contains("/admin/") || path.contains("/backoffice/")) {
                return "BACKOFFICE";
            }
            if (path.contains("/citizen/")) {
                return "CITIZEN";
            }
        }
        return "API";
    }

    private String resolveClientIp() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
