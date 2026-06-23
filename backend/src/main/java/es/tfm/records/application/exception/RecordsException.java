package es.tfm.records.application.exception;

/**
 * Base exception for all application-level errors.
 */
public abstract class RecordsException extends RuntimeException {

    private final String errorCode;
    private final int httpStatus;

    protected RecordsException(String message, String errorCode, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    protected RecordsException(String message, String errorCode, int httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}
