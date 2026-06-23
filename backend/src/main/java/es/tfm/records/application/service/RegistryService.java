package es.tfm.records.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;

@Service
public class RegistryService {

    private static final Logger log = LoggerFactory.getLogger(RegistryService.class);

    private final JdbcTemplate jdbcTemplate;

    public RegistryService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateEntryNumber(String unitCode, Instant submittedAt) {
        int year = submittedAt.atZone(ZoneOffset.UTC).getYear();
        Long nextValue = jdbcTemplate.queryForObject(
                """
                INSERT INTO document_registry_counters (registry_type, unit_code, year, last_value)
                VALUES ('ENTRY', ?, ?, 1)
                ON CONFLICT (registry_type, unit_code, year)
                DO UPDATE SET last_value = document_registry_counters.last_value + 1
                RETURNING last_value
                """,
                Long.class,
                unitCode,
                year
        );

        long counter = nextValue == null ? 1L : nextValue;
        String entryNumber = String.format("RE/%s/%d/%06d", unitCode, year, counter);
        log.info("Generated ENTRY number: {}", entryNumber);
        return entryNumber;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateExitNumber(String unitCode, Instant now) {
        int year = now.atZone(ZoneOffset.UTC).getYear();
        Long nextValue = jdbcTemplate.queryForObject(
                """
                INSERT INTO document_registry_counters (registry_type, unit_code, year, last_value)
                VALUES ('EXIT', ?, ?, 1)
                ON CONFLICT (registry_type, unit_code, year)
                DO UPDATE SET last_value = document_registry_counters.last_value + 1
                RETURNING last_value
                """,
                Long.class,
                unitCode,
                year
        );

        long counter = nextValue == null ? 1L : nextValue;
        String exitNumber = String.format("RS/%s/%d/%06d", unitCode, year, counter);
        log.info("Generated EXIT number: {}", exitNumber);
        return exitNumber;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateRecordNumber(String unitCode, Instant submittedAt) {
        int year = submittedAt.atZone(ZoneOffset.UTC).getYear();
        Long nextValue = jdbcTemplate.queryForObject(
                """
                INSERT INTO procedure_record_counters (unit_code, year, last_value)
                VALUES (?, ?, 1)
                ON CONFLICT (unit_code, year)
                DO UPDATE SET last_value = procedure_record_counters.last_value + 1
                RETURNING last_value
                """,
                Long.class,
                unitCode,
                year
        );

        long counter = nextValue == null ? 1L : nextValue;
        String recordNumber = String.format("EXP/%s/%d/%06d", unitCode, year, counter);
        log.info("Generated RECORD number: {}", recordNumber);
        return recordNumber;
    }
}
