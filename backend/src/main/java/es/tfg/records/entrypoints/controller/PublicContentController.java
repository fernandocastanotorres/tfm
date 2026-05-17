package es.tfg.records.entrypoints.controller;

import es.tfg.records.application.dto.PublicContentDtos;
import es.tfg.records.application.service.PublicContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/citizen/public-content")
@Tag(name = "Public Content", description = "Public FAQ, legislation, deadlines and events")
public class PublicContentController {

    private final PublicContentService publicContentService;

    public PublicContentController(PublicContentService publicContentService) {
        this.publicContentService = publicContentService;
    }

    @GetMapping("/legislation")
    @Operation(summary = "List public legislation")
    public ResponseEntity<List<PublicContentDtos.LegislationEntry>> listLegislation(
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(publicContentService.listPublicLegislation(type));
    }

    @GetMapping("/faq/categories")
    @Operation(summary = "List public FAQ categories")
    public ResponseEntity<List<PublicContentDtos.FaqCategoryEntry>> listFaqCategories() {
        return ResponseEntity.ok(publicContentService.listPublicFaqCategories());
    }

    @GetMapping("/faq")
    @Operation(summary = "List public FAQ entries")
    public ResponseEntity<List<PublicContentDtos.FaqEntry>> listFaq(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(publicContentService.listPublicFaq(category, q));
    }

    @GetMapping("/calendar")
    @Operation(summary = "List public calendar deadlines and events")
    public ResponseEntity<List<PublicContentDtos.CalendarEntry>> listCalendar(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer upcomingLimit) {
        return ResponseEntity.ok(publicContentService.listPublicCalendar(type, upcomingLimit));
    }

    @GetMapping("/institutional")
    @Operation(summary = "List public institutional information")
    public ResponseEntity<List<PublicContentDtos.InstitutionalEntry>> listInstitutional() {
        return ResponseEntity.ok(publicContentService.listPublicInstitutional());
    }

    @GetMapping("/organisms")
    @Operation(summary = "List public organisms directory")
    public ResponseEntity<List<PublicContentDtos.OrganismEntry>> listOrganisms(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(publicContentService.listPublicOrganisms(category, q));
    }

    @GetMapping("/resources")
    @Operation(summary = "List public resources")
    public ResponseEntity<List<PublicContentDtos.ResourceEntry>> listResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(publicContentService.listPublicResources(type, q));
    }
}
