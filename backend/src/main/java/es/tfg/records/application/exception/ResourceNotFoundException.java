package es.tfg.records.application.exception;

/**
 * Thrown when a requested resource is not found.
 */
public class ResourceNotFoundException extends RecordsException {

    public ResourceNotFoundException(String resource, String identifier) {
        super(
                String.format("%s not found with identifier: %s", resource, identifier),
                resource.toUpperCase() + "-404-NOT_FOUND",
                404
        );
    }
}
