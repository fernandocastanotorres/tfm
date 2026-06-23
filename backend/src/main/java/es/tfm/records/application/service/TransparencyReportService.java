package es.tfm.records.application.service;

import es.tfm.records.application.dto.TransparencyDtos;
import es.tfm.records.application.exception.ConflictException;
import es.tfm.records.application.exception.ResourceNotFoundException;
import es.tfm.records.infrastructure.persistence.entity.TransparencyReportEntity;
import es.tfm.records.infrastructure.persistence.repository.TransparencyReportJpaRepository;
import es.tfm.records.infrastructure.storage.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Service
public class TransparencyReportService {

    private static final Logger log = LoggerFactory.getLogger(TransparencyReportService.class);
    private static final String SUBDIRECTORY = "transparency";
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final String ALLOWED_MIME_TYPE = "application/pdf";

    private final TransparencyReportJpaRepository repository;
    private final FileStorageService fileStorageService;

    public TransparencyReportService(TransparencyReportJpaRepository repository,
                                     FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public TransparencyDtos.TransparencyReportDto createReport(String title, int year, String description,
                                                                MultipartFile file, int sortOrder, boolean published) {
        validateFile(file);
        String storedPath = fileStorageService.store(SUBDIRECTORY, file);

        TransparencyReportEntity entity = new TransparencyReportEntity();
        entity.setId(UUID.randomUUID());
        entity.setTitle(title.trim());
        entity.setYear(year);
        entity.setDescription(description);
        entity.setFilePath(storedPath);
        entity.setFileName(file.getOriginalFilename());
        entity.setFileSize(file.getSize());
        entity.setMimeType(file.getContentType());
        entity.setSortOrder(sortOrder);
        entity.setPublished(published);

        TransparencyReportEntity saved = repository.save(entity);
        log.info("Created transparency report: {} (id: {})", saved.getTitle(), saved.getId());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<TransparencyDtos.TransparencyReportDto> listAllReports() {
        return repository.findAllByOrderBySortOrderAscYearDesc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TransparencyDtos.PublicTransparencyReportDto> listPublishedReports() {
        return repository.findByPublishedTrueOrderBySortOrderAscYearDesc().stream()
                .map(this::toPublicDto)
                .toList();
    }

    @Transactional
    public TransparencyDtos.TransparencyReportDto updateReport(UUID id, TransparencyDtos.UpdateReportRequest request) {
        TransparencyReportEntity entity = findReport(id);

        if (request.title() != null) {
            entity.setTitle(request.title().trim());
        }
        if (request.year() != null) {
            entity.setYear(request.year());
        }
        if (request.description() != null) {
            entity.setDescription(request.description());
        }
        if (request.sortOrder() != null) {
            entity.setSortOrder(request.sortOrder());
        }
        if (request.published() != null) {
            entity.setPublished(request.published());
        }

        TransparencyReportEntity saved = repository.save(entity);
        log.info("Updated transparency report: {} (id: {})", saved.getTitle(), saved.getId());
        return toDto(saved);
    }

    @Transactional
    public TransparencyDtos.TransparencyReportDto replaceFile(UUID id, MultipartFile file) {
        validateFile(file);
        TransparencyReportEntity entity = findReport(id);

        fileStorageService.deleteByPath(entity.getFilePath());
        String storedPath = fileStorageService.store(SUBDIRECTORY, file);

        entity.setFilePath(storedPath);
        entity.setFileName(file.getOriginalFilename());
        entity.setFileSize(file.getSize());
        entity.setMimeType(file.getContentType());

        TransparencyReportEntity saved = repository.save(entity);
        log.info("Replaced file for transparency report: {} (id: {})", saved.getTitle(), saved.getId());
        return toDto(saved);
    }

    @Transactional
    public void deleteReport(UUID id) {
        TransparencyReportEntity entity = findReport(id);
        fileStorageService.deleteByPath(entity.getFilePath());
        repository.delete(entity);
        log.info("Deleted transparency report: {} (id: {})", entity.getTitle(), id);
    }

    public InputStream downloadReport(UUID id) {
        TransparencyReportEntity entity = findReport(id);
        return fileStorageService.openStreamByPath(entity.getFilePath());
    }

    public InputStream downloadPublishedReport(UUID id) {
        TransparencyReportEntity entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TRANSPARENCY", "REPORT_NOT_FOUND"));
        if (!entity.getPublished()) {
            throw new ResourceNotFoundException("TRANSPARENCY", "REPORT_NOT_FOUND");
        }
        return fileStorageService.openStreamByPath(entity.getFilePath());
    }

    private TransparencyReportEntity findReport(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TRANSPARENCY", "REPORT_NOT_FOUND"));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ConflictException("TRANSPARENCY", "EMPTY_FILE");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals(ALLOWED_MIME_TYPE)) {
            throw new ConflictException("TRANSPARENCY", "INVALID_FILE_TYPE");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ConflictException("TRANSPARENCY", "FILE_TOO_LARGE");
        }
    }

    private TransparencyDtos.TransparencyReportDto toDto(TransparencyReportEntity entity) {
        return new TransparencyDtos.TransparencyReportDto(
                entity.getId(),
                entity.getTitle(),
                entity.getYear(),
                entity.getDescription(),
                entity.getFilePath(),
                entity.getFileName(),
                entity.getFileSize(),
                entity.getMimeType(),
                entity.getPublished(),
                entity.getSortOrder(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private TransparencyDtos.PublicTransparencyReportDto toPublicDto(TransparencyReportEntity entity) {
        return new TransparencyDtos.PublicTransparencyReportDto(
                entity.getId(),
                entity.getTitle(),
                entity.getYear(),
                entity.getDescription(),
                entity.getFileName(),
                entity.getFileSize(),
                entity.getCreatedAt()
        );
    }
}
