package es.tfg.records.application.service;

import es.tfg.records.application.dto.FormalNotificationDtos;
import es.tfg.records.application.exception.AccessDeniedException;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.domain.model.FormalNotificationStatus;
import es.tfg.records.infrastructure.audit.AuditService;
import es.tfg.records.infrastructure.persistence.entity.AuditLogEntity;
import es.tfg.records.infrastructure.persistence.entity.FormalNotificationAttachmentEntity;
import es.tfg.records.infrastructure.persistence.entity.FormalNotificationEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfg.records.infrastructure.persistence.entity.UserEntity;
import es.tfg.records.infrastructure.persistence.repository.FormalNotificationAttachmentJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.FormalNotificationJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.UserJpaRepository;
import es.tfg.records.infrastructure.storage.FileStorageService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.Comparator;
import java.util.UUID;

@Service
public class FormalNotificationService {

    private static final Set<FormalNotificationStatus> ACTIVE_STATES = Set.of(
            FormalNotificationStatus.AVAILABLE,
            FormalNotificationStatus.ACCESSED
    );

    private final FormalNotificationJpaRepository notificationRepository;
    private final FormalNotificationAttachmentJpaRepository attachmentRepository;
    private final ProcedureJpaRepository procedureRepository;
    private final ProcedureTypeJpaRepository procedureTypeRepository;
    private final FileStorageService fileStorageService;
    private final AuditService auditService;
    private final UserJpaRepository userRepository;

