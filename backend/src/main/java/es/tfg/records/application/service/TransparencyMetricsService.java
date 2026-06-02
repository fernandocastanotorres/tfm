package es.tfg.records.application.service;

import es.tfg.records.application.dto.TransparencyDtos;
import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TransparencyMetricsService {

    private final ProcedureJpaRepository procedureRepository;
    private final ProcedureTypeJpaRepository procedureTypeRepository;

    public TransparencyMetricsService(ProcedureJpaRepository procedureRepository,
                                      ProcedureTypeJpaRepository procedureTypeRepository) {
        this.procedureRepository = procedureRepository;
        this.procedureTypeRepository = procedureTypeRepository;
    }

    @Transactional(readOnly = true)
    public TransparencyDtos.TransparencyMetricsDto computeMetrics() {
        List<ProcedureEntity> allProcedures = procedureRepository.findAll();
        Map<UUID, ProcedureTypeEntity> typesById = procedureTypeRepository.findAll().stream()
                .collect(Collectors.toMap(ProcedureTypeEntity::getId, Function.identity()));

        long total = allProcedures.size();
        long resolved = allProcedures.stream().filter(this::isResolved).count();
        long pending = allProcedures.stream().filter(p -> !isResolved(p)).count();

        List<Double> resolutionDays = allProcedures.stream()
                .filter(this::isResolved)
                .map(p -> resolutionDays(p))
                .filter(d -> d > 0)
                .toList();

        double avgDays = resolutionDays.isEmpty() ? 0 : resolutionDays.stream().mapToDouble(Double::doubleValue).average().orElse(0);

        long resolvedWithSla = allProcedures.stream()
                .filter(this::isResolved)
                .filter(p -> isWithinSla(p, typesById.get(p.getProcedureTypeId())))
                .count();
        double slaRate = resolved == 0 ? 0 : (resolvedWithSla * 100.0) / resolved;

        double digitalPct = 100.0;

        return new TransparencyDtos.TransparencyMetricsDto(
                total, resolved, pending,
                Math.round(avgDays * 100.0) / 100.0,
                Math.round(slaRate * 100.0) / 100.0,
                digitalPct
        );
    }

    private boolean isResolved(ProcedureEntity p) {
        return p.getStatus() == CaseStatus.APPROVED || p.getStatus() == CaseStatus.REJECTED;
    }

    private double resolutionDays(ProcedureEntity p) {
        Instant start = p.getSubmittedAt() != null ? p.getSubmittedAt() : p.getCreatedAt();
        if (start == null || p.getUpdatedAt() == null) {
            return 0;
        }
        return ChronoUnit.HOURS.between(start, p.getUpdatedAt()) / 24.0;
    }

    private boolean isWithinSla(ProcedureEntity p, ProcedureTypeEntity type) {
        Instant start = p.getSubmittedAt() != null ? p.getSubmittedAt() : p.getCreatedAt();
        if (start == null || p.getUpdatedAt() == null) {
            return false;
        }
        int deadlineDays = type != null ? type.getDeadlineDays() : 10;
        return !p.getUpdatedAt().isAfter(start.plus(deadlineDays, ChronoUnit.DAYS));
    }
}
