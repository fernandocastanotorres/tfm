package es.tfm.records.entrypoints.controller;

import es.tfm.records.application.service.SignatureService;
import es.tfm.records.infrastructure.audit.AuditService;
import es.tfm.records.infrastructure.persistence.entity.AuditLogEntity.AuditAction;
import es.tfm.records.infrastructure.persistence.entity.AuditLogEntity.AuditResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST controller for electronic document signing operations.
 * Provides endpoints for signing, verifying, and downloading signed documents.
 */
@RestController
@RequestMapping("/citizen/signatures")
@Tag(name = "Signatures", description = "Electronic document signing operations (PAdES)")
@SecurityRequirement(name = "bearerAuth")
public class SignatureController {

    private static final Logger log = LoggerFactory.getLogger(SignatureController.class);

    private final SignatureService signatureService;
    private final AuditService auditService;

    public SignatureController(SignatureService signatureService, AuditService auditService) {
        this.signatureService = signatureService;
        this.auditService = auditService;
    }

    /**
     * Upload a document and sign it with PAdES-BES.
     */
    @PostMapping(value = "/sign", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    @Operation(summary = "Sign a document", description = "Upload a document and sign it using PAdES-BES electronic signature")
    public ResponseEntity<byte[]> signDocument(@RequestParam("file") MultipartFile file) {
        try {
            byte[] content = file.getBytes();
            String originalFilename = file.getOriginalFilename();
            String contentType = file.getContentType();

            log.info("Signing document: {} ({} bytes, {})", originalFilename, content.length, contentType);

            byte[] signedContent = signatureService.signDocument(content);

            auditService.record(AuditAction.SIGN, "DOCUMENT", AuditResult.SUCCESS,
                    "Signed document: " + originalFilename);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "signed-" + originalFilename);
            headers.setContentLength(signedContent.length);

            return new ResponseEntity<>(signedContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to sign document", e);

            auditService.record(AuditAction.SIGN, "DOCUMENT", AuditResult.FAILURE,
                    "Signing failed");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Signing failed".getBytes());
        }
    }

    /**
     * Compute the SHA-256 digest of a document for external signing workflows.
     */
    @PostMapping("/digest")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN')")
    @Operation(summary = "Compute document digest", description = "Calculate SHA-256 hash of a document for external signing")
    public ResponseEntity<Map<String, String>> computeDigest(@RequestParam("file") MultipartFile file) {
        try {
            byte[] content = file.getBytes();
            String digest = signatureService.computeDigest(content);

            return ResponseEntity.ok(Map.of(
                    "algorithm", "SHA-256",
                    "digest", digest,
                    "filename", file.getOriginalFilename()
            ));
        } catch (Exception e) {
            log.error("Failed to compute digest", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Digest computation failed"));
        }
    }

    /**
     * Verify the electronic signature of a signed PDF document.
     */
    @PostMapping("/verify")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN') or hasRole('TRAMITADOR')")
    @Operation(summary = "Verify document signature", description = "Verify the PAdES electronic signature of a signed PDF document")
    public ResponseEntity<Map<String, Object>> verifySignature(@RequestParam("file") MultipartFile file) {
        try {
            byte[] content = file.getBytes();
            boolean isValid = signatureService.verifySignature(content);

            auditService.record(AuditAction.VIEW, "DOCUMENT",
                    isValid ? AuditResult.SUCCESS : AuditResult.FAILURE,
                    "Signature verification: " + (isValid ? "valid" : "invalid"));

            return ResponseEntity.ok(Map.of(
                    "valid", isValid,
                    "filename", file.getOriginalFilename(),
                    "message", isValid ? "Signature is valid" : "Signature is invalid or not found"
            ));
        } catch (Exception e) {
            log.error("Failed to verify signature", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Verification failed"));
        }
    }

    /**
     * Get information about the signing certificate used by the service.
     */
    @GetMapping("/certificate-info")
    @PreAuthorize("hasRole('CITIZEN') or hasRole('ADMIN') or hasRole('TRAMITADOR')")
    @Operation(summary = "Get signing certificate info", description = "Returns information about the service signing certificate")
    public ResponseEntity<Map<String, String>> getCertificateInfo() {
        String subject = signatureService.getSigningCertificateSubject();
        return ResponseEntity.ok(Map.of(
                "subject", subject,
                "type", "PAdES-BES",
                "algorithm", "SHA-256 with RSA"
        ));
    }
}
