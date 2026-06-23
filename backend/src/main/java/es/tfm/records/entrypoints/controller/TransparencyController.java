package es.tfm.records.entrypoints.controller;

import es.tfm.records.application.dto.TransparencyDtos;
import es.tfm.records.application.service.TransparencyReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/transparency/reports")
@Tag(name = "Transparency Reports", description = "Admin CRUD for transparency PDF reports")
@SecurityRequirement(name = "bearerAuth")
public class TransparencyController {

    private final TransparencyReportService transparencyReportService;

    public TransparencyController(TransparencyReportService transparencyReportService) {
        this.transparencyReportService = transparencyReportService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create transparency report with PDF upload")
    public ResponseEntity<TransparencyDtos.TransparencyReportDto> createReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("year") int year,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "sortOrder", required = false) Integer sortOrder,
            @RequestParam(value = "published", required = false) Boolean published) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(transparencyReportService.createReport(title, year, description, file,
                        sortOrder != null ? sortOrder : 0, published != null && published));
    }

    @GetMapping
    @Operation(summary = "List all transparency reports (admin)")
    public ResponseEntity<List<TransparencyDtos.TransparencyReportDto>> listReports() {
        return ResponseEntity.ok(transparencyReportService.listAllReports());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update report metadata")
    public ResponseEntity<TransparencyDtos.TransparencyReportDto> updateReport(
            @PathVariable UUID id,
            @RequestBody TransparencyDtos.UpdateReportRequest request) {
        return ResponseEntity.ok(transparencyReportService.updateReport(id, request));
    }

    @PostMapping(value = "/{id}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Replace report PDF file")
    public ResponseEntity<TransparencyDtos.TransparencyReportDto> replaceFile(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(transparencyReportService.replaceFile(id, file));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transparency report")
    public ResponseEntity<Void> deleteReport(@PathVariable UUID id) {
        transparencyReportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download report PDF (admin)")
    public ResponseEntity<InputStreamResource> downloadReport(@PathVariable UUID id) {
        TransparencyDtos.TransparencyReportDto report = transparencyReportService.listAllReports().stream()
                .filter(r -> r.id().equals(id))
                .findFirst()
                .orElse(null);
        if (report == null) {
            return ResponseEntity.notFound().build();
        }
        InputStreamResource resource = new InputStreamResource(transparencyReportService.downloadReport(id));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + report.fileName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
