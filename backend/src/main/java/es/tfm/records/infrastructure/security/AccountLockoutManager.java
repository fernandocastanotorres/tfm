package es.tfm.records.infrastructure.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks failed login attempts and enforces account lockout.
 * After 5 failed attempts within 15 minutes, the account is locked for 15 minutes.
 * Thread-safe using ConcurrentHashMap.
 */
@Component
public class AccountLockoutManager {

    private static final Logger log = LoggerFactory.getLogger(AccountLockoutManager.class);

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
    private static final long ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

    private final Map<String, LoginAttemptRecord> failedAttempts = new ConcurrentHashMap<>();

    /**
     * Records a failed login attempt for the given email.
     * Returns true if the account is now locked.
     */
    public boolean recordFailedAttempt(String email) {
        LoginAttemptRecord record = failedAttempts.computeIfAbsent(email, k -> new LoginAttemptRecord());
        synchronized (record) {
            record.pruneOldAttempts();
            record.attempts++;
            record.lastAttemptAt = Instant.now();

            if (record.attempts >= MAX_FAILED_ATTEMPTS) {
                record.lockedUntil = Instant.now().plusMillis(LOCKOUT_DURATION_MS);
                log.warn("Account locked for {} after {} failed attempts", email, record.attempts);
                return true;
            }
            return false;
        }
    }

    /**
     * Resets the failed attempt counter for the given email (called on successful login).
     */
    public void resetFailedAttempts(String email) {
        failedAttempts.remove(email);
        log.debug("Failed attempts reset for {}", email);
    }

    /**
     * Checks if the account is currently locked.
     * Automatically unlocks if the lockout period has expired.
     */
    public boolean isLocked(String email) {
        LoginAttemptRecord record = failedAttempts.get(email);
        if (record == null) {
            return false;
        }

        synchronized (record) {
            if (record.lockedUntil == null) {
                return false;
            }

            if (Instant.now().isAfter(record.lockedUntil)) {
                record.lockedUntil = null;
                record.attempts = 0;
                log.info("Account auto-unlocked for {}", email);
                return false;
            }

            long remainingMs = record.lockedUntil.toEpochMilli() - Instant.now().toEpochMilli();
            log.warn("Account locked for {}. {} remaining seconds", email, remainingMs / 1000);
            return true;
        }
    }

    /**
     * Returns the number of failed attempts for the given email.
     */
    public int getFailedAttempts(String email) {
        LoginAttemptRecord record = failedAttempts.get(email);
        if (record == null) {
            return 0;
        }
        synchronized (record) {
            record.pruneOldAttempts();
            return record.attempts;
        }
    }

    private static class LoginAttemptRecord {
        int attempts = 0;
        Instant lastAttemptAt;
        Instant lockedUntil;
        long windowStart = System.currentTimeMillis();

        void pruneOldAttempts() {
            long now = System.currentTimeMillis();
            if (now - windowStart > ATTEMPT_WINDOW_MS) {
                attempts = 0;
                windowStart = now;
                lockedUntil = null;
            }
        }
    }
}
