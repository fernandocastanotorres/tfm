package es.tfg.records.application.exception;

/**
 * Thrown when authentication fails (invalid credentials, expired token, etc.).
 */
public class AuthenticationException extends RecordsException {

    public AuthenticationException(String code, String message) {
        super(message, code, 401);
    }
}
