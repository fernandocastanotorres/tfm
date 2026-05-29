package es.tfg.records.tests.jobs;

import es.tfg.records.application.service.FormalNotificationService;
import es.tfg.records.infrastructure.jobs.FormalNotificationExpirationJob;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FormalNotificationExpirationJobTest {

    @Mock
    private FormalNotificationService formalNotificationService;

    @InjectMocks
    private FormalNotificationExpirationJob job;

    @Test
    void expireDueNotifications_shouldCallService() {
        when(formalNotificationService.expireDueNotifications()).thenReturn(5);

        job.expireDueNotifications();

        verify(formalNotificationService, times(1)).expireDueNotifications();
    }

    @Test
    void expireDueNotifications_shouldHandleZeroExpired() {
        when(formalNotificationService.expireDueNotifications()).thenReturn(0);

        job.expireDueNotifications();

        verify(formalNotificationService, times(1)).expireDueNotifications();
    }
}
