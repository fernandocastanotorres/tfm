package es.tfg.records.infrastructure.storage;

import es.tfg.records.application.exception.ConflictException;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.infrastructure.config.FileStorageConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service for managing local file storage of uploaded documents.
 * Saves files to a configurable directory with per-case subdirectories
 * and generates unique filenames to prevent collisions.
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final Path baseDirectory;

    public FileStorageService(FileStorageConfig config) {
        this.baseDirectory = Paths.get(config.getDocumentsPath()).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(baseDirectory);
            log.info("File storage initialized at: {}", baseDirectory);
        } catch (IOException e) {
            throw new ConflictException("STORAGE", "Could not initialize file storage directory: " + baseDirectory);
        }
    }

    /**
     * Stores an uploaded file in the case-specific subdirectory.
     *
     * @param caseId the UUID of the case (expediente)
     * @param file   the uploaded multipart file
     * @return the stored filename (UUID-based with original extension)
     */
    public String store(UUID caseId, MultipartFile file) {
        Path caseDirectory = baseDirectory.resolve(caseId.toString()).normalize();

        if (!caseDirectory.startsWith(baseDirectory)) {
            throw new ConflictException("STORAGE", "Invalid case directory path");
        }

        try {
            Files.createDirectories(caseDirectory);
        } catch (IOException e) {
            throw new ConflictException("STORAGE", "Could not create case directory: " + caseDirectory);
        }

        // Generate unique filename: UUID + original extension
        String originalFilename = file.getOriginalFilename();
        String extension = extractExtension(originalFilename);
        String storedFilename = UUID.randomUUID().toString() + extension;

        Path targetPath = caseDirectory.resolve(storedFilename).normalize();

        if (!targetPath.startsWith(baseDirectory)) {
            throw new ConflictException("STORAGE", "Invalid file storage path");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored file: {} in case: {}", storedFilename, caseId);
        } catch (IOException e) {
            throw new ConflictException("STORAGE", "Could not store file: " + storedFilename);
        }

        return storedFilename;
    }

    /**
     * Opens an input stream for a stored file, suitable for streaming downloads.
     *
     * @param caseId         the UUID of the case
     * @param storedFilename the stored filename
     * @return an InputStream for the file content
     */
    public InputStream openStream(UUID caseId, String storedFilename) {
        Path filePath = resolveFilePath(caseId, storedFilename);

        try {
            return Files.newInputStream(filePath);
        } catch (IOException e) {
            throw new ResourceNotFoundException("DOC", storedFilename);
        }
    }

    /**
     * Returns the file size in bytes.
     */
    public long getFileSize(UUID caseId, String storedFilename) {
        Path filePath = resolveFilePath(caseId, storedFilename);

        try {
            return Files.size(filePath);
        } catch (IOException e) {
            throw new ResourceNotFoundException("DOC", storedFilename);
        }
    }

    /**
     * Checks if a file exists in storage.
     */
    public boolean exists(UUID caseId, String storedFilename) {
        Path filePath = baseDirectory.resolve(caseId.toString())
                .resolve(storedFilename)
                .normalize();
        return Files.exists(filePath);
    }

    /**
     * Deletes a file from storage.
     */
    public void delete(UUID caseId, String storedFilename) {
        Path filePath = resolveFilePath(caseId, storedFilename);

        try {
            Files.deleteIfExists(filePath);
            log.debug("Deleted file: {} from case: {}", storedFilename, caseId);
        } catch (IOException e) {
            throw new ConflictException("STORAGE", "Could not delete file: " + storedFilename);
        }
    }

    /**
     * Returns the resolved Path for a stored file, with path traversal protection.
     */
    private Path resolveFilePath(UUID caseId, String storedFilename) {
        Path filePath = baseDirectory.resolve(caseId.toString())
                .resolve(storedFilename)
                .normalize();

        if (!filePath.startsWith(baseDirectory)) {
            throw new ConflictException("STORAGE", "Invalid file path: path traversal detected");
        }

        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("DOC", storedFilename);
        }

        return filePath;
    }

    /**
     * Extracts the file extension from a filename, including the dot.
     * Returns empty string if no extension found.
     */
    private String extractExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0 && lastDot < filename.length() - 1) {
            return filename.substring(lastDot);
        }
        return "";
    }

    /**
     * Stores an uploaded file in a named subdirectory (e.g. "transparency").
     *
     * @param subDirectory the subdirectory name (validated against path traversal)
     * @param file         the uploaded multipart file
     * @return the stored filename (UUID-based with original extension)
     */
    public String store(String subDirectory, MultipartFile file) {
        String safeSubDir = normalizeSubDirectory(subDirectory);
        Path targetDirectory = baseDirectory.resolve(safeSubDir).normalize();

        if (!targetDirectory.startsWith(baseDirectory)) {
            throw new ConflictException("STORAGE", "Invalid subdirectory path");
        }

        try {
            Files.createDirectories(targetDirectory);
        } catch (IOException e) {
            throw new ConflictException("STORAGE", "Could not create directory: " + targetDirectory);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = extractExtension(originalFilename);
        String storedFilename = UUID.randomUUID().toString() + extension;

        Path targetPath = targetDirectory.resolve(storedFilename).normalize();

        if (!targetPath.startsWith(baseDirectory)) {
            throw new ConflictException("STORAGE", "Invalid file storage path");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored file: {} in subdirectory: {}", storedFilename, safeSubDir);
        } catch (IOException e) {
            throw new ConflictException("STORAGE", "Could not store file: " + storedFilename);
        }

        return safeSubDir + "/" + storedFilename;
    }

    /**
     * Opens an input stream for a stored file by its relative path.
     *
     * @param relativePath the relative path from base directory (e.g. "transparency/uuid.pdf")
     * @return an InputStream for the file content
     */
    public InputStream openStreamByPath(String relativePath) {
        Path filePath = resolvePath(relativePath);
        try {
            return Files.newInputStream(filePath);
        } catch (IOException e) {
            throw new ResourceNotFoundException("DOC", relativePath);
        }
    }

    /**
     * Returns the file size in bytes by relative path.
     */
    public long getFileSizeByPath(String relativePath) {
        Path filePath = resolvePath(relativePath);
        try {
            return Files.size(filePath);
        } catch (IOException e) {
            throw new ResourceNotFoundException("DOC", relativePath);
        }
    }

    /**
     * Checks if a file exists by relative path.
     */
    public boolean existsByPath(String relativePath) {
        Path filePath = baseDirectory.resolve(relativePath).normalize();
        return filePath.startsWith(baseDirectory) && Files.exists(filePath);
    }

    /**
     * Deletes a file by relative path.
     */
    public void deleteByPath(String relativePath) {
        Path filePath = resolvePathIfExists(relativePath);
        try {
            Files.deleteIfExists(filePath);
            log.debug("Deleted file: {}", relativePath);
        } catch (IOException e) {
            throw new ConflictException("STORAGE", "Could not delete file: " + relativePath);
        }
    }

    private String normalizeSubDirectory(String subDirectory) {
        if (subDirectory == null || subDirectory.isBlank()) {
            throw new ConflictException("STORAGE", "Subdirectory name is required");
        }
        String normalized = subDirectory.trim().replaceAll("[^a-zA-Z0-9_-]", "");
        if (normalized.isBlank()) {
            throw new ConflictException("STORAGE", "Invalid subdirectory name");
        }
        return normalized;
    }

    private Path resolvePath(String relativePath) {
        Path filePath = baseDirectory.resolve(relativePath).normalize();
        if (!filePath.startsWith(baseDirectory)) {
            throw new ConflictException("STORAGE", "Invalid file path: path traversal detected");
        }
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("DOC", relativePath);
        }
        return filePath;
    }

    private Path resolvePathIfExists(String relativePath) {
        Path filePath = baseDirectory.resolve(relativePath).normalize();
        if (!filePath.startsWith(baseDirectory)) {
            throw new ConflictException("STORAGE", "Invalid file path: path traversal detected");
        }
        return filePath;
    }
}
