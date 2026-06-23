package es.tfm.records.entrypoints.controller;

import es.tfm.records.application.dto.PublicSignatureVerificationDto;
import es.tfm.records.application.service.PublicSignatureVerificationService;
import es.tfm.records.application.service.SignatureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/public/signatures")
@Tag(name = "Public Signature Verification", description = "Public endpoints for signature validation by file or CSV")
public class PublicSignatureVerificationController {

    private final SignatureService signatureService;
    private final PublicSignatureVerificationService publicSignatureVerificationService;

    public PublicSignatureVerificationController(SignatureService signatureService,
                                                 PublicSignatureVerificationService publicSignatureVerificationService) {
        this.signatureService = signatureService;
        this.publicSignatureVerificationService = publicSignatureVerificationService;
    }

    @PostMapping("/verify-file")
    @Operation(summary = "Validate signed file", description = "Validates a signed PDF file without authentication")
    public ResponseEntity<Map<String, Object>> verifyFile(@RequestParam("file") MultipartFile file) throws Exception {
        boolean valid = signatureService.verifySignature(file.getBytes());
        return ResponseEntity.ok(Map.of(
                "valid", valid,
                "message", valid ? "Firma valida" : "Firma no valida o no encontrada",
                "filename", file.getOriginalFilename()
        ));
    }

    @GetMapping("/verify-csv/{csvCode}")
    @Operation(summary = "Validate by CSV", description = "Validates a signed document by CSV code")
    public ResponseEntity<PublicSignatureVerificationDto> verifyByCsv(@PathVariable String csvCode) {
        return ResponseEntity.ok(publicSignatureVerificationService.verifyByCsv(csvCode));
    }
}
