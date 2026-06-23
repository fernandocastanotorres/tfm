package es.tfm.records.application.exception;

/**
 * Thrown when a request conflicts with the current state of a resource.
 */
public class ConflictException extends RecordsException {

    public ConflictException(String resource, String reason) {
        super(
                String.format("Conflict on %s: %s", resource, reason),
                resource.toUpperCase() + "-409-STATE_INVALID",
                409
        );
    }

    public ConflictException(String resource, String reason, String errorCodeSuffix) {
        super(
                String.format("Conflict on %s: %s", resource, reason),
                resource.toUpperCase() + "-409-" + errorCodeSuffix,
                409
        );
    }
}
