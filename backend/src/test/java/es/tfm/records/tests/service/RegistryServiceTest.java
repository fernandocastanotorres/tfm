package es.tfm.records.tests.service;

import es.tfm.records.application.service.RegistryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegistryServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    private RegistryService registryService;

    private static final String UNIT_CODE = "GEN";
    private static final int YEAR = 2026;

    @BeforeEach
    void setUp() {
        registryService = new RegistryService(jdbcTemplate);
    }

    @Test
    void generateEntryNumber_shouldFormatCorrectly() {
        Instant now = Instant.parse("2026-05-29T10:00:00Z");
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), anyString(), anyInt()))
                .thenReturn(1L);

        String result = registryService.generateEntryNumber(UNIT_CODE, now);

        assertThat(result).isEqualTo("RE/GEN/2026/000001");
    }

    @Test
    void generateEntryNumber_shouldHandleNullResult() {
        Instant now = Instant.parse("2026-05-29T10:00:00Z");
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), anyString(), anyInt()))
                .thenReturn(null);

        String result = registryService.generateEntryNumber(UNIT_CODE, now);

        assertThat(result).isEqualTo("RE/GEN/2026/000001");
    }

    @Test
    void generateExitNumber_shouldFormatCorrectly() {
        Instant now = Instant.parse("2026-05-29T10:00:00Z");
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), anyString(), anyInt()))
                .thenReturn(42L);

        String result = registryService.generateExitNumber(UNIT_CODE, now);

        assertThat(result).isEqualTo("RS/GEN/2026/000042");
    }

    @Test
    void generateRecordNumber_shouldFormatCorrectly() {
        Instant now = Instant.parse("2026-05-29T10:00:00Z");
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), anyString(), anyInt()))
                .thenReturn(7L);

        String result = registryService.generateRecordNumber(UNIT_CODE, now);

        assertThat(result).isEqualTo("EXP/GEN/2026/000007");
    }
}