    public FormalNotificationService(
            FormalNotificationJpaRepository notificationRepository,
            FormalNotificationAttachmentJpaRepository attachmentRepository,
            ProcedureJpaRepository procedureRepository,
            ProcedureTypeJpaRepository procedureTypeRepository,
            FileStorageService fileStorageService,
            AuditService auditService,
            UserJpaRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.attachmentRepository = attachmentRepository;
        this.procedureRepository = procedureRepository;
        this.procedureTypeRepository = procedureTypeRepository;
        this.fileStorageService = fileStorageService;
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    @Transactional
    public FormalNotificationDtos.InboxItem issue(
            FormalNotificationDtos.IssueRequest request,
            UUID issuerId,
            List<MultipartFile> files
    ) {
        ProcedureEntity procedure = procedureRepository.findById(request.procedureId())
                .orElseThrow(() -> new ResourceNotFoundException("PROC", request.procedureId().toString()));
        if (!procedure.getOwnerId().equals(request.citizenId())) {
            throw new AccessDeniedException("PROC", request.procedureId().toString());
        }

        FormalNotificationEntity entity = new FormalNotificationEntity();
        entity.setId(UUID.randomUUID());
        entity.setCitizenId(request.citizenId());
        entity.setProcedure(procedure);
        entity.setTypeKey(normalizeText(request.typeKey(), "FORMAL_NOTICE"));
        entity.setSubject(normalizeText(request.subject(), "Notificacion electronica"));
        entity.setBody(request.body() == null ? "" : request.body().trim());
        entity.setStatus(FormalNotificationStatus.AVAILABLE);
        entity.setAvailableAt(Instant.now());
        entity.setExpiresAt(request.expiresAt() == null ? Instant.now().plusSeconds(10L * 24 * 3600) : request.expiresAt());
        entity.setIssuedBy(issuerId);
        entity.setNotifyByEmail(request.notifyByEmail());

        FormalNotificationEntity saved = notificationRepository.save(entity);
        saveAttachments(saved, files);

        auditService.record(
                AuditLogEntity.AuditAction.CREATE,
                "FORMAL_NOTIFICATION",
                saved.getId(),
                AuditLogEntity.AuditResult.SUCCESS,
                "Issued formal notification with status AVAILABLE"
        );

        return toInboxItem(saved);
    }

    @Transactional(readOnly = true)
    public List<FormalNotificationDtos.CitizenOption> listCitizens(String search) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles() != null && user.getRoles().contains("ROLE_CITIZEN"))
                .filter(UserEntity::isActive)
                .filter(user -> {
                    if (search == null || search.isBlank()) {
                        return true;
                    }
                    String term = search.toLowerCase();
                    return user.getEmail() != null && user.getEmail().toLowerCase().contains(term) ||
                           user.getDisplayName() != null && user.getDisplayName().toLowerCase().contains(term) ||
                           user.getNationalId() != null && user.getNationalId().toLowerCase().contains(term);
                })
                .map(user -> new FormalNotificationDtos.CitizenOption(
                        user.getId(),
                        user.getEmail(),
                        user.getDisplayName(),
                        user.getNationalId()
                ))
                .sorted(Comparator.comparing(FormalNotificationDtos.CitizenOption::email, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FormalNotificationDtos.CitizenCaseOption> listCitizenCases(UUID citizenId) {
        return procedureRepository.findAllByOwnerId(citizenId).stream()
                .map(procedure -> {
                    ProcedureTypeEntity type = procedureTypeRepository.findById(procedure.getProcedureTypeId()).orElse(null);
                    return new FormalNotificationDtos.CitizenCaseOption(
                            procedure.getId(),
                            procedure.getTitle(),
                            typeTitle(type),
                            procedure.getStatus().name(),
                            procedure.getCreatedAt()
                    );
                })
                .sorted(Comparator.comparing(FormalNotificationDtos.CitizenCaseOption::createdAt).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FormalNotificationDtos.InboxItem> listCitizenInbox(UUID citizenId) {
        return notificationRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId).stream()
                .map(this::toInboxItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public FormalNotificationDtos.UnreadCount getCitizenUnreadCount(UUID citizenId) {
        long unread = notificationRepository.countByCitizenIdAndStatusIn(
                citizenId,
                List.of(FormalNotificationStatus.AVAILABLE)
        );
        return new FormalNotificationDtos.UnreadCount(unread);
    }

    @Transactional
    public FormalNotificationDtos.InboxItem markAccessed(UUID notificationId, UUID citizenId) {
        FormalNotificationEntity entity = getOwnedNotification(notificationId, citizenId);
        if (entity.getStatus() == FormalNotificationStatus.AVAILABLE) {
            entity.setStatus(FormalNotificationStatus.ACCESSED);
            entity.setAccessedAt(Instant.now());
            notificationRepository.save(entity);
            auditService.record(AuditLogEntity.AuditAction.UPDATE, "FORMAL_NOTIFICATION", entity.getId(),
                    AuditLogEntity.AuditResult.SUCCESS, "Citizen accessed formal notification");
        }
        return toInboxItem(entity);
    }

    @Transactional
    public FormalNotificationDtos.InboxItem accept(UUID notificationId, UUID citizenId, String notes) {
        return resolve(notificationId, citizenId, FormalNotificationStatus.ACCEPTED, notes);
    }

    @Transactional
    public FormalNotificationDtos.InboxItem reject(UUID notificationId, UUID citizenId, String notes) {
        return resolve(notificationId, citizenId, FormalNotificationStatus.REJECTED, notes);
    }

    @Transactional
    public int expireDueNotifications() {
        List<FormalNotificationEntity> due = notificationRepository.findByStatusInAndExpiresAtBefore(
                ACTIVE_STATES,
                Instant.now()
        );
        for (FormalNotificationEntity entity : due) {
            entity.setStatus(FormalNotificationStatus.EXPIRED);
            entity.setExpiredAt(Instant.now());
            entity.setResolvedAt(Instant.now());
            notificationRepository.save(entity);
            auditService.record(AuditLogEntity.AuditAction.UPDATE, "FORMAL_NOTIFICATION", entity.getId(),
                    AuditLogEntity.AuditResult.SUCCESS, "Formal notification expired automatically");
        }
        return due.size();
    }

    @Transactional(readOnly = true)
    public Resource downloadCitizenAttachment(UUID notificationId, UUID attachmentId, UUID citizenId) {
        FormalNotificationEntity notification = getOwnedNotification(notificationId, citizenId);
        FormalNotificationAttachmentEntity attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("FORMAL_NOTIFICATION_ATTACHMENT", attachmentId.toString()));
        if (!attachment.getNotification().getId().equals(notification.getId())) {
            throw new AccessDeniedException("FORMAL_NOTIFICATION_ATTACHMENT", attachmentId.toString());
        }

        InputStream stream = fileStorageService.openStream(notification.getProcedure().getId(), attachment.getStoragePath());
        return new InputStreamResource(stream) {
            @Override
            public String getFilename() {
                return attachment.getName();
            }
        };
    }

    private FormalNotificationEntity getOwnedNotification(UUID notificationId, UUID citizenId) {
        FormalNotificationEntity entity = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("FORMAL_NOTIFICATION", notificationId.toString()));
        if (!entity.getCitizenId().equals(citizenId)) {
            throw new AccessDeniedException("FORMAL_NOTIFICATION", notificationId.toString());
        }
        return entity;
    }

    private FormalNotificationDtos.InboxItem resolve(UUID notificationId, UUID citizenId, FormalNotificationStatus targetStatus, String notes) {
        FormalNotificationEntity entity = getOwnedNotification(notificationId, citizenId);
        if (!ACTIVE_STATES.contains(entity.getStatus())) {
            return toInboxItem(entity);
        }
        if (entity.getStatus() == FormalNotificationStatus.AVAILABLE) {
            entity.setAccessedAt(Instant.now());
        }
        entity.setStatus(targetStatus);
        entity.setResolvedAt(Instant.now());
        entity.setResolutionNotes(notes == null ? null : notes.trim());
        notificationRepository.save(entity);

        auditService.record(AuditLogEntity.AuditAction.UPDATE, "FORMAL_NOTIFICATION", entity.getId(),
                AuditLogEntity.AuditResult.SUCCESS, "Citizen resolved formal notification with status " + targetStatus.name());
        return toInboxItem(entity);
    }

    private String normalizeText(String value, String fallback) {
        String normalized = value == null ? "" : value.trim();
        return normalized.isBlank() ? fallback : normalized;
    }

    private String typeTitle(ProcedureTypeEntity type) {
        return type == null ? "Unknown" : type.getTitle();
    }

    private void saveAttachments(FormalNotificationEntity notification, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return;
        }
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            String stored = fileStorageService.store(notification.getProcedure().getId(), file);
            FormalNotificationAttachmentEntity attachment = new FormalNotificationAttachmentEntity();
            attachment.setId(UUID.randomUUID());
            attachment.setNotification(notification);
            attachment.setName(file.getOriginalFilename() == null ? "adjunto" : file.getOriginalFilename());
            attachment.setMimeType(file.getContentType());
            attachment.setSize(file.getSize());
            attachment.setStoragePath(stored);
            attachmentRepository.save(attachment);
        }
    }

    @Transactional(readOnly = true)
    public es.tfg.records.application.dto.PagedResponse<FormalNotificationDtos.AdminNotificationItem> listAllNotifications(
            int page, int size, String status) {
        int clampedPage = Math.max(0, page);
        int clampedSize = Math.min(Math.max(1, size), 100);
        Pageable pageable = PageRequest.of(clampedPage, clampedSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<FormalNotificationEntity> result;
        if (status != null && !status.isBlank()) {
            result = notificationRepository.findByStatus(
                    FormalNotificationStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            result = notificationRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        List<FormalNotificationDtos.AdminNotificationItem> items = result.getContent().stream()
                .map(this::toAdminNotificationItem)
                .toList();

        return new es.tfg.records.application.dto.PagedResponse<>(
                items, clampedPage, clampedSize, result.getTotalElements(), result.getTotalPages());
    }

    private FormalNotificationDtos.AdminNotificationItem toAdminNotificationItem(FormalNotificationEntity entity) {
        UserEntity citizen = userRepository.findById(entity.getCitizenId()).orElse(null);
        Collection<FormalNotificationAttachmentEntity> attachments = attachmentRepository.findByNotificationId(entity.getId());
        List<FormalNotificationDtos.AttachmentDto> attachmentDtos = attachments.stream()
                .map(att -> new FormalNotificationDtos.AttachmentDto(
                        att.getId(), att.getName(), att.getMimeType(), att.getSize(), att.getCreatedAt()))
                .toList();

        return new FormalNotificationDtos.AdminNotificationItem(
                entity.getId(),
                entity.getCitizenId(),
                citizen != null ? citizen.getEmail() : "Desconocido",
                citizen != null ? citizen.getDisplayName() : null,
                entity.getProcedure().getId(),
                entity.getProcedure().getTitle(),
                entity.getProcedure().getRecordNumber(),
                entity.getStatus().name(),
                entity.getTypeKey(),
                entity.getSubject(),
                entity.getBody(),
                entity.getAvailableAt(),
                entity.getExpiresAt(),
                entity.getAccessedAt(),
                entity.getResolvedAt(),
                entity.getCreatedAt(),
                entity.getResolutionNotes(),
                attachmentDtos.size(),
                attachmentDtos
        );
    }

    private FormalNotificationDtos.InboxItem toInboxItem(FormalNotificationEntity entity) {
        Collection<FormalNotificationAttachmentEntity> attachments = attachmentRepository.findByNotificationId(entity.getId());
        List<FormalNotificationDtos.AttachmentDto> attachmentDtos = attachments.stream()
                .map(att -> new FormalNotificationDtos.AttachmentDto(
                        att.getId(),
                        att.getName(),
                        att.getMimeType(),
                        att.getSize(),
                        att.getCreatedAt()
                ))
                .toList();

        return new FormalNotificationDtos.InboxItem(
                entity.getId(),
                entity.getCitizenId(),
                entity.getProcedure().getId(),
                entity.getProcedure().getTitle(),
                entity.getStatus().name(),
                entity.getTypeKey(),
                entity.getSubject(),
                entity.getBody(),
                entity.getAvailableAt(),
                entity.getExpiresAt(),
                entity.getAccessedAt(),
                entity.getResolvedAt(),
                entity.getExpiredAt(),
                attachmentDtos
        );
    }
}
