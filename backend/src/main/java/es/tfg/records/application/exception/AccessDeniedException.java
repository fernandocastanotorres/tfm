package es.tfg.records.application.exception;

/**
 * Thrown when the authenticated user attempts to access a resource they do not own.
 */
public class AccessDeniedException extends RecordsException {

    public AccessDeniedException(String resource, String identifier) {
        super(
                String.format("Access denied to %s: %s", resource, identifier),
                resource.toUpperCase() + "-403-NOT_OWNER",
                403
        );
    }
}
