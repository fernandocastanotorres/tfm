package es.tfg.records.domain.model;

/**
 * Represents the type of a workflow task within a procedure.
 */
public enum TaskType {
    FORM,
    UPLOAD,
    REVIEW,
    SIGNATURE,
    RESOLUTION;

    public static TaskType fromString(String value) {
        try {
            return TaskType.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid task type: " + value + ". Valid values: FORM, UPLOAD, REVIEW, SIGNATURE, RESOLUTION");
        }
    }
}
