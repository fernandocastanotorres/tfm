package es.tfm.records.tests.domain;

import es.tfm.records.domain.model.CaseStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CaseStatusTest {

    @Test
    void caseStatus_shouldHaveAllExpectedValues() {
        // Then - verify all expected status values exist
        assertThat(CaseStatus.values()).hasSize(7);
    }

    @Test
    void caseStatus_shouldContainDraftStatus() {
        // Then
        assertThat(CaseStatus.DRAFT.name()).isEqualTo("DRAFT");
    }

    @Test
    void caseStatus_shouldContainAllWorkflowStatuses() {
        // Given/Then
        assertThat(CaseStatus.values())
                .extracting(CaseStatus::name)
                .containsExactly(
                        "DRAFT",
                        "SUBMITTED",
                        "IN_REVIEW",
                        "AMENDMENT_REQUIRED",
                        "RESUBMITTED",
                        "APPROVED",
                        "REJECTED"
                );
    }

    @Test
    void caseStatus_shouldMapFromString() {
        // When
        CaseStatus draft = CaseStatus.valueOf("DRAFT");
        CaseStatus submitted = CaseStatus.valueOf("SUBMITTED");
        CaseStatus approved = CaseStatus.valueOf("APPROVED");

        // Then
        assertThat(draft).isEqualTo(CaseStatus.DRAFT);
        assertThat(submitted).isEqualTo(CaseStatus.SUBMITTED);
        assertThat(approved).isEqualTo(CaseStatus.APPROVED);
    }

    @Test
    void caseStatus_shouldHaveCorrectOrdinalOrder() {
        // Then - verify ordinal order matches logical workflow
        assertThat(CaseStatus.DRAFT.ordinal()).isEqualTo(0);
        assertThat(CaseStatus.SUBMITTED.ordinal()).isEqualTo(1);
        assertThat(CaseStatus.IN_REVIEW.ordinal()).isEqualTo(2);
        assertThat(CaseStatus.AMENDMENT_REQUIRED.ordinal()).isEqualTo(3);
        assertThat(CaseStatus.RESUBMITTED.ordinal()).isEqualTo(4);
        assertThat(CaseStatus.APPROVED.ordinal()).isEqualTo(5);
        assertThat(CaseStatus.REJECTED.ordinal()).isEqualTo(6);
    }
}