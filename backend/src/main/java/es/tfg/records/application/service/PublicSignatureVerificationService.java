package es.tfg.records.application.service;

import es.tfg.records.application.dto.PublicSignatureVerificationDto;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.domain.model.Document;
import es.tfg.records.domain.port.DocumentRepository;
import es.tfg.records.infrastructure.persistence.entity.DocumentVerificationEntity;
import es.tfg.records.infrastructure.persistence.repository.DocumentVerificationJpaRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class PublicSignatureVerificationService {

    private final DocumentVerificationJpaRepository verificationRepository;
    private final DocumentRepository documentRepository;

    public PublicSignatureVerificationService(DocumentVerificationJpaRepository verificationRepository,
                                             DocumentRepository documentRepository) {
        this.verificationRepository = verificationRepository;
        this.documentRepository = documentRepository;
    }

    public void registerSignedDocument(Document document, byte[] signedContent) {
        DocumentVerificationEntity entity = verificationRepository.findByDocumentId(document.getId())
                .orElseGet(DocumentVerificationEntity::new);

        if (entity.getId() == null) {
            entity.setId(UUID.randomUUID());
            entity.setDocumentId(document.getId());
            entity.setCsvCode(generateCsvCode(document.getId()));
            entity.setCreatedAt(Instant.now());
        }

        entity.setSignedDigest(sha256Hex(signedContent));
        entity.setSignedAt(document.getSignedAt() != null ? document.getSignedAt() : Instant.now());
        verificationRepository.save(entity);
    }

    public PublicSignatureVerificationDto verifyByCsv(String csvCode) {
        DocumentVerificationEntity verification = verificationRepository.findByCsvCode(csvCode)
                .orElseThrow(() -> new ResourceNotFoundException("CSV", csvCode));

        Document document = documentRepository.findById(verification.getDocumentId())
                .orElseThrow(() -> new ResourceNotFoundException("DOC", verification.getDocumentId().toString()));

        return new PublicSignatureVerificationDto(
                document.getSignedStoragePath() != null,
                document.getSignedStoragePath() != null ? "Documento firmado y verificado por CSV" : "El documento existe pero no tiene artefacto firmado",
                verification.getCsvCode(),
                document.getId(),
                document.getProcedureId(),
                verification.getSignedAt(),
                verification.getSignedDigest()
        );
    }

    public String findCsvCodeByDocumentId(UUID documentId) {
        return verificationRepository.findByDocumentId(documentId)
                .map(DocumentVerificationEntity::getCsvCode)
                .orElse(null);
    }

    private String generateCsvCode(UUID documentId) {
        String candidate;
        do {
            String raw = documentId + "|" + Instant.now() + "|" + UUID.randomUUID();
            candidate = sha256Hex(raw.getBytes(StandardCharsets.UTF_8)).substring(0, 20).toUpperCase();
        } while (verificationRepository.existsByCsvCode(candidate));
        return candidate;
    }

    private String sha256Hex(byte[] value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to compute SHA-256", e);
        }
    }
}
