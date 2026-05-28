package es.tfg.records.application.service;

import es.tfg.records.application.dto.PublicContentDtos;
import es.tfg.records.application.exception.ResourceNotFoundException;
import es.tfg.records.infrastructure.persistence.entity.PublicContentEntryEntity;
import es.tfg.records.infrastructure.persistence.repository.PublicContentEntryJpaRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
public class PublicContentService {

    private static final String KIND_LEGISLATION = "LEGISLATION";
    private static final String KIND_FAQ_CATEGORY = "FAQ_CATEGORY";
    private static final String KIND_FAQ = "FAQ";
    private static final String KIND_CALENDAR = "CALENDAR";
    private static final String KIND_INSTITUTIONAL = "INSTITUTIONAL";
    private static final String KIND_ORGANISM = "ORGANISM";
    private static final String KIND_RESOURCE = "RESOURCE";
    private static final String KIND_ORGANISM_CATEGORY = "ORGANISM_CATEGORY";
    private static final String KIND_THEME = "THEME";
    private static final String DEFAULT_LOCALE = "es-ES";

    private final PublicContentEntryJpaRepository repository;

    public PublicContentService(PublicContentEntryJpaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.LegislationEntry> listLegislationAdmin() {
        return repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_LEGISLATION, DEFAULT_LOCALE).stream().map(this::toLegislation).toList();
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.LegislationEntry createLegislation(PublicContentDtos.LegislationUpsertRequest request) {
        PublicContentEntryEntity entity = baseEntity(KIND_LEGISLATION, request.locale(), request.translationGroupId());
        applyLegislation(entity, request);
        return toLegislation(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.LegislationEntry updateLegislation(UUID id, PublicContentDtos.LegislationUpsertRequest request) {
        PublicContentEntryEntity entity = findByGroup(KIND_LEGISLATION, id, normalizeLocale(request.locale()));
        applyLegislation(entity, request);
        return toLegislation(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public void deleteLegislation(UUID id) {
        repository.deleteByEntryKindAndTranslationGroupId(KIND_LEGISLATION, id);
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.FaqCategoryEntry> listFaqCategoriesAdmin() {
        return repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_FAQ_CATEGORY, DEFAULT_LOCALE).stream().map(this::toFaqCategory).toList();
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.FaqEntry> listFaqAdmin() {
        return repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_FAQ, DEFAULT_LOCALE).stream().map(this::toFaq).toList();
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.FaqCategoryEntry createFaqCategory(PublicContentDtos.FaqCategoryUpsertRequest request) {
        PublicContentEntryEntity entity = baseEntity(KIND_FAQ_CATEGORY, request.locale(), request.translationGroupId());
        applyFaqCategory(entity, request);
        return toFaqCategory(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.FaqCategoryEntry updateFaqCategory(UUID id, PublicContentDtos.FaqCategoryUpsertRequest request) {
        PublicContentEntryEntity entity = findByGroup(KIND_FAQ_CATEGORY, id, normalizeLocale(request.locale()));
        applyFaqCategory(entity, request);
        return toFaqCategory(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public void deleteFaqCategory(UUID id) {
        repository.deleteByEntryKindAndTranslationGroupId(KIND_FAQ_CATEGORY, id);
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.FaqEntry createFaq(PublicContentDtos.FaqUpsertRequest request) {
        PublicContentEntryEntity entity = baseEntity(KIND_FAQ, request.locale(), request.translationGroupId());
        applyFaq(entity, request);
        return toFaq(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.FaqEntry updateFaq(UUID id, PublicContentDtos.FaqUpsertRequest request) {
        PublicContentEntryEntity entity = findByGroup(KIND_FAQ, id, normalizeLocale(request.locale()));
        applyFaq(entity, request);
        return toFaq(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public void deleteFaq(UUID id) {
        repository.deleteByEntryKindAndTranslationGroupId(KIND_FAQ, id);
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.CalendarEntry> listCalendarAdmin() {
        return repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_CALENDAR, DEFAULT_LOCALE).stream().map(this::toCalendar).toList();
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.CalendarEntry createCalendar(PublicContentDtos.CalendarUpsertRequest request) {
        PublicContentEntryEntity entity = baseEntity(KIND_CALENDAR, request.locale(), request.translationGroupId());
        applyCalendar(entity, request);
        return toCalendar(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.CalendarEntry updateCalendar(UUID id, PublicContentDtos.CalendarUpsertRequest request) {
        PublicContentEntryEntity entity = findByGroup(KIND_CALENDAR, id, normalizeLocale(request.locale()));
        applyCalendar(entity, request);
        return toCalendar(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public void deleteCalendar(UUID id) {
        repository.deleteByEntryKindAndTranslationGroupId(KIND_CALENDAR, id);
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.InstitutionalEntry> listInstitutionalAdmin() {
        return repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_INSTITUTIONAL, DEFAULT_LOCALE).stream().map(this::toInstitutional).toList();
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.InstitutionalEntry createInstitutional(PublicContentDtos.InstitutionalUpsertRequest request) {
        PublicContentEntryEntity entity = baseEntity(KIND_INSTITUTIONAL, request.locale(), request.translationGroupId());
        applyInstitutional(entity, request);
        return toInstitutional(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.InstitutionalEntry updateInstitutional(UUID id, PublicContentDtos.InstitutionalUpsertRequest request) {
        PublicContentEntryEntity entity = findByGroup(KIND_INSTITUTIONAL, id, normalizeLocale(request.locale()));
        applyInstitutional(entity, request);
        return toInstitutional(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public void deleteInstitutional(UUID id) {
        repository.deleteByEntryKindAndTranslationGroupId(KIND_INSTITUTIONAL, id);
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.OrganismEntry> listOrganismsAdmin() {
        return repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_ORGANISM, DEFAULT_LOCALE).stream().map(this::toOrganism).toList();
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.FaqCategoryEntry> listOrganismCategoriesAdmin() {
        return repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_ORGANISM_CATEGORY, DEFAULT_LOCALE).stream().map(this::toFaqCategory).toList();
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.OrganismEntry createOrganism(PublicContentDtos.OrganismUpsertRequest request) {
        PublicContentEntryEntity entity = baseEntity(KIND_ORGANISM, request.locale(), request.translationGroupId());
        applyOrganism(entity, request);
        return toOrganism(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.OrganismEntry updateOrganism(UUID id, PublicContentDtos.OrganismUpsertRequest request) {
        PublicContentEntryEntity entity = findByGroup(KIND_ORGANISM, id, normalizeLocale(request.locale()));
        applyOrganism(entity, request);
        return toOrganism(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public void deleteOrganism(UUID id) {
        repository.deleteByEntryKindAndTranslationGroupId(KIND_ORGANISM, id);
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.ResourceEntry> listResourcesAdmin() {
        return repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_RESOURCE, DEFAULT_LOCALE).stream().map(this::toResource).toList();
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.ResourceEntry createResource(PublicContentDtos.ResourceUpsertRequest request) {
        PublicContentEntryEntity entity = baseEntity(KIND_RESOURCE, request.locale(), request.translationGroupId());
        applyResource(entity, request);
        return toResource(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.ResourceEntry updateResource(UUID id, PublicContentDtos.ResourceUpsertRequest request) {
        PublicContentEntryEntity entity = findByGroup(KIND_RESOURCE, id, normalizeLocale(request.locale()));
        applyResource(entity, request);
        return toResource(repository.save(entity));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public void deleteResource(UUID id) {
        repository.deleteByEntryKindAndTranslationGroupId(KIND_RESOURCE, id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public-content", key = "'legislation:' + #type + ':' + T(org.springframework.context.i18n.LocaleContextHolder).getLocale().toLanguageTag()")
    public List<PublicContentDtos.LegislationEntry> listPublicLegislation(String type) {
        List<PublicContentEntryEntity> localized = localize(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_LEGISLATION));
        return localized.stream()
                .filter(item -> isBlank(type) || Objects.equals(normalize(item.getValueType()), normalize(type)))
                .map(this::toLegislation)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.LegislationEntry> listLegislationTranslations(UUID groupId) {
        return repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc(KIND_LEGISLATION, groupId).stream().map(this::toLegislation).toList();
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.FaqCategoryEntry> listFaqCategoryTranslations(UUID groupId) {
        return repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc(KIND_FAQ_CATEGORY, groupId).stream().map(this::toFaqCategory).toList();
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.FaqEntry> listFaqTranslations(UUID groupId) {
        return repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc(KIND_FAQ, groupId).stream().map(this::toFaq).toList();
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.CalendarEntry> listCalendarTranslations(UUID groupId) {
        return repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc(KIND_CALENDAR, groupId).stream().map(this::toCalendar).toList();
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.InstitutionalEntry> listInstitutionalTranslations(UUID groupId) {
        return repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc(KIND_INSTITUTIONAL, groupId).stream().map(this::toInstitutional).toList();
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.OrganismEntry> listOrganismTranslations(UUID groupId) {
        return repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc(KIND_ORGANISM, groupId).stream().map(this::toOrganism).toList();
    }

    @Transactional(readOnly = true)
    public List<PublicContentDtos.ResourceEntry> listResourceTranslations(UUID groupId) {
        return repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc(KIND_RESOURCE, groupId).stream().map(this::toResource).toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public-content", key = "'faq-categories:' + T(org.springframework.context.i18n.LocaleContextHolder).getLocale().toLanguageTag()")
    public List<PublicContentDtos.FaqCategoryEntry> listPublicFaqCategories() {
        return localize(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_FAQ_CATEGORY)).stream()
                .map(this::toFaqCategory)
                .toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public-content", key = "'faq:' + #categoryCode + ':' + #q + ':' + T(org.springframework.context.i18n.LocaleContextHolder).getLocale().toLanguageTag()")
    public List<PublicContentDtos.FaqEntry> listPublicFaq(String categoryCode, String q) {
        String query = normalize(q);
        return localize(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_FAQ)).stream()
                .filter(item -> isBlank(categoryCode) || Objects.equals(normalize(item.getCategoryCode()), normalize(categoryCode)))
                .filter(item -> isBlank(query)
                        || normalize(item.getTitleText()).contains(query)
                        || normalize(item.getBodyText()).contains(query))
                .map(this::toFaq)
                .toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public-content", key = "'calendar:' + #type + ':' + #upcomingLimit + ':' + T(org.springframework.context.i18n.LocaleContextHolder).getLocale().toLanguageTag()")
    public List<PublicContentDtos.CalendarEntry> listPublicCalendar(String type, Integer upcomingLimit) {
        List<PublicContentDtos.CalendarEntry> items = localize(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_CALENDAR)).stream()
                .filter(item -> isBlank(type) || Objects.equals(normalize(item.getValueType()), normalize(type)))
                .sorted(Comparator.comparing(PublicContentEntryEntity::getEventDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toCalendar)
                .toList();
        if (upcomingLimit != null && upcomingLimit > 0 && items.size() > upcomingLimit) {
            return items.subList(0, upcomingLimit);
        }
        return items;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public-content", key = "'institutional:' + T(org.springframework.context.i18n.LocaleContextHolder).getLocale().toLanguageTag()")
    public List<PublicContentDtos.InstitutionalEntry> listPublicInstitutional() {
        return localize(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_INSTITUTIONAL)).stream()
                .map(this::toInstitutional)
                .toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public-content", key = "'organisms:' + #category + ':' + #q + ':' + T(org.springframework.context.i18n.LocaleContextHolder).getLocale().toLanguageTag()")
    public List<PublicContentDtos.OrganismEntry> listPublicOrganisms(String category, String q) {
        String query = normalize(q);
        return localize(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_ORGANISM)).stream()
                .filter(item -> isBlank(category) || Objects.equals(normalize(item.getCategoryCode()), normalize(category)))
                .filter(item -> isBlank(query)
                        || normalize(item.getTitleText()).contains(query)
                        || normalize(item.getBodyText()).contains(query)
                        || normalize(item.getDownloadUrl()).contains(query)
                        || normalize(item.getRelatedProcedure()).contains(query))
                .map(this::toOrganism)
                .toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public-content", key = "'resources:' + #resourceType + ':' + #q + ':' + T(org.springframework.context.i18n.LocaleContextHolder).getLocale().toLanguageTag()")
    public List<PublicContentDtos.ResourceEntry> listPublicResources(String resourceType, String q) {
        String query = normalize(q);
        return localize(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_RESOURCE)).stream()
                .filter(item -> isBlank(resourceType) || Objects.equals(normalize(item.getValueType()), normalize(resourceType)))
                .filter(item -> isBlank(query)
                        || normalize(item.getTitleText()).contains(query)
                        || normalize(item.getBodyText()).contains(query)
                        || normalize(item.getRelatedProcedure()).contains(query))
                .map(this::toResource)
                .toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public-content", key = "'theme-palette'")
    public PublicContentDtos.ThemePalette getPublicThemePalette() {
        PublicContentDtos.ThemeCatalog catalog = toThemeCatalog(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_THEME));
        String activeThemeId = isBlank(catalog.activeThemeId())
                ? (catalog.themes().isEmpty() ? null : catalog.themes().get(0).id())
                : catalog.activeThemeId();

        List<PublicContentDtos.ThemeColor> lightColors = catalog.themes().stream()
                .filter(t -> Objects.equals(t.id(), activeThemeId) && Objects.equals(t.mode(), "light"))
                .findFirst().map(PublicContentDtos.ThemeVariant::colors).orElse(List.of());

        List<PublicContentDtos.ThemeColor> darkColors = catalog.themes().stream()
                .filter(t -> Objects.equals(t.id(), activeThemeId) && Objects.equals(t.mode(), "dark"))
                .findFirst().map(PublicContentDtos.ThemeVariant::colors).orElse(List.of());

        Map<String, String> normalized = new LinkedHashMap<>();

        for (PublicContentDtos.ThemeColor lc : lightColors) {
            if (lc == null || isBlank(lc.token()) || isBlank(lc.value())) {
                continue;
            }
            String token = lc.token().trim();
            normalized.putIfAbsent(token, lc.value().trim());
        }

        for (PublicContentDtos.ThemeColor dc : darkColors) {
            if (dc == null || isBlank(dc.token()) || isBlank(dc.value())) {
                continue;
            }
            String baseToken = dc.token().trim();
            String darkToken = baseToken.endsWith("-dark") ? baseToken : baseToken + "-dark";
            normalized.putIfAbsent(darkToken, dc.value().trim());
        }

        List<PublicContentDtos.ThemeColor> allColors = normalized.entrySet().stream()
                .map(entry -> new PublicContentDtos.ThemeColor(entry.getKey(), entry.getValue()))
                .toList();

        return new PublicContentDtos.ThemePalette(allColors, catalog.updatedAt());
    }

    @Transactional(readOnly = true)
    public PublicContentDtos.ThemeCatalog getThemePaletteAdmin() {
        return toThemeCatalog(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_THEME));
    }

    @Transactional
    @CacheEvict(value = "public-content", allEntries = true)
    public PublicContentDtos.ThemeCatalog saveThemePalette(PublicContentDtos.ThemePaletteUpsertRequest request) {
        List<PublicContentDtos.ThemeVariant> themes = request == null || request.themes() == null
                ? List.of()
                : request.themes();
        String activeThemeId = request == null ? null : normalize(request.activeThemeId());

        repository.deleteAll(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc(KIND_THEME));

        int themeIndex = 0;
        for (PublicContentDtos.ThemeVariant theme : themes) {
            if (theme == null || isBlank(theme.id()) || isBlank(theme.name()) || theme.colors() == null || theme.colors().isEmpty()) {
                continue;
            }

            String mode = isBlank(theme.mode()) ? "light" : theme.mode().trim();
            int colorIndex = 0;
            for (PublicContentDtos.ThemeColor color : theme.colors()) {
                if (color == null || isBlank(color.token()) || isBlank(color.value())) {
                    continue;
                }
                PublicContentEntryEntity entity = baseEntity(KIND_THEME, mode, UUID.randomUUID());
                entity.setCategoryCode(theme.id().trim());
                entity.setRelatedProcedure(theme.name().trim());
                entity.setValueType(color.token().trim());
                entity.setTitleText(color.value().trim());
                entity.setBodyText("");
                entity.setSortOrder(themeIndex * 1000 + colorIndex++);
                entity.setPublished(Objects.equals(normalize(theme.id()), activeThemeId));
                repository.save(entity);
            }
            themeIndex++;
        }

        return getThemePaletteAdmin();
    }

    private List<PublicContentEntryEntity> localize(List<PublicContentEntryEntity> entries) {
        String requested = resolveLocaleTag();
        return entries.stream()
                .collect(java.util.stream.Collectors.groupingBy(item -> localeGroupingKey(item)))
                .values().stream()
                .map(group -> pickBestLocale(group, requested))
                .toList();
    }

    private String localeGroupingKey(PublicContentEntryEntity item) {
        // Use translationGroupId as the primary grouping key when available
        if (item.getTranslationGroupId() != null) {
            return item.getEntryKind() + "|" + item.getTranslationGroupId().toString();
        }
        // Fallback to legacy grouping for data without translationGroupId
        return item.getEntryKind() + "|" + normalize(item.getCategoryCode()) + "|" + normalize(item.getValueType()) + "|" + item.getSortOrder();
    }

    private PublicContentEntryEntity pickBestLocale(List<PublicContentEntryEntity> group, String requested) {
        return group.stream()
                .filter(item -> Objects.equals(item.getLocale(), requested))
                .findFirst()
                .orElseGet(() -> group.stream()
                        .filter(item -> item.getLocale() != null && item.getLocale().startsWith(language(requested) + "-"))
                        .findFirst()
                        .orElseGet(() -> group.stream()
                                .filter(item -> Objects.equals(item.getLocale(), DEFAULT_LOCALE))
                                .findFirst()
                                .orElse(group.get(0))));
    }

    private String language(String localeTag) {
        Locale locale = Locale.forLanguageTag(localeTag);
        return locale.getLanguage();
    }

    private String resolveLocaleTag() {
        String tag = LocaleContextHolder.getLocale().toLanguageTag();
        if (isBlank(tag)) {
            return DEFAULT_LOCALE;
        }
        Locale locale = Locale.forLanguageTag(tag);
        if (isBlank(locale.getLanguage())) {
            return DEFAULT_LOCALE;
        }
        if (isBlank(locale.getCountry())) {
            return locale.getLanguage() + "-ES";
        }
        return locale.getLanguage() + "-" + locale.getCountry();
    }

    private PublicContentEntryEntity baseEntity(String kind, String locale, UUID groupId) {
        Instant now = Instant.now();
        PublicContentEntryEntity entity = new PublicContentEntryEntity();
        entity.setId(UUID.randomUUID());
        entity.setEntryKind(kind);
        entity.setLocale(normalizeLocale(locale));
        entity.setSortOrder(0);
        entity.setTranslationGroupId(groupId != null ? groupId : entity.getId());
        entity.setParentGroupId(null);
        entity.setPublished(true);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    private void applyLegislation(PublicContentEntryEntity entity, PublicContentDtos.LegislationUpsertRequest request) {
        entity.setLocale(normalizeLocale(request.locale()));
        entity.setValueType(normalize(request.type()));
        entity.setTitleText(require(request.title(), "title"));
        entity.setBodyText(request.description());
        entity.setEventDate(request.publicationDate());
        entity.setExternalUrl(request.externalUrl());
        entity.setDownloadUrl(request.downloadUrl());
        entity.setSortOrder(request.sortOrder() == null ? entity.getSortOrder() : request.sortOrder());
        entity.setPublished(request.published() == null ? entity.isPublished() : request.published());
        entity.setUpdatedAt(Instant.now());
    }

    private void applyFaqCategory(PublicContentEntryEntity entity, PublicContentDtos.FaqCategoryUpsertRequest request) {
        entity.setLocale(normalizeLocale(request.locale()));
        entity.setCategoryCode(normalize(request.categoryCode()));
        entity.setParentGroupId(parseUuidOrNull(request.categoryCode()));
        entity.setTitleText(require(request.categoryName(), "categoryName"));
        entity.setBodyText("");
        entity.setSortOrder(request.sortOrder() == null ? entity.getSortOrder() : request.sortOrder());
        entity.setPublished(request.published() == null ? entity.isPublished() : request.published());
        entity.setUpdatedAt(Instant.now());
    }

    private void applyFaq(PublicContentEntryEntity entity, PublicContentDtos.FaqUpsertRequest request) {
        entity.setLocale(normalizeLocale(request.locale()));
        entity.setCategoryCode(normalize(request.categoryCode()));
        entity.setParentGroupId(parseUuidOrNull(request.categoryCode()));
        entity.setTitleText(require(request.question(), "question"));
        entity.setBodyText(require(request.answer(), "answer"));
        entity.setSortOrder(request.sortOrder() == null ? entity.getSortOrder() : request.sortOrder());
        entity.setPublished(request.published() == null ? entity.isPublished() : request.published());
        entity.setUpdatedAt(Instant.now());
    }

    private void applyCalendar(PublicContentEntryEntity entity, PublicContentDtos.CalendarUpsertRequest request) {
        entity.setLocale(normalizeLocale(request.locale()));
        entity.setValueType(normalize(request.type()));
        entity.setTitleText(require(request.title(), "title"));
        entity.setBodyText(request.description());
        entity.setEventDate(request.eventDate());
        entity.setRelatedProcedure(request.relatedProcedure());
        entity.setSortOrder(request.sortOrder() == null ? entity.getSortOrder() : request.sortOrder());
        entity.setPublished(request.published() == null ? entity.isPublished() : request.published());
        entity.setUpdatedAt(Instant.now());
    }

    private void applyInstitutional(PublicContentEntryEntity entity, PublicContentDtos.InstitutionalUpsertRequest request) {
        entity.setLocale(normalizeLocale(request.locale()));
        entity.setCategoryCode(normalize(request.sectionCode()));
        entity.setValueType(request.icon());
        entity.setTitleText(require(request.title(), "title"));
        entity.setBodyText(require(request.content(), "content"));
        entity.setSortOrder(request.sortOrder() == null ? entity.getSortOrder() : request.sortOrder());
        entity.setPublished(request.published() == null ? entity.isPublished() : request.published());
        entity.setUpdatedAt(Instant.now());
    }

    private void applyOrganism(PublicContentEntryEntity entity, PublicContentDtos.OrganismUpsertRequest request) {
        entity.setLocale(normalizeLocale(request.locale()));
        entity.setCategoryCode(normalize(request.categoryCode()));
        entity.setParentGroupId(parseUuidOrNull(request.categoryCode()));
        entity.setTitleText(require(request.name(), "name"));
        entity.setBodyText(request.description());
        entity.setRelatedProcedure(request.phone());
        entity.setDownloadUrl(request.email());
        entity.setValueType(request.address());
        entity.setExternalUrl(request.websiteUrl());
        entity.setSortOrder(request.sortOrder() == null ? entity.getSortOrder() : request.sortOrder());
        entity.setPublished(request.published() == null ? entity.isPublished() : request.published());
        entity.setUpdatedAt(Instant.now());
    }

    private void applyResource(PublicContentEntryEntity entity, PublicContentDtos.ResourceUpsertRequest request) {
        entity.setLocale(normalizeLocale(request.locale()));
        entity.setValueType(normalize(request.resourceType()));
        entity.setTitleText(require(request.title(), "title"));
        entity.setBodyText(request.description());
        entity.setRelatedProcedure(request.content());
        entity.setExternalUrl(request.externalUrl());
        entity.setSortOrder(request.sortOrder() == null ? entity.getSortOrder() : request.sortOrder());
        entity.setPublished(request.published() == null ? entity.isPublished() : request.published());
        entity.setUpdatedAt(Instant.now());
    }

    private PublicContentEntryEntity find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PUBLIC_CONTENT", id.toString()));
    }

    private PublicContentEntryEntity findByGroup(String kind, UUID groupId, String locale) {
        return repository.findByEntryKindAndTranslationGroupIdAndLocale(kind, groupId, locale)
                .orElseGet(() -> {
                    PublicContentEntryEntity created = baseEntity(kind, locale, groupId);
                    return created;
                });
    }

    private UUID parseUuidOrNull(String value) {
        if (isBlank(value)) {
            return null;
        }
        try {
            return UUID.fromString(value.trim());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String normalizeLocale(String locale) {
        if (isBlank(locale)) {
            return DEFAULT_LOCALE;
        }
        Locale parsed = Locale.forLanguageTag(locale.trim());
        if (isBlank(parsed.getLanguage())) {
            return DEFAULT_LOCALE;
        }
        if (isBlank(parsed.getCountry())) {
            return parsed.getLanguage() + "-ES";
        }
        return parsed.getLanguage() + "-" + parsed.getCountry();
    }

    private String require(String value, String field) {
        if (isBlank(value)) {
            throw new IllegalArgumentException(field + " is required");
        }
        return value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private PublicContentDtos.LegislationEntry toLegislation(PublicContentEntryEntity entity) {
        return new PublicContentDtos.LegislationEntry(entity.getTranslationGroupId(), entity.getLocale(), entity.getValueType(), entity.getTitleText(), entity.getBodyText(), entity.getEventDate(), entity.getExternalUrl(), entity.getDownloadUrl(), entity.getSortOrder(), entity.isPublished(), entity.getCreatedAt(), entity.getUpdatedAt());
    }

    private PublicContentDtos.FaqCategoryEntry toFaqCategory(PublicContentEntryEntity entity) {
        return new PublicContentDtos.FaqCategoryEntry(entity.getTranslationGroupId(), entity.getLocale(), entity.getCategoryCode(), entity.getTitleText(), entity.getSortOrder(), entity.isPublished(), entity.getCreatedAt(), entity.getUpdatedAt());
    }

    private PublicContentDtos.FaqEntry toFaq(PublicContentEntryEntity entity) {
        String categoryGroup = entity.getParentGroupId() == null ? entity.getCategoryCode() : entity.getParentGroupId().toString();
        return new PublicContentDtos.FaqEntry(entity.getTranslationGroupId(), entity.getLocale(), categoryGroup, entity.getTitleText(), entity.getBodyText(), entity.getSortOrder(), entity.isPublished(), entity.getCreatedAt(), entity.getUpdatedAt());
    }

    private PublicContentDtos.CalendarEntry toCalendar(PublicContentEntryEntity entity) {
        return new PublicContentDtos.CalendarEntry(entity.getTranslationGroupId(), entity.getLocale(), entity.getValueType(), entity.getTitleText(), entity.getBodyText(), entity.getEventDate(), entity.getRelatedProcedure(), entity.getSortOrder(), entity.isPublished(), entity.getCreatedAt(), entity.getUpdatedAt());
    }

    private PublicContentDtos.InstitutionalEntry toInstitutional(PublicContentEntryEntity entity) {
        return new PublicContentDtos.InstitutionalEntry(entity.getTranslationGroupId(), entity.getLocale(), entity.getCategoryCode(), entity.getTitleText(), entity.getBodyText(), entity.getValueType(), entity.getSortOrder(), entity.isPublished(), entity.getCreatedAt(), entity.getUpdatedAt());
    }

    private PublicContentDtos.OrganismEntry toOrganism(PublicContentEntryEntity entity) {
        String categoryGroup = entity.getParentGroupId() == null ? entity.getCategoryCode() : entity.getParentGroupId().toString();
        return new PublicContentDtos.OrganismEntry(entity.getTranslationGroupId(), entity.getLocale(), categoryGroup, entity.getTitleText(), entity.getBodyText(), entity.getRelatedProcedure(), entity.getDownloadUrl(), entity.getValueType(), entity.getExternalUrl(), entity.getSortOrder(), entity.isPublished(), entity.getCreatedAt(), entity.getUpdatedAt());
    }

    private PublicContentDtos.ResourceEntry toResource(PublicContentEntryEntity entity) {
        return new PublicContentDtos.ResourceEntry(entity.getTranslationGroupId(), entity.getLocale(), entity.getValueType(), entity.getTitleText(), entity.getBodyText(), entity.getRelatedProcedure(), entity.getExternalUrl(), entity.getSortOrder(), entity.isPublished(), entity.getCreatedAt(), entity.getUpdatedAt());
    }

    private PublicContentDtos.ThemeCatalog toThemeCatalog(List<PublicContentEntryEntity> entities) {
        Map<String, List<PublicContentEntryEntity>> grouped = entities.stream()
                .filter(entity -> !isBlank(entity.getCategoryCode()))
                .collect(java.util.stream.Collectors.groupingBy(
                        entity -> entity.getCategoryCode().trim() + "|" + normalizeMode(entity.getLocale()),
                        LinkedHashMap::new,
                        java.util.stream.Collectors.toList()
                ));

        List<PublicContentDtos.ThemeVariant> themes = grouped.entrySet().stream()
                .map(entry -> {
                    String key = entry.getKey();
                    String[] parts = key.split("\\|", 2);
                    String id = parts[0];
                    String mode = parts.length > 1 ? parts[1] : "light";
                    List<PublicContentEntryEntity> items = entry.getValue();
                    String name = items.stream()
                            .map(PublicContentEntryEntity::getRelatedProcedure)
                            .filter(value -> !isBlank(value))
                            .findFirst()
                            .orElse(id);
                    List<PublicContentDtos.ThemeColor> colors = items.stream()
                            .filter(entity -> !isBlank(entity.getValueType()) && !isBlank(entity.getTitleText()))
                            .sorted(Comparator.comparing(PublicContentEntryEntity::getSortOrder))
                            .map(entity -> new PublicContentDtos.ThemeColor(entity.getValueType(), entity.getTitleText()))
                            .toList();
                    boolean active = items.stream().anyMatch(PublicContentEntryEntity::isPublished);
                    return new PublicContentDtos.ThemeVariant(id, name, mode, colors, active);
                })
                .toList();

        String activeThemeId = themes.stream().filter(PublicContentDtos.ThemeVariant::active).map(PublicContentDtos.ThemeVariant::id).findFirst().orElse(null);

        Instant updatedAt = entities.stream()
                .map(PublicContentEntryEntity::getUpdatedAt)
                .filter(Objects::nonNull)
                .max(Instant::compareTo)
                .orElse(null);

        return new PublicContentDtos.ThemeCatalog(themes, activeThemeId, updatedAt);
    }

    private String normalizeMode(String raw) {
        if (isBlank(raw)) {
            return "light";
        }
        String trimmed = raw.trim();
        if ("light".equalsIgnoreCase(trimmed) || "dark".equalsIgnoreCase(trimmed)) {
            return trimmed.toLowerCase();
        }
        return "light";
    }
}
