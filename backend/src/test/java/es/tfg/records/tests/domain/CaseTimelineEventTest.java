package es.tfg.records.tests.domain;

import es.tfg.records.domain.model.CaseTimelineEvent;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class CaseTimelineEventTest {

    @Test
    void defaultConstructor_shouldCreateEmptyEvent() {
        CaseTimelineEvent event = new CaseTimelineEvent();
        assertThat(event.getId()).isNull();
        assertThat(event.getProcedureId()).isNull();
        assertThat(event.getTitle()).isNull();
        assertThat(event.getDescription()).isNull();
        assertThat(event.getDate()).isNull();
        assertThat(event.getCreatedAt()).isNull();
    }

    @Test
    void parameterizedConstructor_shouldSetFields() {
        UUID id = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        String title = "Case Submitted";
        String description = "Case was submitted for review";
        Instant date = Instant.now();

        CaseTimelineEvent event = new CaseTimelineEvent(id, procedureId, title, description, date);

        assertThat(event.getId()).isEqualTo(id);
        assertThat(event.getProcedureId()).isEqualTo(procedureId);
        assertThat(event.getTitle()).isEqualTo(title);
        assertThat(event.getDescription()).isEqualTo(description);
        assertThat(event.getDate()).isEqualTo(date);
    }

    @Test
    void setters_shouldUpdateFields() {
        CaseTimelineEvent event = new CaseTimelineEvent();
        UUID id = UUID.randomUUID();
        UUID procedureId = UUID.randomUUID();
        Instant now = Instant.now();

        event.setId(id);
        event.setProcedureId(procedureId);
        event.setTitle("Amendment Requested");
        event.setDescription("Additional documents required");
        event.setDate(now);
        event.setCreatedAt(now);

        assertThat(event.getId()).isEqualTo(id);
        assertThat(event.getProcedureId()).isEqualTo(procedureId);
        assertThat(event.getTitle()).isEqualTo("Amendment Requested");
        assertThat(event.getDescription()).isEqualTo("Additional documents required");
        assertThat(event.getDate()).isEqualTo(now);
        assertThat(event.getCreatedAt()).isEqualTo(now);
    }
}
