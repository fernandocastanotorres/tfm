package es.tfm.records.domain.model;

/**
 * Represents the lifecycle status of a case (expediente).
 */
public enum CaseStatus {
    DRAFT,
    SUBMITTED,
    IN_REVIEW,
    AMENDMENT_REQUIRED,
    RESUBMITTED,
    APPROVED,
    REJECTED
}
