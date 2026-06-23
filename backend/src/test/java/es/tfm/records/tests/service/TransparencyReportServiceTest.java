package es.tfm.records.tests.service;

import es.tfm.records.application.dto.TransparencyDtos;
import es.tfm.records.application.exception.ConflictException;
import es.tfm.records.application.exception.ResourceNotFoundException;
import es.tfm.records.application.service.TransparencyReportService;
import es.tfm.records.infrastructure.persistence.entity.TransparencyReportEntity;
import es.tfm.records.infrastructure.persistence.repository.TransparencyReportJpaRepository;
import es.tfm.records.infrastructure.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TransparencyReportServiceTest {

    @Mock
    private TransparencyReportJpaRepository repository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private TransparencyReportService service;

    private UUID reportId;
    private MockMultipartFile validFile;
    private TransparencyReportEntity sampleEntity;

    @BeforeEach
    void setUp() {
        reportId = UUID.randomUUID();
        validFile = new MockMultipartFile(
                "file",
                "report.pdf",
                "application/pdf",
                "PDF content".getBytes()
        );

        sampleEntity = new TransparencyReportEntity();
        sampleEntity.setId(reportId);
        sampleEntity.setTitle("Annual Report");
        sampleEntity.setYear(2024);
        sampleEntity.setDescription("Annual transparency report");
        sampleEntity.setFilePath("transparency/stored-uuid.pdf");
        sampleEntity.setFileName("report.pdf");
        sampleEntity.setFileSize(1024L);
        sampleEntity.setMimeType("application/pdf");
        sampleEntity.setSortOrder(1);
        sampleEntity.setPublished(true);
        sampleEntity.setCreatedAt(Instant.now());
        sampleEntity.setUpdatedAt(Instant.now());
    }

    // ========== createReport ==========

    @Test
    void createReport_shouldCreateReportWithValidFile() {
        // Given
        when(fileStorageService.store(eq("transparency"), any(MultipartFile.class)))
                .thenReturn("transparency/stored.pdf");
        when(repository.save(any(TransparencyReportEntity.class))).thenAnswer(invocation -> {
            TransparencyReportEntity e = invocation.getArgument(0);
            e.setCreatedAt(Instant.now());
            e.setUpdatedAt(Instant.now());
            return e;
        });

        // When
        TransparencyDtos.TransparencyReportDto result = service.createReport(
                "Annual Report", 2024, "Description", validFile, 1, true);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("Annual Report");
        assertThat(result.year()).isEqualTo(2024);
        assertThat(result.description()).isEqualTo("Description");
        assertThat(result.fileName()).isEqualTo("report.pdf");
        assertThat(result.published()).isTrue();
        assertThat(result.sortOrder()).isEqualTo(1);
        verify(fileStorageService).store(eq("transparency"), eq(validFile));
        verify(repository).save(any(TransparencyReportEntity.class));
    }

    @Test
    void createReport_shouldTrimTitle() {
        // Given
        when(fileStorageService.store(eq("transparency"), any(MultipartFile.class)))
                .thenReturn("transparency/stored.pdf");
        when(repository.save(any(TransparencyReportEntity.class))).thenAnswer(invocation -> {
            TransparencyReportEntity e = invocation.getArgument(0);
            e.setCreatedAt(Instant.now());
            e.setUpdatedAt(Instant.now());
            return e;
        });

        // When
        TransparencyDtos.TransparencyReportDto result = service.createReport(
                "  Trimmed Title  ", 2024, "Description", validFile, 0, false);

        // Then
        assertThat(result.title()).isEqualTo("Trimmed Title");
    }

    @Test
    void createReport_shouldThrowWhenFileIsNull() {
        assertThatThrownBy(() -> service.createReport("Title", 2024, "Desc", null, 0, false))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("EMPTY_FILE");
    }

    @Test
    void createReport_shouldThrowWhenFileIsEmpty() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> service.createReport("Title", 2024, "Desc", emptyFile, 0, false))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("EMPTY_FILE");
    }

    @Test
    void createReport_shouldThrowWhenFileIsNotPdf() {
        MockMultipartFile wrongType = new MockMultipartFile(
                "file", "image.png", "image/png", "PNG content".getBytes());

        assertThatThrownBy(() -> service.createReport("Title", 2024, "Desc", wrongType, 0, false))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("INVALID_FILE_TYPE");
    }

    @Test
    void createReport_shouldThrowWhenFileHasNullContentType() {
        MockMultipartFile nullType = new MockMultipartFile("file", "file", null, "content".getBytes());

        assertThatThrownBy(() -> service.createReport("Title", 2024, "Desc", nullType, 0, false))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("INVALID_FILE_TYPE");
    }

    @Test
    void createReport_shouldThrowWhenFileTooLarge() {
        byte[] largeContent = new byte[51 * 1024 * 1024]; // 51MB > 50MB limit
        MockMultipartFile largeFile = new MockMultipartFile(
                "file", "large.pdf", "application/pdf", largeContent);

        assertThatThrownBy(() -> service.createReport("Title", 2024, "Desc", largeFile, 0, false))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("FILE_TOO_LARGE");
    }

    // ========== listAllReports ==========

    @Test
    void listAllReports_shouldReturnAllReportsOrderedBySortOrderAndYear() {
        // Given
        TransparencyReportEntity entity1 = createEntity(UUID.randomUUID(), "Report A", 2024, 1);
        TransparencyReportEntity entity2 = createEntity(UUID.randomUUID(), "Report B", 2023, 2);
        when(repository.findAllByOrderBySortOrderAscYearDesc()).thenReturn(List.of(entity1, entity2));

        // When
        List<TransparencyDtos.TransparencyReportDto> result = service.listAllReports();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).title()).isEqualTo("Report A");
        assertThat(result.get(1).title()).isEqualTo("Report B");
    }

    @Test
    void listAllReports_shouldReturnEmptyListWhenNoReports() {
        // Given
        when(repository.findAllByOrderBySortOrderAscYearDesc()).thenReturn(List.of());

        // When
        List<TransparencyDtos.TransparencyReportDto> result = service.listAllReports();

        // Then
        assertThat(result).isEmpty();
    }

    // ========== listPublishedReports ==========

    @Test
    void listPublishedReports_shouldReturnOnlyPublishedReports() {
        // Given
        TransparencyReportEntity entity1 = createEntity(UUID.randomUUID(), "Published A", 2024, 1);
        entity1.setPublished(true);
        TransparencyReportEntity entity2 = createEntity(UUID.randomUUID(), "Published B", 2023, 2);
        entity2.setPublished(true);
        when(repository.findByPublishedTrueOrderBySortOrderAscYearDesc()).thenReturn(List.of(entity1, entity2));

        // When
        List<TransparencyDtos.PublicTransparencyReportDto> result = service.listPublishedReports();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).title()).isEqualTo("Published A");
        // Public DTO should not expose filePath
        assertThat(result.get(0).fileName()).isEqualTo("file.pdf");
    }

    @Test
    void listPublishedReports_shouldReturnEmptyListWhenNoPublishedReports() {
        // Given
        when(repository.findByPublishedTrueOrderBySortOrderAscYearDesc()).thenReturn(List.of());

        // When
        List<TransparencyDtos.PublicTransparencyReportDto> result = service.listPublishedReports();

        // Then
        assertThat(result).isEmpty();
    }

    // ========== updateReport ==========

    @Test
    void updateReport_shouldUpdateAllFieldsWhenProvided() {
        // Given
        when(repository.findById(reportId)).thenReturn(Optional.of(sampleEntity));
        when(repository.save(any(TransparencyReportEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransparencyDtos.UpdateReportRequest request = new TransparencyDtos.UpdateReportRequest(
                "Updated Title", 2025, "Updated description", 5, false);

        // When
        TransparencyDtos.TransparencyReportDto result = service.updateReport(reportId, request);

        // Then
        assertThat(result.title()).isEqualTo("Updated Title");
        assertThat(result.year()).isEqualTo(2025);
        assertThat(result.description()).isEqualTo("Updated description");
        assertThat(result.sortOrder()).isEqualTo(5);
        assertThat(result.published()).isFalse();
        verify(repository).save(any(TransparencyReportEntity.class));
    }

    @Test
    void updateReport_shouldTrimTitle() {
        // Given
        when(repository.findById(reportId)).thenReturn(Optional.of(sampleEntity));
        when(repository.save(any(TransparencyReportEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransparencyDtos.UpdateReportRequest request = new TransparencyDtos.UpdateReportRequest(
                "  Padded Title  ", null, null, null, null);

        // When
        TransparencyDtos.TransparencyReportDto result = service.updateReport(reportId, request);

        // Then
        assertThat(result.title()).isEqualTo("Padded Title");
    }

    @Test
    void updateReport_shouldOnlyUpdateNonNullFields() {
        // Given
        when(repository.findById(reportId)).thenReturn(Optional.of(sampleEntity));
        when(repository.save(any(TransparencyReportEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransparencyDtos.UpdateReportRequest request = new TransparencyDtos.UpdateReportRequest(
                null, null, null, null, true);

        // When
        TransparencyDtos.TransparencyReportDto result = service.updateReport(reportId, request);

        // Then
        assertThat(result.title()).isEqualTo("Annual Report");
        assertThat(result.year()).isEqualTo(2024);
        assertThat(result.published()).isTrue();
    }

    @Test
    void updateReport_shouldThrowWhenReportNotFound() {
        // Given
        when(repository.findById(reportId)).thenReturn(Optional.empty());
        TransparencyDtos.UpdateReportRequest request = new TransparencyDtos.UpdateReportRequest(
                "Title", null, null, null, null);

        // When/Then
        assertThatThrownBy(() -> service.updateReport(reportId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("REPORT_NOT_FOUND");
    }

    // ========== replaceFile ==========

    @Test
    void replaceFile_shouldReplaceFileAndDeleteOld() {
        // Given
        when(repository.findById(reportId)).thenReturn(Optional.of(sampleEntity));
        when(fileStorageService.store(eq("transparency"), any(MultipartFile.class)))
                .thenReturn("transparency/new-stored.pdf");
        when(repository.save(any(TransparencyReportEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MockMultipartFile newFile = new MockMultipartFile(
                "file", "new-report.pdf", "application/pdf", "new content".getBytes());

        // When
        TransparencyDtos.TransparencyReportDto result = service.replaceFile(reportId, newFile);

        // Then
        assertThat(result.fileName()).isEqualTo("new-report.pdf");
        verify(fileStorageService).deleteByPath("transparency/stored-uuid.pdf");
        verify(fileStorageService).store(eq("transparency"), eq(newFile));
    }

    @Test
    void replaceFile_shouldThrowWhenFileIsNull() {
        assertThatThrownBy(() -> service.replaceFile(reportId, null))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("EMPTY_FILE");
    }

    @Test
    void replaceFile_shouldThrowWhenFileIsEmpty() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> service.replaceFile(reportId, emptyFile))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("EMPTY_FILE");
    }

    @Test
    void replaceFile_shouldThrowWhenFileIsNotPdf() {
        MockMultipartFile wrongType = new MockMultipartFile(
                "file", "image.png", "image/png", "PNG content".getBytes());

        assertThatThrownBy(() -> service.replaceFile(reportId, wrongType))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("INVALID_FILE_TYPE");
    }

    @Test
    void replaceFile_shouldThrowWhenReportNotFound() {
        // Given
        when(repository.findById(reportId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> service.replaceFile(reportId, validFile))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("REPORT_NOT_FOUND");
    }

    // ========== deleteReport ==========

    @Test
    void deleteReport_shouldDeleteReportAndFile() {
        // Given
        when(repository.findById(reportId)).thenReturn(Optional.of(sampleEntity));

        // When
        service.deleteReport(reportId);

        // Then
        verify(fileStorageService).deleteByPath("transparency/stored-uuid.pdf");
        verify(repository).delete(sampleEntity);
    }

    @Test
    void deleteReport_shouldThrowWhenReportNotFound() {
        // Given
        when(repository.findById(reportId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> service.deleteReport(reportId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("REPORT_NOT_FOUND");
    }

    // ========== downloadReport ==========

    @Test
    void downloadReport_shouldReturnInputStream() {
        // Given
        InputStream mockStream = new ByteArrayInputStream("content".getBytes());
        when(repository.findById(reportId)).thenReturn(Optional.of(sampleEntity));
        when(fileStorageService.openStreamByPath("transparency/stored-uuid.pdf")).thenReturn(mockStream);

        // When
        InputStream result = service.downloadReport(reportId);

        // Then
        assertThat(result).isNotNull();
        verify(fileStorageService).openStreamByPath("transparency/stored-uuid.pdf");
    }

    @Test
    void downloadReport_shouldThrowWhenReportNotFound() {
        // Given
        when(repository.findById(reportId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> service.downloadReport(reportId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("REPORT_NOT_FOUND");
    }

    // ========== downloadPublishedReport ==========

    @Test
    void downloadPublishedReport_shouldReturnInputStreamWhenPublished() {
        // Given
        sampleEntity.setPublished(true);
        InputStream mockStream = new ByteArrayInputStream("content".getBytes());
        when(repository.findById(reportId)).thenReturn(Optional.of(sampleEntity));
        when(fileStorageService.openStreamByPath("transparency/stored-uuid.pdf")).thenReturn(mockStream);

        // When
        InputStream result = service.downloadPublishedReport(reportId);

        // Then
        assertThat(result).isNotNull();
    }

    @Test
    void downloadPublishedReport_shouldThrowWhenReportNotFound() {
        // Given
        when(repository.findById(reportId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> service.downloadPublishedReport(reportId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("REPORT_NOT_FOUND");
    }

    @Test
    void downloadPublishedReport_shouldThrowWhenNotPublished() {
        // Given
        sampleEntity.setPublished(false);
        when(repository.findById(reportId)).thenReturn(Optional.of(sampleEntity));

        // When/Then
        assertThatThrownBy(() -> service.downloadPublishedReport(reportId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("REPORT_NOT_FOUND");
    }

    // ========== Helper ==========

    private TransparencyReportEntity createEntity(UUID id, String title, int year, int sortOrder) {
        TransparencyReportEntity entity = new TransparencyReportEntity();
        entity.setId(id);
        entity.setTitle(title);
        entity.setYear(year);
        entity.setDescription("Description");
        entity.setFilePath("transparency/file.pdf");
        entity.setFileName("file.pdf");
        entity.setFileSize(1024L);
        entity.setMimeType("application/pdf");
        entity.setSortOrder(sortOrder);
        entity.setPublished(true);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        return entity;
    }
}
