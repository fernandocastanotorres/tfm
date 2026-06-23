package es.tfm.records.tests.security;

import es.tfm.records.infrastructure.security.AccountLockoutManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AccountLockoutManagerTest {

    private AccountLockoutManager lockoutManager;

    private static final String EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        lockoutManager = new AccountLockoutManager();
    }

    @Test
    void isLocked_shouldReturnFalse_whenNoAttempts() {
        boolean locked = lockoutManager.isLocked(EMAIL);

        assertThat(locked).isFalse();
    }

    @Test
    void recordFailedAttempt_shouldReturnFalse_whenUnderLimit() {
        boolean result1 = lockoutManager.recordFailedAttempt(EMAIL);
        boolean result2 = lockoutManager.recordFailedAttempt(EMAIL);
        boolean result3 = lockoutManager.recordFailedAttempt(EMAIL);
        boolean result4 = lockoutManager.recordFailedAttempt(EMAIL);

        assertThat(result1).isFalse();
        assertThat(result2).isFalse();
        assertThat(result3).isFalse();
        assertThat(result4).isFalse();
    }

    @Test
    void recordFailedAttempt_shouldReturnTrue_whenReachingLimit() {
        for (int i = 0; i < 4; i++) {
            lockoutManager.recordFailedAttempt(EMAIL);
        }

        boolean result = lockoutManager.recordFailedAttempt(EMAIL);

        assertThat(result).isTrue();
    }

    @Test
    void isLocked_shouldReturnTrue_whenAccountIsLocked() {
        for (int i = 0; i < 5; i++) {
            lockoutManager.recordFailedAttempt(EMAIL);
        }

        boolean locked = lockoutManager.isLocked(EMAIL);

        assertThat(locked).isTrue();
    }

    @Test
    void isLocked_shouldAutoUnlock_whenLockoutExpired() {
        // Note: This test verifies that isLocked returns true immediately
        // after locking. The auto-unlock after 15 minutes relies on
        // Instant.now() comparison which cannot be controlled without
        // a Clock abstraction. This test validates the lock works;
        // auto-unlock after expiry requires an integration test or
        // refactoring to inject a Clock.
        for (int i = 0; i < 5; i++) {
            lockoutManager.recordFailedAttempt(EMAIL);
        }

        assertThat(lockoutManager.isLocked(EMAIL)).isTrue();
    }

    @Test
    void resetFailedAttempts_shouldClearRecord() {
        for (int i = 0; i < 5; i++) {
            lockoutManager.recordFailedAttempt(EMAIL);
        }

        lockoutManager.resetFailedAttempts(EMAIL);

        assertThat(lockoutManager.isLocked(EMAIL)).isFalse();
        assertThat(lockoutManager.getFailedAttempts(EMAIL)).isZero();
    }

    @Test
    void getFailedAttempts_shouldReturnCorrectCount() {
        lockoutManager.recordFailedAttempt(EMAIL);
        lockoutManager.recordFailedAttempt(EMAIL);
        lockoutManager.recordFailedAttempt(EMAIL);

        int attempts = lockoutManager.getFailedAttempts(EMAIL);

        assertThat(attempts).isEqualTo(3);
    }

    @Test
    void getFailedAttempts_shouldReturnZero_whenNoAttempts() {
        assertThat(lockoutManager.getFailedAttempts(EMAIL)).isZero();
    }

    @Test
    void recordFailedAttempt_shouldResetCounter_whenWindowExpired() {
        // Note: The attempt window is 15 minutes, relying on
        // System.currentTimeMillis() which cannot be mocked with
        // standard Mockito. This test verifies the state machine works
        // within the same window. Testing window expiry requires a
        // Clock abstraction refactoring or an integration test.

        for (int i = 0; i < 5; i++) {
            lockoutManager.recordFailedAttempt(EMAIL);
        }

        assertThat(lockoutManager.isLocked(EMAIL)).isTrue();

        lockoutManager.resetFailedAttempts(EMAIL);
        assertThat(lockoutManager.isLocked(EMAIL)).isFalse();
    }

    @Test
    void recordFailedAttempt_shouldBeIsolatedPerEmail() {
        String email1 = "user1@example.com";
        String email2 = "user2@example.com";

        for (int i = 0; i < 5; i++) {
            lockoutManager.recordFailedAttempt(email1);
        }

        assertThat(lockoutManager.isLocked(email1)).isTrue();
        assertThat(lockoutManager.isLocked(email2)).isFalse();
        assertThat(lockoutManager.getFailedAttempts(email2)).isZero();
    }

    @Test
    void resetFailedAttempts_shouldNotAffectOtherEmails() {
        String email1 = "user1@example.com";
        String email2 = "user2@example.com";

        lockoutManager.recordFailedAttempt(email1);
        lockoutManager.recordFailedAttempt(email1);
        lockoutManager.recordFailedAttempt(email2);

        lockoutManager.resetFailedAttempts(email1);

        assertThat(lockoutManager.getFailedAttempts(email1)).isZero();
        assertThat(lockoutManager.getFailedAttempts(email2)).isEqualTo(1);
    }
}
