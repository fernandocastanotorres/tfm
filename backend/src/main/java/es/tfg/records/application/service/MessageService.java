package es.tfg.records.application.service;

import es.tfg.records.application.dto.MessagingDtos.*;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.domain.model.MessageSenderRole;
import es.tfg.records.domain.port.MessageThreadRepository;
import es.tfg.records.domain.port.MessageRepository;
import es.tfg.records.domain.port.MessageAttachmentRepository;
import es.tfg.records.infrastructure.persistence.entity.MessageEntity;
import es.tfg.records.infrastructure.persistence.entity.MessageThreadEntity;
import es.tfg.records.infrastructure.persistence.entity.MessageAttachmentEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureEntity;
import es.tfg.records.infrastructure.persistence.repository.ProcedureJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.UserJpaRepository;
import es.tfg.records.infrastructure.storage.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.Instant;
import java.util.*;

/**
 * Application service for messaging between citizens and admin.
 */
@Service
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    private final MessageThreadRepository threadRepository;
    private final MessageRepository messageRepository;
    private final MessageAttachmentRepository attachmentRepository;
    private final ProcedureJpaRepository procedureJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final FileStorageService fileStorageService;
    private final EmailGateway emailGateway;

    public MessageService(MessageThreadRepository threadRepository,
                          MessageRepository messageRepository,
                          MessageAttachmentRepository attachmentRepository,
                          ProcedureJpaRepository procedureJpaRepository,
                          UserJpaRepository userJpaRepository,
                          FileStorageService fileStorageService,
                          EmailGateway emailGateway) {
        this.threadRepository = threadRepository;
        this.messageRepository = messageRepository;
        this.attachmentRepository = attachmentRepository;
        this.procedureJpaRepository = procedureJpaRepository;
        this.userJpaRepository = userJpaRepository;
        this.fileStorageService = fileStorageService;
        this.emailGateway = emailGateway;
    }

    @Transactional
    public MessageDto sendMessage(UUID procedureId, MessageSenderRole senderRole, String senderName,
                                  String senderEmail, String content, String templateKey,
                                  boolean notifyByEmail, List<MultipartFile> files) {
        ProcedureEntity procedure = procedureJpaRepository.findById(procedureId)
                .orElseThrow(() -> new ResourceNotFoundException("PROC", procedureId.toString()));

        MessageThreadEntity thread = threadRepository.findByProcedureId(procedureId)
                .orElseGet(() -> {
                    MessageThreadEntity newThread = new MessageThreadEntity();
                    newThread.setId(UUID.randomUUID());
                    newThread.setProcedure((ProcedureEntity) procedure);
                    newThread.setCreatedAt(Instant.now());
                    newThread.setUpdatedAt(Instant.now());
                    newThread.setLastMessageAt(Instant.now());
                    return threadRepository.save(newThread);
                });

        MessageEntity message = new MessageEntity();
        message.setId(UUID.randomUUID());
        message.setThread(thread);
        message.setSenderRole(senderRole);
        message.setSenderName(senderName);
        message.setSenderEmail(senderEmail);
        message.setContent(content);
        message.setTemplateKey(templateKey);
        message.setCreatedAt(Instant.now());

        if (files != null && !files.isEmpty()) {
            int attachmentCount = 0;
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }
                String storedFilename = fileStorageService.store(procedureId, file);

                MessageAttachmentEntity attachment = new MessageAttachmentEntity();
                attachment.setId(UUID.randomUUID());
                attachment.setMessage(message);
                attachment.setName(file.getOriginalFilename());
                attachment.setMimeType(file.getContentType());
                attachment.setSize(file.getSize());
                attachment.setStoragePath(storedFilename);
                attachment.setCreatedAt(Instant.now());
                attachmentRepository.save(attachment);
                attachmentCount++;
            }
            message.setAttachmentCount(attachmentCount);
        }

        messageRepository.save(message);

        thread.setLastMessageAt(Instant.now());
        thread.setUpdatedAt(Instant.now());

        if (senderRole == MessageSenderRole.ADMIN) {
            thread.setUnreadCountCitizen(thread.getUnreadCountCitizen() + 1);
        } else {
            thread.setUnreadCountAdmin(thread.getUnreadCountAdmin() + 1);
        }
        threadRepository.save(thread);

        if (notifyByEmail) {
            try {
                if (senderRole == MessageSenderRole.ADMIN) {
                    userJpaRepository.findById(procedure.getOwnerId()).ifPresent(user -> {
                        emailGateway.sendNewMessageNotification(user.getEmail(), senderName, content, procedureId.toString());
                    });
                } else {
                    emailGateway.sendNewMessageNotification("admin@tfg.es", senderName, content, procedureId.toString());
                }
            } catch (Exception e) {
                log.warn("Failed to send email notification for message: {}", e.getMessage());
            }
        }

        return toMessageDto(message, List.of());
    }

    @Transactional(readOnly = true)
    public PagedMessages getThreadMessages(UUID procedureId, int page, int size) {
        MessageThreadEntity thread = threadRepository.findByProcedureId(procedureId)
                .orElse(null);

        if (thread == null) {
            return new PagedMessages(List.of(), page, size, 0, 0);
        }

        long total = messageRepository.countByThreadId(thread.getId());
        PageRequest pageRequest = PageRequest.of(page, size);
        List<MessageEntity> messages = messageRepository.findByThreadIdOrderByCreatedAtDesc(thread.getId(), size);

        List<MessageDto> dtos = messages.stream()
                .map(m -> toMessageDto(m, attachmentRepository.findByMessageId(m.getId())))
                .toList();

        return new PagedMessages(dtos, page, size, total, (int) Math.ceil((double) total / size));
    }

    @Transactional
    public void markThreadAsRead(UUID procedureId, MessageSenderRole readerRole) {
        MessageThreadEntity thread = threadRepository.findByProcedureId(procedureId)
                .orElse(null);

        if (thread == null) {
            return;
        }

        if (readerRole == MessageSenderRole.CITIZEN) {
            thread.setUnreadCountCitizen(0);
        } else {
            thread.setUnreadCountAdmin(0);
        }
        threadRepository.save(thread);
    }

    @Transactional(readOnly = true)
    public UnreadCounts getUnreadCounts() {
        return new UnreadCounts(
                threadRepository.countByUnreadCountCitizenGreaterThan(0),
                threadRepository.countByUnreadCountAdminGreaterThan(0)
        );
    }

    @Transactional(readOnly = true)
    public List<ThreadSummary> getCitizenThreadSummaries(UUID citizenId) {
        List<ProcedureEntity> procedures = procedureJpaRepository.findAllByOwnerId(citizenId);
        return procedures.stream()
                .map(p -> {
                    Optional<MessageThreadEntity> optThread = threadRepository.findByProcedureId(p.getId());
                    if (optThread.isEmpty()) {
                        return null;
                    }
                    MessageThreadEntity thread = optThread.get();
                    long total = messageRepository.countByThreadId(thread.getId());
                    long unread = thread.getUnreadCountCitizen();
                    String lastPreview = thread.getMessages().isEmpty() ? "" : thread.getMessages().get(thread.getMessages().size() - 1).getContent();
                    if (lastPreview.length() > 100) {
                        lastPreview = lastPreview.substring(0, 100) + "...";
                    }
                    return new ThreadSummary(
                            thread.getId(),
                            p.getId(),
                            p.getTitle(),
                            lastPreview,
                            thread.getLastMessageAt(),
                            (int) unread,
                            (int) total
                    );
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(ThreadSummary::lastMessageAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ThreadSummary> getAdminUnreadThreadSummaries() {
        return procedureJpaRepository.findAll().stream()
                .map(p -> threadRepository.findByProcedureId(p.getId())
                        .filter(t -> t.getUnreadCountAdmin() > 0)
                        .map(thread -> {
                            long total = messageRepository.countByThreadId(thread.getId());
                            String lastPreview = thread.getMessages().isEmpty() ? "" : thread.getMessages().get(thread.getMessages().size() - 1).getContent();
                            if (lastPreview.length() > 100) {
                                lastPreview = lastPreview.substring(0, 100) + "...";
                            }
                            return new ThreadSummary(
                                    thread.getId(),
                                    p.getId(),
                                    p.getTitle(),
                                    lastPreview,
                                    thread.getLastMessageAt(),
                                    thread.getUnreadCountAdmin(),
                                    (int) total
                            );
                        }))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .sorted(Comparator.comparing(ThreadSummary::lastMessageAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public Resource downloadAttachment(UUID attachmentId) {
        MessageAttachmentEntity attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("ATTACHMENT", attachmentId.toString()));

        if (attachment.getStoragePath() == null) {
            throw new ResourceNotFoundException("ATTACHMENT", "No file associated");
        }

        InputStream inputStream = fileStorageService.openStreamByPath(attachment.getStoragePath());
        return new org.springframework.core.io.InputStreamResource(inputStream) {
            @Override
            public String getFilename() {
                return attachment.getName();
            }

            @Override
            public long contentLength() {
                return attachment.getSize();
            }
        };
    }

    private MessageDto toMessageDto(MessageEntity message, List<MessageAttachmentEntity> attachments) {
        List<MessageAttachmentDto> attachmentDtos = attachments.stream()
                .map(a -> new MessageAttachmentDto(a.getId(), a.getName(), a.getMimeType(), a.getSize(), a.getCreatedAt()))
                .toList();

        return new MessageDto(
                message.getId(),
                message.getThread().getId(),
                message.getSenderRole().name(),
                message.getSenderName(),
                message.getSenderEmail(),
                message.getContent(),
                message.getTemplateKey(),
                message.isRead(),
                message.getReadAt(),
                message.getAttachmentCount(),
                attachmentDtos,
                message.getCreatedAt()
        );
    }
}
