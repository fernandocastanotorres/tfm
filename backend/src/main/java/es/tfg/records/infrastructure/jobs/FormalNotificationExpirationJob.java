package es.tfg.records.infrastructure.jobs;

import es.tfg.records.application.service.FormalNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class FormalNotificationExpirationJob {

    private static final Logger log = LoggerFactory.getLogger(FormalNotificationExpirationJob.class);

    private final FormalNotificationService formalNotificationService;

    public FormalNotificationExpirationJob(FormalNotificationService formalNotificationService) {
        this.formalNotificationService = formalNotificationService;
    }

    @Scheduled(fixedDelayString = "${notifications.formal.expiration-check-ms:300000}")
    public void expireDueNotifications() {
        int expired = formalNotificationService.expireDueNotifications();
        if (expired > 0) {
            log.info("Expired {} formal notifications", expired);
        }
    }
}
