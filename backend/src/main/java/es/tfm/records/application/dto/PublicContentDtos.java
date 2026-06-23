package es.tfm.records.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public final class PublicContentDtos {

    private PublicContentDtos() {
    }

    @Schema(description = "Backoffice-managed public legislation entry")
    public record LegislationEntry(
            UUID id,
            String locale,
            String type,
            String title,
            String description,
            LocalDate publicationDate,
            String externalUrl,
            String downloadUrl,
            Integer sortOrder,
            boolean published,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record LegislationUpsertRequest(
            String locale,
            UUID translationGroupId,
            String type,
            String title,
            String description,
            LocalDate publicationDate,
            String externalUrl,
            String downloadUrl,
            Integer sortOrder,
            Boolean published
    ) {
    }

    @Schema(description = "Backoffice-managed FAQ category")
    public record FaqCategoryEntry(
            UUID id,
            String locale,
            String categoryCode,
            String categoryName,
            Integer sortOrder,
            boolean published,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record FaqCategoryUpsertRequest(
            String locale,
            UUID translationGroupId,
            String categoryCode,
            String categoryName,
            Integer sortOrder,
            Boolean published
    ) {
    }

    @Schema(description = "Backoffice-managed FAQ item")
    public record FaqEntry(
            UUID id,
            String locale,
            String categoryCode,
            String question,
            String answer,
            Integer sortOrder,
            boolean published,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record FaqUpsertRequest(
            String locale,
            UUID translationGroupId,
            String categoryCode,
            String question,
            String answer,
            Integer sortOrder,
            Boolean published
    ) {
    }

    @Schema(description = "Backoffice-managed calendar event or deadline")
    public record CalendarEntry(
            UUID id,
            String locale,
            String type,
            String title,
            String description,
            LocalDate eventDate,
            String relatedProcedure,
            Integer sortOrder,
            boolean published,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record CalendarUpsertRequest(
            String locale,
            UUID translationGroupId,
            String type,
            String title,
            String description,
            LocalDate eventDate,
            String relatedProcedure,
            Integer sortOrder,
            Boolean published
    ) {
    }

    @Schema(description = "Backoffice-managed institutional information section")
    public record InstitutionalEntry(
            UUID id,
            String locale,
            String sectionCode,
            String title,
            String content,
            String icon,
            Integer sortOrder,
            boolean published,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record InstitutionalUpsertRequest(
            String locale,
            UUID translationGroupId,
            String sectionCode,
            String title,
            String content,
            String icon,
            Integer sortOrder,
            Boolean published
    ) {
    }

    @Schema(description = "Backoffice-managed public organism directory entry")
    public record OrganismEntry(
            UUID id,
            String locale,
            String categoryCode,
            String name,
            String description,
            String phone,
            String email,
            String address,
            String websiteUrl,
            Integer sortOrder,
            boolean published,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record OrganismUpsertRequest(
            String locale,
            UUID translationGroupId,
            String categoryCode,
            String name,
            String description,
            String phone,
            String email,
            String address,
            String websiteUrl,
            Integer sortOrder,
            Boolean published
    ) {
    }

    @Schema(description = "Backoffice-managed public resource entry")
    public record ResourceEntry(
            UUID id,
            String locale,
            String resourceType,
            String title,
            String description,
            String content,
            String externalUrl,
            Integer sortOrder,
            boolean published,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record ResourceUpsertRequest(
            String locale,
            UUID translationGroupId,
            String resourceType,
            String title,
            String description,
            String content,
            String externalUrl,
            Integer sortOrder,
            Boolean published
    ) {
    }

    @Schema(description = "Configurable public theme palette")
    public record ThemePalette(
            java.util.List<ThemeColor> colors,
            Instant updatedAt
    ) {
    }

    public record ThemeCatalog(
            java.util.List<ThemeVariant> themes,
            String activeThemeId,
            Instant updatedAt
    ) {
    }

    public record ThemeVariant(
            String id,
            String name,
            String mode,
            java.util.List<ThemeColor> colors,
            boolean active
    ) {
    }

    public record ThemeColor(
            String token,
            String value
    ) {
    }

    public record ThemePaletteUpsertRequest(
            java.util.List<ThemeVariant> themes,
            String activeThemeId
    ) {
    }
}
