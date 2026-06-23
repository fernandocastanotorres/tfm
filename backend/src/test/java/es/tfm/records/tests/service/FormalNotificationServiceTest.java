package es.tfm.records.tests.service;

import es.tfm.records.application.dto.FormalNotificationDtos;
import es.tfm.records.application.exception.AccessDeniedException;
import es.tfm.records.application.exception.ResourceNotFoundException;
import es.tfm.records.application.service.FormalNotificationService;
import es.tfm.records.domain.model.CaseStatus;
import es.tfm.records.domain.model.FormalNotificationStatus;
import es.tfm.records.infrastructure.audit.AuditService;
import es.tfm.records.infrastructure.persistence.entity.AuditLogEntity;
import es.tfm.records.infrastructure.persistence.entity.FormalNotificationAttachmentEntity;
import es.tfm.records.infrastructure.persistence.entity.FormalNotificationEntity;
import es.tfm.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfm.records.infrastructure.persistence.entity.ProcedureTypeEntity;
import es.tfm.records.infrastructure.persistence.entity.UserEntity;
import es.tfm.records.infrastructure.persistence.repository.FormalNotificationAttachmentJpaRepository;
import es.tfm.records.infrastructure.persistence.repository.FormalNotificationJpaRepository;
import es.tfm.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import es.tfm.records.infrastructure.persistence.repository.ProcedureTypeJpaRepository;
import es.tfm.records.infrastructure.persistence.repository.UserJpaRepository;
import es.tfm.records.infrastructure.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FormalNotificationServiceTest {

    @Mock
    private FormalNotificationJpaRepository notificationRepository;

    @Mock
    private FormalNotificationAttachmentJpaRepository attachmentRepository;

    @Mock
    private ProcedureJpaRepository procedureRepository;

    @Mock
    private ProcedureTypeJpaRepository procedureTypeRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private AuditService auditService;

    @Mock
    private UserJpaRepository userRepository;

    private FormalNotificationService service;

    private UUID citizenId;
    private UUID procedureId;
    private UUID notificationId;
    private UUID issuerId;
    private UUID attachmentId;
    private ProcedureEntity procedure;
    private ProcedureTypeEntity procedureType;
    private UserEntity citizenUser;
    private FormalNotificationEntity notification;
    private FormalNotificationAttachmentEntity attachment;

    @BeforeEach
    void setUp() {
        service = new FormalNotificationService(
                notificationRepository, attachmentRepository, procedureRepository,
                procedureTypeRepository, fileStorageService, auditService, userRepository);

        citizenId = UUID.randomUUID();
        procedureId = UUID.randomUUID();
        notificationId = UUID.randomUUID();
        issuerId = UUID.randomUUID();
        attachmentId = UUID.randomUUID();

        procedureType = new ProcedureTypeEntity();
        procedureType.setId(UUID.randomUUID());
        procedureType.setTitle("Licencias");
        procedureType.setDescription("Licencia de obras");

        procedure = new ProcedureEntity();
        procedure.setId(procedureId);
        procedure.setOwnerId(citizenId);
        procedure.setProcedureTypeId(procedureType.getId());
        procedure.setTitle("Solicitud de licencia");
        procedure.setStatus(CaseStatus.IN_REVIEW);
        procedure.setRecordNumber("EXP/GEN/2026/000001");
        procedure.setCreatedAt(Instant.now());

        citizenUser = new UserEntity();
        citizenUser.setId(citizenId);
        citizenUser.setEmail("citizen@example.com");
        citizenUser.setDisplayName("Citizen User");
        citizenUser.setNationalId("12345678A");
        citizenUser.setRoles(Set.of("ROLE_CITIZEN"));
        citizenUser.setActive(true);

        notification = new FormalNotificationEntity();
        notification.setId(notificationId);
        notification.setCitizenId(citizenId);
        notification.setProcedure(procedure);
        notification.setTypeKey("FORMAL_NOTICE");
        notification.setSubject("Notificacion electronica");
        notification.setBody("Cuerpo de la notificacion");
        notification.setStatus(FormalNotificationStatus.AVAILABLE);
        notification.setAvailableAt(Instant.now());
        notification.setExpiresAt(Instant.now().plusSeconds(86400 * 10));
        notification.setIssuedBy(issuerId);
        notification.setNotifyByEmail(false);
        // createdAt is managed by @CreatedDate — no setter available

        attachment = new FormalNotificationAttachmentEntity();
        attachment.setId(attachmentId);
        attachment.setNotification(notification);
        attachment.setName("documento.pdf");
        attachment.setMimeType("application/pdf");
        attachment.setSize(1024L);
        attachment.setStoragePath("path/to/doc.pdf");
        // createdAt is managed by @CreatedDate — no setter available
    }

    // ===== issue =====

    @Test
    void issue_shouldCreateNotification() {
        FormalNotificationDtos.IssueRequest request = new FormalNotificationDtos.IssueRequest(
                citizenId, procedureId, "FORMAL_NOTICE", "Notificacion electronica",
                "Cuerpo de la notificacion", Instant.now().plusSeconds(86400 * 10), false);

        when(procedureRepository.findById(procedureId)).thenReturn(Optional.of(procedure));
        when(notificationRepository.save(any(FormalNotificationEntity.class))).thenAnswer(invocation -> {
            FormalNotificationEntity e = invocation.getArgument(0);
            e.setId(notificationId);
            return e;
        });
        when(attachmentRepository.findByNotificationId(any())).thenReturn(List.of());
        doNothing().when(auditService).record(any(), any(), any(), any(), anyString());

        FormalNotificationDtos.InboxItem result = service.issue(request, issuerId, List.of());

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(notificationId);
        assertThat(result.citizenId()).isEqualTo(citizenId);
        assertThat(result.status()).isEqualTo("AVAILABLE");
        verify(notificationRepository).save(any(FormalNotificationEntity.class));
        verify(auditService).record(eq(AuditLogEntity.AuditAction.CREATE), eq("FORMAL_NOTIFICATION"),
                eq(notificationId), eq(AuditLogEntity.AuditResult.SUCCESS), anyString());
    }

    @Test
    void issue_shouldThrow_whenProcedureNotFound() {
        FormalNotificationDtos.IssueRequest request = new FormalNotificationDtos.IssueRequest(
                citizenId, procedureId, "FORMAL_NOTICE", "Subject", "Body", null, false);

        when(procedureRepository.findById(procedureId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.issue(request, issuerId, List.of()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void issue_shouldThrow_whenAccessDenied() {
        procedure.setOwnerId(UUID.randomUUID()); // different owner

        FormalNotificationDtos.IssueRequest request = new FormalNotificationDtos.IssueRequest(
                citizenId, procedureId, "FORMAL_NOTICE", "Subject", "Body", null, false);

        when(procedureRepository.findById(procedureId)).thenReturn(Optional.of(procedure));

        assertThatThrownBy(() -> service.issue(request, issuerId, List.of()))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ===== listCitizens =====

    @Test
    void listCitizens_shouldFilterByRoleAndSearch() {
        UserEntity nonCitizen = new UserEntity();
        nonCitizen.setId(UUID.randomUUID());
        nonCitizen.setEmail("admin@test.com");
        nonCitizen.setRoles(Set.of("ROLE_ADMIN"));
        nonCitizen.setActive(true);

        UserEntity inactiveCitizen = new UserEntity();
        inactiveCitizen.setId(UUID.randomUUID());
        inactiveCitizen.setEmail("inactive@test.com");
        inactiveCitizen.setDisplayName("Inactive");
        inactiveCitizen.setRoles(Set.of("ROLE_CITIZEN"));
        inactiveCitizen.setActive(false);

        when(userRepository.findAll()).thenReturn(List.of(citizenUser, nonCitizen, inactiveCitizen));

        List<FormalNotificationDtos.CitizenOption> result = service.listCitizens(null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).email()).isEqualTo("citizen@example.com");
    }

    @Test
    void listCitizens_shouldFilterBySearchTerm() {
        when(userRepository.findAll()).thenReturn(List.of(citizenUser));

        List<FormalNotificationDtos.CitizenOption> result = service.listCitizens("nonexistent");

        assertThat(result).isEmpty();
    }

    // ===== listCitizenCases =====

    @Test
    void listCitizenCases_shouldReturnCasesSorted() {
        ProcedureEntity case1 = new ProcedureEntity();
        case1.setId(UUID.randomUUID());
        case1.setOwnerId(citizenId);
        case1.setProcedureTypeId(procedureType.getId());
        case1.setTitle("Case 1");
        case1.setStatus(CaseStatus.SUBMITTED);
        case1.setCreatedAt(Instant.now().minusSeconds(3600));

        ProcedureEntity case2 = new ProcedureEntity();
        case2.setId(UUID.randomUUID());
        case2.setOwnerId(citizenId);
        case2.setProcedureTypeId(procedureType.getId());
        case2.setTitle("Case 2");
        case2.setStatus(CaseStatus.DRAFT);
        case2.setCreatedAt(Instant.now());

        when(procedureRepository.findAllByOwnerId(citizenId)).thenReturn(List.of(case1, case2));
        when(procedureTypeRepository.findById(procedureType.getId())).thenReturn(Optional.of(procedureType));

        List<FormalNotificationDtos.CitizenCaseOption> result = service.listCitizenCases(citizenId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).title()).isEqualTo("Case 2"); // newest first
        assertThat(result.get(1).title()).isEqualTo("Case 1");
    }

    // ===== markAccessed =====

    @Test
    void markAccessed_shouldUpdateStatus() {
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(attachmentRepository.findByNotificationId(notificationId)).thenReturn(List.of());

        FormalNotificationDtos.InboxItem result = service.markAccessed(notificationId, citizenId);

        assertThat(result.status()).isEqualTo("ACCESSED");
        verify(notificationRepository).save(notification);
        verify(auditService).record(eq(AuditLogEntity.AuditAction.UPDATE), eq("FORMAL_NOTIFICATION"),
                eq(notificationId), eq(AuditLogEntity.AuditResult.SUCCESS), anyString());
    }

    @Test
    void markAccessed_shouldNotChange_whenAlreadyAccessed() {
        notification.setStatus(FormalNotificationStatus.ACCESSED);
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(attachmentRepository.findByNotificationId(notificationId)).thenReturn(List.of());

        FormalNotificationDtos.InboxItem result = service.markAccessed(notificationId, citizenId);

        assertThat(result.status()).isEqualTo("ACCESSED");
        verify(notificationRepository, never()).save(any());
    }

    // ===== accept =====

    @Test
    void accept_shouldSetStatusToAccepted() {
        notification.setStatus(FormalNotificationStatus.AVAILABLE);
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(attachmentRepository.findByNotificationId(notificationId)).thenReturn(List.of());

        FormalNotificationDtos.InboxItem result = service.accept(notificationId, citizenId, "Acepto la notificacion");

        assertThat(result.status()).isEqualTo("ACCEPTED");
        verify(notificationRepository).save(notification);
        verify(auditService).record(eq(AuditLogEntity.AuditAction.UPDATE), eq("FORMAL_NOTIFICATION"),
                eq(notificationId), eq(AuditLogEntity.AuditResult.SUCCESS), contains("ACCEPTED"));
    }

    // ===== reject =====

    @Test
    void reject_shouldSetStatusToRejected() {
        notification.setStatus(FormalNotificationStatus.AVAILABLE);
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(attachmentRepository.findByNotificationId(notificationId)).thenReturn(List.of());

        FormalNotificationDtos.InboxItem result = service.reject(notificationId, citizenId, "Rechazo la notificacion");

        assertThat(result.status()).isEqualTo("REJECTED");
        verify(notificationRepository).save(notification);
        verify(auditService).record(eq(AuditLogEntity.AuditAction.UPDATE), eq("FORMAL_NOTIFICATION"),
                eq(notificationId), eq(AuditLogEntity.AuditResult.SUCCESS), contains("REJECTED"));
    }

    // ===== expireDueNotifications =====

    @Test
    void expireDueNotifications_shouldExpireActiveNotifications() {
        when(notificationRepository.findByStatusInAndExpiresAtBefore(anySet(), any(Instant.class)))
                .thenReturn(List.of(notification));
        when(notificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        int count = service.expireDueNotifications();

        assertThat(count).isEqualTo(1);
        assertThat(notification.getStatus()).isEqualTo(FormalNotificationStatus.EXPIRED);
        assertThat(notification.getExpiredAt()).isNotNull();
        assertThat(notification.getResolvedAt()).isNotNull();
        verify(auditService).record(eq(AuditLogEntity.AuditAction.UPDATE), eq("FORMAL_NOTIFICATION"),
                eq(notificationId), eq(AuditLogEntity.AuditResult.SUCCESS), contains("expired"));
    }

    @Test
    void expireDueNotifications_shouldReturnZero_whenNoneDue() {
        when(notificationRepository.findByStatusInAndExpiresAtBefore(anySet(), any(Instant.class)))
                .thenReturn(List.of());

        int count = service.expireDueNotifications();

        assertThat(count).isEqualTo(0);
        verify(notificationRepository, never()).save(any());
    }

    // ===== downloadCitizenAttachment =====

    @Test
    void downloadCitizenAttachment_shouldReturnResource() {
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.of(attachment));
        when(fileStorageService.openStream(procedureId, attachment.getStoragePath()))
                .thenReturn(new ByteArrayInputStream("test-content".getBytes()));

        Resource result = service.downloadCitizenAttachment(notificationId, attachmentId, citizenId);

        assertThat(result).isNotNull();
        assertThat(result.getFilename()).isEqualTo("documento.pdf");
    }

    @Test
    void downloadCitizenAttachment_shouldThrow_whenAttachmentDoesNotBelongToNotification() {
        FormalNotificationEntity otherNotification = new FormalNotificationEntity();
        otherNotification.setId(UUID.randomUUID());
        attachment.setNotification(otherNotification);

        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(attachmentRepository.findById(attachmentId)).thenReturn(Optional.of(attachment));

        assertThatThrownBy(() -> service.downloadCitizenAttachment(notificationId, attachmentId, citizenId))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ===== listAllNotifications =====

    @Test
    void listAllNotifications_shouldReturnPagedResults() {
        when(notificationRepository.findAllByOrderByCreatedAtDesc(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(notification)));
        when(attachmentRepository.findByNotificationId(notificationId)).thenReturn(List.of(attachment));
        when(userRepository.findById(citizenId)).thenReturn(Optional.of(citizenUser));

        var result = service.listAllNotifications(0, 10, null);

        assertThat(result).isNotNull();
        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).id()).isEqualTo(notificationId);
        assertThat(result.items().get(0).citizenEmail()).isEqualTo("citizen@example.com");
        assertThat(result.items().get(0).attachmentCount()).isEqualTo(1);
    }

    @Test
    void listAllNotifications_shouldFilterByStatus() {
        when(notificationRepository.findByStatus(eq(FormalNotificationStatus.AVAILABLE), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(notification)));
        when(attachmentRepository.findByNotificationId(notificationId)).thenReturn(List.of());
        when(userRepository.findById(citizenId)).thenReturn(Optional.of(citizenUser));

        var result = service.listAllNotifications(0, 10, "AVAILABLE");

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).status()).isEqualTo("AVAILABLE");
    }

    @Test
    void listAllNotifications_shouldClampPageSize() {
        Page<FormalNotificationEntity> emptyPage = Page.empty();
        when(notificationRepository.findAllByOrderByCreatedAtDesc(any(PageRequest.class)))
                .thenReturn(emptyPage);

        var result = service.listAllNotifications(-1, 200, null);

        assertThat(result.page()).isEqualTo(0);
        assertThat(result.size()).isEqualTo(100);
    }
}
