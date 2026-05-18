package es.tfg.records.tests.persistence;

import es.tfg.records.infrastructure.persistence.AuditEntityListener;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class AuditEntityListenerTest {

    private AuditEntityListener listener;

    @BeforeEach
    void setUp() {
        listener = new AuditEntityListener();
    }

    @Test
    void prePersist_shouldSetCreatedAtAndUpdatedAt() throws Exception {
        TestEntity entity = new TestEntity();

        listener.prePersist(entity);

        assertThat(entity.createdAt).isNotNull();
        assertThat(entity.updatedAt).isNotNull();
        assertThat(entity.createdAt).isBeforeOrEqualTo(Instant.now());
        assertThat(entity.createdAt).isAfter(Instant.now().minusSeconds(5));
        assertThat(entity.updatedAt).isBeforeOrEqualTo(Instant.now());
        assertThat(entity.updatedAt).isAfter(Instant.now().minusSeconds(5));
    }

    @Test
    void prePersist_shouldNotOverwriteExistingCreatedAt() throws Exception {
        TestEntity entity = new TestEntity();
        Instant existingCreatedAt = Instant.now().minusSeconds(3600);
        entity.createdAt = existingCreatedAt;

        listener.prePersist(entity);

        assertThat(entity.createdAt).isEqualTo(existingCreatedAt);
        assertThat(entity.updatedAt).isNotNull();
    }

    @Test
    void preUpdate_shouldSetUpdatedAt() throws Exception {
        TestEntity entity = new TestEntity();
        Instant previousUpdatedAt = Instant.now().minusSeconds(3600);
        entity.updatedAt = previousUpdatedAt;

        listener.preUpdate(entity);

        assertThat(entity.updatedAt).isAfter(previousUpdatedAt);
        assertThat(entity.updatedAt).isBeforeOrEqualTo(Instant.now());
        assertThat(entity.updatedAt).isAfter(Instant.now().minusSeconds(5));
    }

    @Test
    void prePersist_shouldHandleEntityWithoutAuditFields() {
        NoAuditEntity entity = new NoAuditEntity();

        // Should not throw
        listener.prePersist(entity);
    }

    @Test
    void preUpdate_shouldHandleEntityWithoutUpdatedAtField() {
        NoAuditEntity entity = new NoAuditEntity();

        // Should not throw
        listener.preUpdate(entity);
    }

    // Test entity with audit fields
    static class TestEntity {
        Instant createdAt;
        Instant updatedAt;
    }

    // Test entity without audit fields
    static class NoAuditEntity {
        String name;
    }
}
