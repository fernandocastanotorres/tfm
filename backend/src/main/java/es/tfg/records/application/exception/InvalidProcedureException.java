package es.tfg.records.application.exception;

/**
 * Thrown when a procedure type identifier is invalid or not found during case creation.
 */
public class InvalidProcedureException extends RecordsException {

    public InvalidProcedureException(String identifier) {
        super(
                String.format("Invalid procedure type: %s", identifier),
                "PROC-400-INVALID_PROCEDURE",
                400
        );
    }
}
