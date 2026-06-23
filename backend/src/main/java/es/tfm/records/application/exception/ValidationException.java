package es.tfm.records.application.exception;

import java.util.List;

/**
 * Thrown when request validation fails.
 */
public class ValidationException extends RecordsException {

    private final List<ValidationError> errors;

    public ValidationException(List<ValidationError> errors) {
        super("Validation failed", "SYS-400-VALIDATION_ERROR", 400);
        this.errors = errors;
    }

    public List<ValidationError> getErrors() {
        return errors;
    }

    public record ValidationError(String field, String issue) {}
}
