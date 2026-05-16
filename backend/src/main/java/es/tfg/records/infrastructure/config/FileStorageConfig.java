package es.tfg.records.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Type-safe configuration properties for local file storage.
 */
@ConfigurationProperties(prefix = "storage")
public class FileStorageConfig {

    /**
     * Base directory for storing uploaded documents.
     * Default: ./data/documents
     */
    private String documentsPath = "./data/documents";

    public String getDocumentsPath() {
        return documentsPath;
    }

    public void setDocumentsPath(String documentsPath) {
        this.documentsPath = documentsPath;
    }
}
