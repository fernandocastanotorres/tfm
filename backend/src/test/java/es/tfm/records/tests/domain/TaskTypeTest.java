package es.tfm.records.tests.domain;

import es.tfm.records.domain.model.TaskType;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TaskTypeTest {

    @Test
    void taskType_shouldContainExpectedValues() {
        assertThat(TaskType.values()).extracting(TaskType::name)
                .containsExactly("FORM", "UPLOAD", "REVIEW", "SIGNATURE", "RESOLUTION");
    }

    @Test
    void taskType_shouldMapFromString() {
        assertThat(TaskType.valueOf("FORM")).isEqualTo(TaskType.FORM);
        assertThat(TaskType.valueOf("UPLOAD")).isEqualTo(TaskType.UPLOAD);
        assertThat(TaskType.valueOf("REVIEW")).isEqualTo(TaskType.REVIEW);
        assertThat(TaskType.valueOf("SIGNATURE")).isEqualTo(TaskType.SIGNATURE);
        assertThat(TaskType.valueOf("RESOLUTION")).isEqualTo(TaskType.RESOLUTION);
    }
}
