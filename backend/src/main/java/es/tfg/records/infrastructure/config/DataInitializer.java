package es.tfg.records.infrastructure.config;

import es.tfg.records.domain.model.CaseStatus;
import es.tfg.records.domain.model.Procedure;
import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.model.TaskType;
import es.tfg.records.domain.model.User;
import es.tfg.records.domain.port.ProcedureRepository;
import es.tfg.records.domain.port.ProcedureTypeRepository;
import es.tfg.records.domain.port.UserRepository;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTaskEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTaskJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Data initializer for development seeding.
 * Only active in the 'dev' profile.
 *
 * Seeds:
 * - Test users: citizen (dev@tfg.es) and admin (admin@tfg.es)
 * - Procedure types with form schemas and tasks
 * - Sample cases for the citizen user
 */
@Configuration
@Profile("dev")
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initDevData(PasswordEncoder passwordEncoder,
                                  UserRepository userRepository,
                                  ProcedureTypeRepository procedureTypeRepository,
                                  ProcedureTypeJpaRepository typeJpaRepository,
                                  ProcedureTaskJpaRepository taskJpaRepository,
                                  ProcedureRepository procedureRepository) {
        return args -> {
            log.info("=== DEV DATA INITIALIZER ===");

            // --- Seed test users ---
            UUID citizenId = UUID.randomUUID();
            User citizen = new User();
            citizen.setId(citizenId);
            citizen.setEmail("citizen@tfg.es");
            citizen.setPasswordHash(passwordEncoder.encode("Citizen1"));
            citizen.setDisplayName("Test Citizen");
            citizen.setRoles(Set.of("ROLE_CITIZEN"));
            citizen.setActive(true);
            userRepository.save(citizen);
            log.info("Created citizen user: citizen@tfg.es / Citizen1");

            UUID adminId = UUID.randomUUID();
            User admin = new User();
            admin.setId(adminId);
            admin.setEmail("admin@tfg.es");
            admin.setPasswordHash(passwordEncoder.encode("Admin1234"));
            admin.setDisplayName("Test Admin");
            admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_CITIZEN"));
            admin.setActive(true);
            userRepository.save(admin);
            log.info("Created admin user: admin@tfg.es / Admin1234");

            // --- Seed procedure types ---
            UUID licenseId = seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    "License Application",
                    "Apply for a new business or activity license",
                    new BigDecimal("25.00"),
                    30,
                    "ACTIVE",
                    "Licensing Unit",
                    List.of(
                            createTask("Personal Information", TaskType.FORM, "Fill in your personal details", 0),
                            createTask("Upload Documents", TaskType.UPLOAD, "Upload required supporting documents", 1),
                            createTask("Review and Submit", TaskType.REVIEW, "Review your application before submission", 2)
                    )
            );

            UUID registryId = seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    "Registry Certificate",
                    "Request an official registry certificate",
                    new BigDecimal("10.00"),
                    15,
                    "ACTIVE",
                    "Registry Office",
                    List.of(
                            createTask("Certificate Details", TaskType.FORM, "Specify the type of certificate needed", 0),
                            createTask("Identity Verification", TaskType.UPLOAD, "Upload identity verification documents", 1),
                            createTask("Review and Submit", TaskType.REVIEW, "Review your request before submission", 2)
                    )
            );

            UUID addressId = seedProcedureType(
                    typeJpaRepository, taskJpaRepository,
                    "Address Update",
                    "Update your registered address",
                    BigDecimal.ZERO,
                    7,
                    "ACTIVE",
                    "Citizen Services",
                    List.of(
                            createTask("New Address", TaskType.FORM, "Enter your new address details", 0),
                            createTask("Proof of Address", TaskType.UPLOAD, "Upload proof of your new address", 1),
                            createTask("Review and Submit", TaskType.REVIEW, "Review your update before submission", 2)
                    )
            );

            log.info("Seeded 3 procedure types with tasks");

            // --- Seed sample cases for the citizen user ---
            Procedure licenseCase = new Procedure();
            licenseCase.setId(UUID.randomUUID());
            licenseCase.setProcedureTypeId(licenseId);
            licenseCase.setOwnerId(citizenId);
            licenseCase.setTitle("License Application");
            licenseCase.setStatus(CaseStatus.DRAFT);
            licenseCase.setSubmittedAt(null);
            procedureRepository.save(licenseCase);
            log.info("Created sample case: License Application (DRAFT)");

            Procedure certificateCase = new Procedure();
            certificateCase.setId(UUID.randomUUID());
            certificateCase.setProcedureTypeId(registryId);
            certificateCase.setOwnerId(citizenId);
            certificateCase.setTitle("Registry Certificate");
            certificateCase.setStatus(CaseStatus.SUBMITTED);
            certificateCase.setSubmittedAt(Instant.now().minusSeconds(86400));
            procedureRepository.save(certificateCase);
            log.info("Created sample case: Registry Certificate (SUBMITTED)");

            Procedure addressCase = new Procedure();
            addressCase.setId(UUID.randomUUID());
            addressCase.setProcedureTypeId(addressId);
            addressCase.setOwnerId(citizenId);
            addressCase.setTitle("Address Update");
            addressCase.setStatus(CaseStatus.AMENDMENT_REQUIRED);
            addressCase.setSubmittedAt(Instant.now().minusSeconds(172800));
            procedureRepository.save(addressCase);
            log.info("Created sample case: Address Update (AMENDMENT_REQUIRED)");

            log.info("=== DEV DATA INITIALIZATION COMPLETE ===");
        };
    }

    private UUID seedProcedureType(ProcedureTypeJpaRepository typeRepo,
                                   ProcedureTaskJpaRepository taskRepo,
                                   String title, String description,
                                   BigDecimal fee, int deadlineDays,
                                   String status, String unit,
                                   List<ProcedureTask> tasks) {
        UUID id = UUID.randomUUID();

        ProcedureTypeEntity entity = new ProcedureTypeEntity();
        entity.setId(id);
        entity.setTitle(title);
        entity.setDescription(description);
        entity.setFeeAmount(fee);
        entity.setDeadlineDays(deadlineDays);
        entity.setStatus(status);
        entity.setUnit(unit);
        typeRepo.save(entity);

        for (ProcedureTask task : tasks) {
            ProcedureTaskEntity taskEntity = new ProcedureTaskEntity();
            taskEntity.setId(task.getId());
            taskEntity.setProcedureTypeId(id);
            taskEntity.setType(task.getType());
            taskEntity.setOrderIndex(task.getOrderIndex());
            taskEntity.setTitle(task.getTitle());
            taskEntity.setDescription(task.getDescription());
            taskRepo.save(taskEntity);
        }

        log.info("  - Seeded: {} (id: {}) with {} tasks", title, id, tasks.size());
        return id;
    }

    private ProcedureTask createTask(String title, TaskType type, String description, int orderIndex) {
        ProcedureTask task = new ProcedureTask();
        task.setId(UUID.randomUUID());
        task.setTitle(title);
        task.setType(type);
        task.setDescription(description);
        task.setOrderIndex(orderIndex);
        return task;
    }
}
