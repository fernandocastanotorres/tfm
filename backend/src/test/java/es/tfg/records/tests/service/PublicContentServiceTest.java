package es.tfg.records.tests.service;

import es.tfg.records.application.dto.PublicContentDtos;
import es.tfg.records.application.service.PublicContentService;
import es.tfg.records.infrastructure.persistence.entity.PublicContentEntryEntity;
import es.tfg.records.infrastructure.persistence.repository.PublicContentEntryJpaRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.i18n.LocaleContextHolder;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PublicContentServiceTest {

    @Mock
    private PublicContentEntryJpaRepository repository;

    @InjectMocks
    private PublicContentService service;

    private UUID groupId;
    private UUID entryId;
    private Instant now;

    @BeforeEach
    void setUp() {
        groupId = UUID.randomUUID();
        entryId = UUID.randomUUID();
        now = Instant.now();
        LocaleContextHolder.setLocale(Locale.forLanguageTag("es-ES"));
    }

    @AfterEach
    void tearDown() {
        LocaleContextHolder.resetLocaleContext();
    }

    // ===== Helper methods =====

    private PublicContentEntryEntity createLegislationEntity() {
        PublicContentEntryEntity entity = new PublicContentEntryEntity();
        entity.setId(entryId);
        entity.setTranslationGroupId(groupId);
        entity.setEntryKind("LEGISLATION");
        entity.setLocale("es-ES");
        entity.setValueType("law");
        entity.setTitleText("Test Law");
        entity.setBodyText("Description");
        entity.setEventDate(LocalDate.of(2024, 1, 15));
        entity.setExternalUrl("https://example.com");
        entity.setDownloadUrl("https://example.com/download");
        entity.setSortOrder(1);
        entity.setPublished(true);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    private PublicContentEntryEntity createFaqCategoryEntity() {
        PublicContentEntryEntity entity = new PublicContentEntryEntity();
        entity.setId(entryId);
        entity.setTranslationGroupId(groupId);
        entity.setEntryKind("FAQ_CATEGORY");
        entity.setLocale("es-ES");
        entity.setCategoryCode("general");
        entity.setTitleText("General Questions");
        entity.setBodyText("");
        entity.setSortOrder(1);
        entity.setPublished(true);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    private PublicContentEntryEntity createFaqEntity() {
        PublicContentEntryEntity entity = new PublicContentEntryEntity();
        entity.setId(entryId);
        entity.setTranslationGroupId(groupId);
        entity.setEntryKind("FAQ");
        entity.setLocale("es-ES");
        entity.setCategoryCode("general");
        entity.setParentGroupId(groupId);
        entity.setTitleText("What is this?");
        entity.setBodyText("This is the answer");
        entity.setSortOrder(1);
        entity.setPublished(true);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    private PublicContentEntryEntity createCalendarEntity() {
        PublicContentEntryEntity entity = new PublicContentEntryEntity();
        entity.setId(entryId);
        entity.setTranslationGroupId(groupId);
        entity.setEntryKind("CALENDAR");
        entity.setLocale("es-ES");
        entity.setValueType("deadline");
        entity.setTitleText("Tax Deadline");
        entity.setBodyText("Annual tax filing deadline");
        entity.setEventDate(LocalDate.of(2024, 6, 30));
        entity.setRelatedProcedure("Tax Procedure");
        entity.setSortOrder(1);
        entity.setPublished(true);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    private PublicContentEntryEntity createInstitutionalEntity() {
        PublicContentEntryEntity entity = new PublicContentEntryEntity();
        entity.setId(entryId);
        entity.setTranslationGroupId(groupId);
        entity.setEntryKind("INSTITUTIONAL");
        entity.setLocale("es-ES");
        entity.setCategoryCode("about");
        entity.setValueType("info-icon");
        entity.setTitleText("About Us");
        entity.setBodyText("Institutional content");
        entity.setSortOrder(1);
        entity.setPublished(true);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    private PublicContentEntryEntity createOrganismEntity() {
        PublicContentEntryEntity entity = new PublicContentEntryEntity();
        entity.setId(entryId);
        entity.setTranslationGroupId(groupId);
        entity.setEntryKind("ORGANISM");
        entity.setLocale("es-ES");
        entity.setCategoryCode("ministries");
        entity.setParentGroupId(groupId);
        entity.setTitleText("Ministry of Finance");
        entity.setBodyText("Description of the ministry");
        entity.setRelatedProcedure("+34 900 000 000");
        entity.setDownloadUrl("finance@example.com");
        entity.setValueType("123 Main St");
        entity.setExternalUrl("https://finance.example.com");
        entity.setSortOrder(1);
        entity.setPublished(true);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    private PublicContentEntryEntity createResourceEntity() {
        PublicContentEntryEntity entity = new PublicContentEntryEntity();
        entity.setId(entryId);
        entity.setTranslationGroupId(groupId);
        entity.setEntryKind("RESOURCE");
        entity.setLocale("es-ES");
        entity.setValueType("guide");
        entity.setTitleText("User Guide");
        entity.setBodyText("A comprehensive guide");
        entity.setRelatedProcedure("Related procedure");
        entity.setExternalUrl("https://example.com/resource");
        entity.setSortOrder(1);
        entity.setPublished(true);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    private PublicContentEntryEntity createThemeEntity(String themeId, String mode, String token, String value, int sortOrder) {
        PublicContentEntryEntity entity = new PublicContentEntryEntity();
        entity.setId(UUID.randomUUID());
        entity.setTranslationGroupId(UUID.randomUUID());
        entity.setEntryKind("THEME");
        entity.setLocale(mode);
        entity.setCategoryCode(themeId);
        entity.setRelatedProcedure(themeId);
        entity.setValueType(token);
        entity.setTitleText(value);
        entity.setBodyText("");
        entity.setSortOrder(sortOrder);
        entity.setPublished(true);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    // ========================================================================
    // LEGISLATION TESTS
    // ========================================================================

    @Nested
    class LegislationTests {

        @Test
        void listLegislationAdmin_shouldReturnLegislationEntries() {
            PublicContentEntryEntity entity = createLegislationEntity();
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("LEGISLATION", "es-ES"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.LegislationEntry> result = service.listLegislationAdmin();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).id()).isEqualTo(groupId);
            assertThat(result.get(0).title()).isEqualTo("Test Law");
            assertThat(result.get(0).type()).isEqualTo("law");
        }

        @Test
        void listLegislationAdmin_shouldReturnEmptyListWhenNoEntries() {
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("LEGISLATION", "es-ES"))
                    .thenReturn(List.of());

            List<PublicContentDtos.LegislationEntry> result = service.listLegislationAdmin();

            assertThat(result).isEmpty();
        }

        @Test
        void createLegislation_shouldCreateAndReturnEntry() {
            PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                    "en-US", groupId, "law", "New Law", "Description",
                    LocalDate.of(2024, 3, 1), "https://example.com", null, 2, true);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.LegislationEntry result = service.createLegislation(request);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo("New Law");
            assertThat(result.type()).isEqualTo("law");
            assertThat(result.locale()).isEqualTo("en-US");
            verify(repository).save(any(PublicContentEntryEntity.class));
        }

        @Test
        void createLegislation_shouldThrowWhenTitleIsNull() {
            PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                    "es-ES", groupId, "law", null, "Description",
                    null, null, null, null, null);

            assertThatThrownBy(() -> service.createLegislation(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("title");
        }

        @Test
        void createLegislation_shouldUseGroupIdAsTranslationGroupIdWhenNull() {
            PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                    "es-ES", null, "law", "Test Law", null,
                    null, null, null, null, null);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.LegislationEntry result = service.createLegislation(request);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo("Test Law");
        }

        @Test
        void updateLegislation_shouldUpdateExistingEntry() {
            PublicContentEntryEntity existing = createLegislationEntity();
            PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                    "es-ES", groupId, "decree", "Updated Law", "Updated description",
                    LocalDate.of(2024, 5, 1), null, null, 3, false);

            when(repository.findByEntryKindAndTranslationGroupIdAndLocale("LEGISLATION", groupId, "es-ES"))
                    .thenReturn(Optional.of(existing));
            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.LegislationEntry result = service.updateLegislation(groupId, request);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo("Updated Law");
            assertThat(result.type()).isEqualTo("decree");
            assertThat(result.published()).isFalse();
        }

        @Test
        void updateLegislation_shouldCreateNewEntryWhenNotFound() {
            PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                    "es-ES", groupId, "law", "New via Update", "Description",
                    null, null, null, null, null);

            when(repository.findByEntryKindAndTranslationGroupIdAndLocale("LEGISLATION", groupId, "es-ES"))
                    .thenReturn(Optional.empty());
            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.LegislationEntry result = service.updateLegislation(groupId, request);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo("New via Update");
        }

        @Test
        void deleteLegislation_shouldCallRepositoryDelete() {
            service.deleteLegislation(groupId);

            verify(repository).deleteByEntryKindAndTranslationGroupId("LEGISLATION", groupId);
        }
    }

    // ========================================================================
    // FAQ CATEGORY TESTS
    // ========================================================================

    @Nested
    class FaqCategoryTests {

        @Test
        void listFaqCategoriesAdmin_shouldReturnCategories() {
            PublicContentEntryEntity entity = createFaqCategoryEntity();
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("FAQ_CATEGORY", "es-ES"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.FaqCategoryEntry> result = service.listFaqCategoriesAdmin();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).categoryName()).isEqualTo("General Questions");
            assertThat(result.get(0).categoryCode()).isEqualTo("general");
        }

        @Test
        void listFaqCategoriesAdmin_shouldReturnEmptyListWhenNoEntries() {
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("FAQ_CATEGORY", "es-ES"))
                    .thenReturn(List.of());

            List<PublicContentDtos.FaqCategoryEntry> result = service.listFaqCategoriesAdmin();

            assertThat(result).isEmpty();
        }

        @Test
        void createFaqCategory_shouldCreateAndReturnEntry() {
            PublicContentDtos.FaqCategoryUpsertRequest request = new PublicContentDtos.FaqCategoryUpsertRequest(
                    "es-ES", groupId, "technical", "Technical Questions", 1, true);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.FaqCategoryEntry result = service.createFaqCategory(request);

            assertThat(result).isNotNull();
            assertThat(result.categoryName()).isEqualTo("Technical Questions");
            assertThat(result.categoryCode()).isEqualTo("technical");
        }

        @Test
        void createFaqCategory_shouldThrowWhenCategoryNameIsNull() {
            PublicContentDtos.FaqCategoryUpsertRequest request = new PublicContentDtos.FaqCategoryUpsertRequest(
                    "es-ES", groupId, "code", null, 1, true);

            assertThatThrownBy(() -> service.createFaqCategory(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("categoryName");
        }

        @Test
        void updateFaqCategory_shouldUpdateExistingEntry() {
            PublicContentEntryEntity existing = createFaqCategoryEntity();
            PublicContentDtos.FaqCategoryUpsertRequest request = new PublicContentDtos.FaqCategoryUpsertRequest(
                    "es-ES", groupId, "updated", "Updated Category", 2, false);

            when(repository.findByEntryKindAndTranslationGroupIdAndLocale("FAQ_CATEGORY", groupId, "es-ES"))
                    .thenReturn(Optional.of(existing));
            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.FaqCategoryEntry result = service.updateFaqCategory(groupId, request);

            assertThat(result).isNotNull();
            assertThat(result.categoryName()).isEqualTo("Updated Category");
            assertThat(result.published()).isFalse();
        }

        @Test
        void deleteFaqCategory_shouldCallRepositoryDelete() {
            service.deleteFaqCategory(groupId);

            verify(repository).deleteByEntryKindAndTranslationGroupId("FAQ_CATEGORY", groupId);
        }
    }

    // ========================================================================
    // FAQ TESTS
    // ========================================================================

    @Nested
    class FaqTests {

        @Test
        void listFaqAdmin_shouldReturnFaqEntries() {
            PublicContentEntryEntity entity = createFaqEntity();
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("FAQ", "es-ES"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.FaqEntry> result = service.listFaqAdmin();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).question()).isEqualTo("What is this?");
            assertThat(result.get(0).answer()).isEqualTo("This is the answer");
        }

        @Test
        void listFaqAdmin_shouldReturnEmptyListWhenNoEntries() {
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("FAQ", "es-ES"))
                    .thenReturn(List.of());

            List<PublicContentDtos.FaqEntry> result = service.listFaqAdmin();

            assertThat(result).isEmpty();
        }

        @Test
        void createFaq_shouldCreateAndReturnEntry() {
            PublicContentDtos.FaqUpsertRequest request = new PublicContentDtos.FaqUpsertRequest(
                    "es-ES", groupId, "general", "New Question", "New Answer", 1, true);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.FaqEntry result = service.createFaq(request);

            assertThat(result).isNotNull();
            assertThat(result.question()).isEqualTo("New Question");
            assertThat(result.answer()).isEqualTo("New Answer");
        }

        @Test
        void createFaq_shouldThrowWhenQuestionIsNull() {
            PublicContentDtos.FaqUpsertRequest request = new PublicContentDtos.FaqUpsertRequest(
                    "es-ES", groupId, "general", null, "Answer", 1, true);

            assertThatThrownBy(() -> service.createFaq(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("question");
        }

        @Test
        void createFaq_shouldThrowWhenAnswerIsNull() {
            PublicContentDtos.FaqUpsertRequest request = new PublicContentDtos.FaqUpsertRequest(
                    "es-ES", groupId, "general", "Question", null, 1, true);

            assertThatThrownBy(() -> service.createFaq(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("answer");
        }

        @Test
        void updateFaq_shouldUpdateExistingEntry() {
            PublicContentEntryEntity existing = createFaqEntity();
            PublicContentDtos.FaqUpsertRequest request = new PublicContentDtos.FaqUpsertRequest(
                    "es-ES", groupId, "general", "Updated Question", "Updated Answer", 2, false);

            when(repository.findByEntryKindAndTranslationGroupIdAndLocale("FAQ", groupId, "es-ES"))
                    .thenReturn(Optional.of(existing));
            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.FaqEntry result = service.updateFaq(groupId, request);

            assertThat(result).isNotNull();
            assertThat(result.question()).isEqualTo("Updated Question");
            assertThat(result.answer()).isEqualTo("Updated Answer");
        }

        @Test
        void deleteFaq_shouldCallRepositoryDelete() {
            service.deleteFaq(groupId);

            verify(repository).deleteByEntryKindAndTranslationGroupId("FAQ", groupId);
        }
    }

    // ========================================================================
    // CALENDAR TESTS
    // ========================================================================

    @Nested
    class CalendarTests {

        @Test
        void listCalendarAdmin_shouldReturnCalendarEntries() {
            PublicContentEntryEntity entity = createCalendarEntity();
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("CALENDAR", "es-ES"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.CalendarEntry> result = service.listCalendarAdmin();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).title()).isEqualTo("Tax Deadline");
            assertThat(result.get(0).type()).isEqualTo("deadline");
            assertThat(result.get(0).eventDate()).isEqualTo(LocalDate.of(2024, 6, 30));
        }

        @Test
        void listCalendarAdmin_shouldReturnEmptyListWhenNoEntries() {
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("CALENDAR", "es-ES"))
                    .thenReturn(List.of());

            List<PublicContentDtos.CalendarEntry> result = service.listCalendarAdmin();

            assertThat(result).isEmpty();
        }

        @Test
        void createCalendar_shouldCreateAndReturnEntry() {
            PublicContentDtos.CalendarUpsertRequest request = new PublicContentDtos.CalendarUpsertRequest(
                    "es-ES", groupId, "event", "New Event", "Description",
                    LocalDate.of(2024, 12, 25), "Procedure", 1, true);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.CalendarEntry result = service.createCalendar(request);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo("New Event");
            assertThat(result.eventDate()).isEqualTo(LocalDate.of(2024, 12, 25));
        }

        @Test
        void createCalendar_shouldThrowWhenTitleIsNull() {
            PublicContentDtos.CalendarUpsertRequest request = new PublicContentDtos.CalendarUpsertRequest(
                    "es-ES", groupId, "event", null, "Description",
                    null, null, null, null);

            assertThatThrownBy(() -> service.createCalendar(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("title");
        }

        @Test
        void updateCalendar_shouldUpdateExistingEntry() {
            PublicContentEntryEntity existing = createCalendarEntity();
            PublicContentDtos.CalendarUpsertRequest request = new PublicContentDtos.CalendarUpsertRequest(
                    "es-ES", groupId, "deadline", "Updated Event", "Updated desc",
                    LocalDate.of(2025, 1, 1), "New Procedure", 2, false);

            when(repository.findByEntryKindAndTranslationGroupIdAndLocale("CALENDAR", groupId, "es-ES"))
                    .thenReturn(Optional.of(existing));
            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.CalendarEntry result = service.updateCalendar(groupId, request);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo("Updated Event");
            assertThat(result.published()).isFalse();
        }

        @Test
        void deleteCalendar_shouldCallRepositoryDelete() {
            service.deleteCalendar(groupId);

            verify(repository).deleteByEntryKindAndTranslationGroupId("CALENDAR", groupId);
        }
    }

    // ========================================================================
    // INSTITUTIONAL TESTS
    // ========================================================================

    @Nested
    class InstitutionalTests {

        @Test
        void listInstitutionalAdmin_shouldReturnEntries() {
            PublicContentEntryEntity entity = createInstitutionalEntity();
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("INSTITUTIONAL", "es-ES"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.InstitutionalEntry> result = service.listInstitutionalAdmin();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).title()).isEqualTo("About Us");
            assertThat(result.get(0).content()).isEqualTo("Institutional content");
        }

        @Test
        void listInstitutionalAdmin_shouldReturnEmptyListWhenNoEntries() {
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("INSTITUTIONAL", "es-ES"))
                    .thenReturn(List.of());

            List<PublicContentDtos.InstitutionalEntry> result = service.listInstitutionalAdmin();

            assertThat(result).isEmpty();
        }

        @Test
        void createInstitutional_shouldCreateAndReturnEntry() {
            PublicContentDtos.InstitutionalUpsertRequest request = new PublicContentDtos.InstitutionalUpsertRequest(
                    "es-ES", groupId, "mission", "Our Mission", "Mission content", "star", 1, true);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.InstitutionalEntry result = service.createInstitutional(request);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo("Our Mission");
            assertThat(result.icon()).isEqualTo("star");
        }

        @Test
        void createInstitutional_shouldThrowWhenTitleIsNull() {
            PublicContentDtos.InstitutionalUpsertRequest request = new PublicContentDtos.InstitutionalUpsertRequest(
                    "es-ES", groupId, "section", null, "Content", "icon", 1, true);

            assertThatThrownBy(() -> service.createInstitutional(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("title");
        }

        @Test
        void createInstitutional_shouldThrowWhenContentIsNull() {
            PublicContentDtos.InstitutionalUpsertRequest request = new PublicContentDtos.InstitutionalUpsertRequest(
                    "es-ES", groupId, "section", "Title", null, "icon", 1, true);

            assertThatThrownBy(() -> service.createInstitutional(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("content");
        }

        @Test
        void updateInstitutional_shouldUpdateExistingEntry() {
            PublicContentEntryEntity existing = createInstitutionalEntity();
            PublicContentDtos.InstitutionalUpsertRequest request = new PublicContentDtos.InstitutionalUpsertRequest(
                    "es-ES", groupId, "updated", "Updated Title", "Updated content", "new-icon", 2, false);

            when(repository.findByEntryKindAndTranslationGroupIdAndLocale("INSTITUTIONAL", groupId, "es-ES"))
                    .thenReturn(Optional.of(existing));
            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.InstitutionalEntry result = service.updateInstitutional(groupId, request);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo("Updated Title");
            assertThat(result.content()).isEqualTo("Updated content");
        }

        @Test
        void deleteInstitutional_shouldCallRepositoryDelete() {
            service.deleteInstitutional(groupId);

            verify(repository).deleteByEntryKindAndTranslationGroupId("INSTITUTIONAL", groupId);
        }
    }

    // ========================================================================
    // ORGANISM TESTS
    // ========================================================================

    @Nested
    class OrganismTests {

        @Test
        void listOrganismsAdmin_shouldReturnOrganismEntries() {
            PublicContentEntryEntity entity = createOrganismEntity();
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("ORGANISM", "es-ES"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.OrganismEntry> result = service.listOrganismsAdmin();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).name()).isEqualTo("Ministry of Finance");
            assertThat(result.get(0).email()).isEqualTo("finance@example.com");
        }

        @Test
        void listOrganismsAdmin_shouldReturnEmptyListWhenNoEntries() {
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("ORGANISM", "es-ES"))
                    .thenReturn(List.of());

            List<PublicContentDtos.OrganismEntry> result = service.listOrganismsAdmin();

            assertThat(result).isEmpty();
        }

        @Test
        void listOrganismCategoriesAdmin_shouldReturnCategories() {
            PublicContentEntryEntity entity = createFaqCategoryEntity();
            entity.setEntryKind("ORGANISM_CATEGORY");
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("ORGANISM_CATEGORY", "es-ES"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.FaqCategoryEntry> result = service.listOrganismCategoriesAdmin();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).categoryName()).isEqualTo("General Questions");
        }

        @Test
        void createOrganism_shouldCreateAndReturnEntry() {
            PublicContentDtos.OrganismUpsertRequest request = new PublicContentDtos.OrganismUpsertRequest(
                    "es-ES", groupId, "ministries", "New Ministry", "Description",
                    "+34 900 111 222", "ministry@example.com", "456 Oak St", "https://ministry.example.com", 1, true);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.OrganismEntry result = service.createOrganism(request);

            assertThat(result).isNotNull();
            assertThat(result.name()).isEqualTo("New Ministry");
            assertThat(result.phone()).isEqualTo("+34 900 111 222");
        }

        @Test
        void createOrganism_shouldThrowWhenNameIsNull() {
            PublicContentDtos.OrganismUpsertRequest request = new PublicContentDtos.OrganismUpsertRequest(
                    "es-ES", groupId, "code", null, "Description",
                    null, null, null, null, 1, true);

            assertThatThrownBy(() -> service.createOrganism(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("name");
        }

        @Test
        void updateOrganism_shouldUpdateExistingEntry() {
            PublicContentEntryEntity existing = createOrganismEntity();
            PublicContentDtos.OrganismUpsertRequest request = new PublicContentDtos.OrganismUpsertRequest(
                    "es-ES", groupId, "ministries", "Updated Ministry", "Updated description",
                    null, null, null, null, 2, false);

            when(repository.findByEntryKindAndTranslationGroupIdAndLocale("ORGANISM", groupId, "es-ES"))
                    .thenReturn(Optional.of(existing));
            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.OrganismEntry result = service.updateOrganism(groupId, request);

            assertThat(result).isNotNull();
            assertThat(result.name()).isEqualTo("Updated Ministry");
            assertThat(result.published()).isFalse();
        }

        @Test
        void deleteOrganism_shouldCallRepositoryDelete() {
            service.deleteOrganism(groupId);

            verify(repository).deleteByEntryKindAndTranslationGroupId("ORGANISM", groupId);
        }
    }

    // ========================================================================
    // RESOURCE TESTS
    // ========================================================================

    @Nested
    class ResourceTests {

        @Test
        void listResourcesAdmin_shouldReturnResourceEntries() {
            PublicContentEntryEntity entity = createResourceEntity();
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("RESOURCE", "es-ES"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.ResourceEntry> result = service.listResourcesAdmin();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).title()).isEqualTo("User Guide");
            assertThat(result.get(0).resourceType()).isEqualTo("guide");
        }

        @Test
        void listResourcesAdmin_shouldReturnEmptyListWhenNoEntries() {
            when(repository.findByEntryKindAndLocaleOrderBySortOrderAscEventDateAscCreatedAtAsc("RESOURCE", "es-ES"))
                    .thenReturn(List.of());

            List<PublicContentDtos.ResourceEntry> result = service.listResourcesAdmin();

            assertThat(result).isEmpty();
        }

        @Test
        void createResource_shouldCreateAndReturnEntry() {
            PublicContentDtos.ResourceUpsertRequest request = new PublicContentDtos.ResourceUpsertRequest(
                    "es-ES", groupId, "form", "New Resource", "Description",
                    "Content body", "https://example.com", 1, true);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.ResourceEntry result = service.createResource(request);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo("New Resource");
            assertThat(result.resourceType()).isEqualTo("form");
        }

        @Test
        void createResource_shouldThrowWhenTitleIsNull() {
            PublicContentDtos.ResourceUpsertRequest request = new PublicContentDtos.ResourceUpsertRequest(
                    "es-ES", groupId, "type", null, "Description",
                    "Content", null, 1, true);

            assertThatThrownBy(() -> service.createResource(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("title");
        }

        @Test
        void updateResource_shouldUpdateExistingEntry() {
            PublicContentEntryEntity existing = createResourceEntity();
            PublicContentDtos.ResourceUpsertRequest request = new PublicContentDtos.ResourceUpsertRequest(
                    "es-ES", groupId, "guide", "Updated Resource", "Updated description",
                    "Updated content", null, 2, false);

            when(repository.findByEntryKindAndTranslationGroupIdAndLocale("RESOURCE", groupId, "es-ES"))
                    .thenReturn(Optional.of(existing));
            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.ResourceEntry result = service.updateResource(groupId, request);

            assertThat(result).isNotNull();
            assertThat(result.title()).isEqualTo("Updated Resource");
            assertThat(result.published()).isFalse();
        }

        @Test
        void deleteResource_shouldCallRepositoryDelete() {
            service.deleteResource(groupId);

            verify(repository).deleteByEntryKindAndTranslationGroupId("RESOURCE", groupId);
        }
    }

    // ========================================================================
    // PUBLIC (LOCALIZED) LISTING TESTS
    // ========================================================================

    @Nested
    class PublicListingTests {

        @Test
        void listPublicLegislation_shouldFilterByType() {
            PublicContentEntryEntity entity = createLegislationEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("LEGISLATION"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.LegislationEntry> result = service.listPublicLegislation("law");

            assertThat(result).hasSize(1);
            assertThat(result.get(0).type()).isEqualTo("law");
        }

        @Test
        void listPublicLegislation_shouldReturnAllWhenTypeIsNull() {
            PublicContentEntryEntity entity = createLegislationEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("LEGISLATION"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.LegislationEntry> result = service.listPublicLegislation(null);

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicLegislation_shouldReturnEmptyWhenTypeDoesNotMatch() {
            PublicContentEntryEntity entity = createLegislationEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("LEGISLATION"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.LegislationEntry> result = service.listPublicLegislation("decree");

            assertThat(result).isEmpty();
        }

        @Test
        void listPublicFaqCategories_shouldReturnPublishedCategories() {
            PublicContentEntryEntity entity = createFaqCategoryEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("FAQ_CATEGORY"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.FaqCategoryEntry> result = service.listPublicFaqCategories();

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicFaq_shouldFilterByCategoryAndQuery() {
            PublicContentEntryEntity entity = createFaqEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("FAQ"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.FaqEntry> result = service.listPublicFaq("general", "what");

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicFaq_shouldReturnEmptyWhenCategoryDoesNotMatch() {
            PublicContentEntryEntity entity = createFaqEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("FAQ"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.FaqEntry> result = service.listPublicFaq("other", null);

            assertThat(result).isEmpty();
        }

        @Test
        void listPublicFaq_shouldReturnEmptyWhenQueryDoesNotMatch() {
            PublicContentEntryEntity entity = createFaqEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("FAQ"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.FaqEntry> result = service.listPublicFaq(null, "nonexistent");

            assertThat(result).isEmpty();
        }

        @Test
        void listPublicFaq_shouldReturnAllWhenNoFilters() {
            PublicContentEntryEntity entity = createFaqEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("FAQ"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.FaqEntry> result = service.listPublicFaq(null, null);

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicCalendar_shouldApplyUpcomingLimit() {
            PublicContentEntryEntity e1 = createCalendarEntity();
            e1.setEventDate(LocalDate.of(2024, 1, 1));
            PublicContentEntryEntity e2 = createCalendarEntity();
            e2.setId(UUID.randomUUID());
            e2.setTranslationGroupId(UUID.randomUUID());
            e2.setEventDate(LocalDate.of(2024, 6, 1));
            PublicContentEntryEntity e3 = createCalendarEntity();
            e3.setId(UUID.randomUUID());
            e3.setTranslationGroupId(UUID.randomUUID());
            e3.setEventDate(LocalDate.of(2024, 12, 1));

            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("CALENDAR"))
                    .thenReturn(List.of(e1, e2, e3));

            List<PublicContentDtos.CalendarEntry> result = service.listPublicCalendar(null, 2);

            assertThat(result).hasSize(2);
        }

        @Test
        void listPublicCalendar_shouldReturnAllWhenLimitIsNull() {
            PublicContentEntryEntity entity = createCalendarEntity();
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("CALENDAR"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.CalendarEntry> result = service.listPublicCalendar(null, null);

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicCalendar_shouldFilterByType() {
            PublicContentEntryEntity entity = createCalendarEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("CALENDAR"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.CalendarEntry> result = service.listPublicCalendar("deadline", null);

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicCalendar_shouldReturnEmptyWhenTypeDoesNotMatch() {
            PublicContentEntryEntity entity = createCalendarEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("CALENDAR"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.CalendarEntry> result = service.listPublicCalendar("holiday", null);

            assertThat(result).isEmpty();
        }

        @Test
        void listPublicInstitutional_shouldReturnPublishedEntries() {
            PublicContentEntryEntity entity = createInstitutionalEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("INSTITUTIONAL"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.InstitutionalEntry> result = service.listPublicInstitutional();

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicOrganisms_shouldFilterByCategoryAndQuery() {
            PublicContentEntryEntity entity = createOrganismEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("ORGANISM"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.OrganismEntry> result = service.listPublicOrganisms("ministries", "ministry");

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicOrganisms_shouldReturnEmptyWhenCategoryDoesNotMatch() {
            PublicContentEntryEntity entity = createOrganismEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("ORGANISM"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.OrganismEntry> result = service.listPublicOrganisms("agencies", null);

            assertThat(result).isEmpty();
        }

        @Test
        void listPublicOrganisms_shouldSearchInMultipleFields() {
            PublicContentEntryEntity entity = createOrganismEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("ORGANISM"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.OrganismEntry> result = service.listPublicOrganisms(null, "finance@example.com");

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicOrganisms_shouldSearchByPhone() {
            PublicContentEntryEntity entity = createOrganismEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("ORGANISM"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.OrganismEntry> result = service.listPublicOrganisms(null, "900");

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicResources_shouldFilterByTypeAndQuery() {
            PublicContentEntryEntity entity = createResourceEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("RESOURCE"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.ResourceEntry> result = service.listPublicResources("guide", "guide");

            assertThat(result).hasSize(1);
        }

        @Test
        void listPublicResources_shouldReturnEmptyWhenTypeDoesNotMatch() {
            PublicContentEntryEntity entity = createResourceEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("RESOURCE"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.ResourceEntry> result = service.listPublicResources("form", null);

            assertThat(result).isEmpty();
        }

        @Test
        void listPublicResources_shouldSearchInMultipleFields() {
            PublicContentEntryEntity entity = createResourceEntity();
            entity.setPublished(true);
            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("RESOURCE"))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.ResourceEntry> result = service.listPublicResources(null, "related procedure");

            assertThat(result).hasSize(1);
        }
    }

    // ========================================================================
    // TRANSLATION LISTING TESTS
    // ========================================================================

    @Nested
    class TranslationListingTests {

        @Test
        void listLegislationTranslations_shouldReturnAllLocales() {
            PublicContentEntryEntity es = createLegislationEntity();
            PublicContentEntryEntity en = createLegislationEntity();
            en.setId(UUID.randomUUID());
            en.setLocale("en-US");
            en.setTitleText("Test Law EN");

            when(repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc("LEGISLATION", groupId))
                    .thenReturn(List.of(es, en));

            List<PublicContentDtos.LegislationEntry> result = service.listLegislationTranslations(groupId);

            assertThat(result).hasSize(2);
        }

        @Test
        void listFaqCategoryTranslations_shouldReturnAllLocales() {
            PublicContentEntryEntity entity = createFaqCategoryEntity();
            when(repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc("FAQ_CATEGORY", groupId))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.FaqCategoryEntry> result = service.listFaqCategoryTranslations(groupId);

            assertThat(result).hasSize(1);
        }

        @Test
        void listFaqTranslations_shouldReturnAllLocales() {
            PublicContentEntryEntity entity = createFaqEntity();
            when(repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc("FAQ", groupId))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.FaqEntry> result = service.listFaqTranslations(groupId);

            assertThat(result).hasSize(1);
        }

        @Test
        void listCalendarTranslations_shouldReturnAllLocales() {
            PublicContentEntryEntity entity = createCalendarEntity();
            when(repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc("CALENDAR", groupId))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.CalendarEntry> result = service.listCalendarTranslations(groupId);

            assertThat(result).hasSize(1);
        }

        @Test
        void listInstitutionalTranslations_shouldReturnAllLocales() {
            PublicContentEntryEntity entity = createInstitutionalEntity();
            when(repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc("INSTITUTIONAL", groupId))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.InstitutionalEntry> result = service.listInstitutionalTranslations(groupId);

            assertThat(result).hasSize(1);
        }

        @Test
        void listOrganismTranslations_shouldReturnAllLocales() {
            PublicContentEntryEntity entity = createOrganismEntity();
            when(repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc("ORGANISM", groupId))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.OrganismEntry> result = service.listOrganismTranslations(groupId);

            assertThat(result).hasSize(1);
        }

        @Test
        void listResourceTranslations_shouldReturnAllLocales() {
            PublicContentEntryEntity entity = createResourceEntity();
            when(repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc("RESOURCE", groupId))
                    .thenReturn(List.of(entity));

            List<PublicContentDtos.ResourceEntry> result = service.listResourceTranslations(groupId);

            assertThat(result).hasSize(1);
        }

        @Test
        void listLegislationTranslations_shouldReturnEmptyWhenNoEntries() {
            when(repository.findByEntryKindAndTranslationGroupIdOrderByLocaleAsc("LEGISLATION", groupId))
                    .thenReturn(List.of());

            List<PublicContentDtos.LegislationEntry> result = service.listLegislationTranslations(groupId);

            assertThat(result).isEmpty();
        }
    }

    // ========================================================================
    // THEME PALETTE TESTS
    // ========================================================================

    @Nested
    class ThemePaletteTests {

        @Test
        void getPublicThemePalette_shouldReturnColorsForActiveTheme() {
            PublicContentEntryEntity light1 = createThemeEntity("my-theme", "light", "primary", "#0000FF", 1000);
            PublicContentEntryEntity dark1 = createThemeEntity("my-theme", "dark", "primary", "#0000AA", 2000);

            when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of(light1, dark1));

            PublicContentDtos.ThemePalette result = service.getPublicThemePalette();

            assertThat(result).isNotNull();
            assertThat(result.colors()).hasSize(2);
        }

        @Test
        void getPublicThemePalette_shouldReturnEmptyWhenNoThemes() {
            when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of());

            PublicContentDtos.ThemePalette result = service.getPublicThemePalette();

            assertThat(result).isNotNull();
            assertThat(result.colors()).isEmpty();
        }

        @Test
        void getPublicThemePalette_shouldUseFirstThemeAsDefaultWhenNoActiveTheme() {
            PublicContentEntryEntity entity = createThemeEntity("default-theme", "light", "primary", "#FF0000", 1000);
            entity.setPublished(false);

            when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of(entity));

            PublicContentDtos.ThemePalette result = service.getPublicThemePalette();

            assertThat(result).isNotNull();
            assertThat(result.colors()).hasSize(1);
        }

        @Test
        void getThemePaletteAdmin_shouldReturnFullCatalog() {
            PublicContentEntryEntity light = createThemeEntity("theme-1", "light", "primary", "#0000FF", 1000);
            PublicContentEntryEntity dark = createThemeEntity("theme-1", "dark", "primary", "#0000AA", 2000);

            when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of(light, dark));

            PublicContentDtos.ThemeCatalog result = service.getThemePaletteAdmin();

            assertThat(result).isNotNull();
            assertThat(result.themes()).hasSize(2);
            assertThat(result.activeThemeId()).isEqualTo("theme-1");
        }

        @Test
        void getThemePaletteAdmin_shouldReturnEmptyCatalogWhenNoThemes() {
            when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of());

            PublicContentDtos.ThemeCatalog result = service.getThemePaletteAdmin();

            assertThat(result).isNotNull();
            assertThat(result.themes()).isEmpty();
            assertThat(result.activeThemeId()).isNull();
        }

        @Test
        void saveThemePalette_shouldSaveThemesAndReturnCatalog() {
            PublicContentDtos.ThemeVariant lightTheme = new PublicContentDtos.ThemeVariant(
                    "theme-1", "My Theme", "light",
                    List.of(new PublicContentDtos.ThemeColor("primary", "#0000FF")),
                    true);
            PublicContentDtos.ThemeVariant darkTheme = new PublicContentDtos.ThemeVariant(
                    "theme-1", "My Theme", "dark",
                    List.of(new PublicContentDtos.ThemeColor("primary", "#0000AA")),
                    true);
            PublicContentDtos.ThemePaletteUpsertRequest request = new PublicContentDtos.ThemePaletteUpsertRequest(
                    List.of(lightTheme, darkTheme), "theme-1");

            lenient().when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of())
                    .thenReturn(List.of(
                            createThemeEntity("theme-1", "light", "primary", "#0000FF", 1000),
                            createThemeEntity("theme-1", "dark", "primary", "#0000AA", 2000)));
            lenient().when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.ThemeCatalog result = service.saveThemePalette(request);

            assertThat(result).isNotNull();
            verify(repository).deleteAll(anyList());
        }

        @Test
        void saveThemePalette_shouldHandleNullRequest() {
            lenient().when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of());
            lenient().when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.ThemeCatalog result = service.saveThemePalette(null);

            assertThat(result).isNotNull();
            assertThat(result.themes()).isEmpty();
            verify(repository).deleteAll(anyList());
        }

        @Test
        void saveThemePalette_shouldHandleNullThemesList() {
            PublicContentDtos.ThemePaletteUpsertRequest request = new PublicContentDtos.ThemePaletteUpsertRequest(null, null);

            lenient().when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of());
            lenient().when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.ThemeCatalog result = service.saveThemePalette(request);

            assertThat(result).isNotNull();
            assertThat(result.themes()).isEmpty();
        }

        @Test
        void saveThemePalette_shouldSkipInvalidThemes() {
            PublicContentDtos.ThemeVariant invalidTheme = new PublicContentDtos.ThemeVariant(
                    null, null, "light", null, false);
            PublicContentDtos.ThemePaletteUpsertRequest request = new PublicContentDtos.ThemePaletteUpsertRequest(
                    List.of(invalidTheme), null);

            lenient().when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of());
            lenient().when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.ThemeCatalog result = service.saveThemePalette(request);

            assertThat(result).isNotNull();
            assertThat(result.themes()).isEmpty();
        }

        @Test
        void saveThemePalette_shouldSkipInvalidColors() {
            PublicContentDtos.ThemeVariant theme = new PublicContentDtos.ThemeVariant(
                    "theme-1", "Theme", "light",
                    List.of(new PublicContentDtos.ThemeColor(null, "#000000"), new PublicContentDtos.ThemeColor("valid", null)),
                    true);
            PublicContentDtos.ThemePaletteUpsertRequest request = new PublicContentDtos.ThemePaletteUpsertRequest(
                    List.of(theme), "theme-1");

            lenient().when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of());
            lenient().when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.ThemeCatalog result = service.saveThemePalette(request);

            assertThat(result).isNotNull();
            assertThat(result.themes()).isEmpty();
        }

        @Test
        void saveThemePalette_shouldUseDefaultModeWhenNull() {
            PublicContentDtos.ThemeVariant theme = new PublicContentDtos.ThemeVariant(
                    "theme-1", "Theme", null,
                    List.of(new PublicContentDtos.ThemeColor("primary", "#FF0000")),
                    true);
            PublicContentDtos.ThemePaletteUpsertRequest request = new PublicContentDtos.ThemePaletteUpsertRequest(
                    List.of(theme), "theme-1");

            lenient().when(repository.findByEntryKindOrderBySortOrderAscEventDateAscCreatedAtAsc("THEME"))
                    .thenReturn(List.of())
                    .thenReturn(List.of(createThemeEntity("theme-1", "light", "primary", "#FF0000", 1000)));
            lenient().when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PublicContentDtos.ThemeCatalog result = service.saveThemePalette(request);

            assertThat(result).isNotNull();
        }
    }

    // ========================================================================
    // LOCALE NORMALIZATION TESTS
    // ========================================================================

    @Nested
    class LocaleNormalizationTests {

        @Test
        void createLegislation_shouldNormalizeLocaleToDefaultWhenNull() {
            PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                    null, groupId, "law", "Test Law", null, null, null, null, null, null);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.LegislationEntry result = service.createLegislation(request);

            assertThat(result.locale()).isEqualTo("es-ES");
        }

        @Test
        void createLegislation_shouldNormalizeLocaleWithOnlyLanguage() {
            PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                    "en", groupId, "law", "Test Law", null, null, null, null, null, null);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.LegislationEntry result = service.createLegislation(request);

            assertThat(result.locale()).isEqualTo("en-ES");
        }

        @Test
        void createLegislation_shouldPreserveFullLocale() {
            PublicContentDtos.LegislationUpsertRequest request = new PublicContentDtos.LegislationUpsertRequest(
                    "en-GB", groupId, "law", "Test Law", null, null, null, null, null, null);

            when(repository.save(any(PublicContentEntryEntity.class))).thenAnswer(invocation -> {
                PublicContentEntryEntity e = invocation.getArgument(0);
                e.setId(entryId);
                e.setCreatedAt(now);
                e.setUpdatedAt(now);
                return e;
            });

            PublicContentDtos.LegislationEntry result = service.createLegislation(request);

            assertThat(result.locale()).isEqualTo("en-GB");
        }
    }

    // ========================================================================
    // LOCALIZATION (pickBestLocale) TESTS
    // ========================================================================

    @Nested
    class LocalizationTests {

        @Test
        void listPublicLegislation_shouldPickRequestedLocale() {
            LocaleContextHolder.setLocale(Locale.forLanguageTag("en-US"));

            PublicContentEntryEntity es = createLegislationEntity();
            es.setPublished(true);
            es.setLocale("es-ES");

            PublicContentEntryEntity en = createLegislationEntity();
            en.setId(UUID.randomUUID());
            en.setTranslationGroupId(groupId);
            en.setPublished(true);
            en.setLocale("en-US");
            en.setTitleText("English Law");

            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("LEGISLATION"))
                    .thenReturn(List.of(es, en));

            List<PublicContentDtos.LegislationEntry> result = service.listPublicLegislation(null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).title()).isEqualTo("English Law");
        }

        @Test
        void listPublicLegislation_shouldFallbackToDefaultLocaleWhenRequestedNotAvailable() {
            LocaleContextHolder.setLocale(Locale.forLanguageTag("fr-FR"));

            PublicContentEntryEntity es = createLegislationEntity();
            es.setPublished(true);
            es.setLocale("es-ES");

            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("LEGISLATION"))
                    .thenReturn(List.of(es));

            List<PublicContentDtos.LegislationEntry> result = service.listPublicLegislation(null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).locale()).isEqualTo("es-ES");
        }

        @Test
        void listPublicLegislation_shouldFallbackToFirstEntryWhenNoMatch() {
            LocaleContextHolder.setLocale(Locale.forLanguageTag("de-DE"));

            PublicContentEntryEntity pt = createLegislationEntity();
            pt.setPublished(true);
            pt.setLocale("pt-PT");
            pt.setTitleText("Portuguese Law");

            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("LEGISLATION"))
                    .thenReturn(List.of(pt));

            List<PublicContentDtos.LegislationEntry> result = service.listPublicLegislation(null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).title()).isEqualTo("Portuguese Law");
        }

        @Test
        void listPublicLegislation_shouldFallbackToSameLanguageWhenExactLocaleNotAvailable() {
            LocaleContextHolder.setLocale(Locale.forLanguageTag("en-GB"));

            PublicContentEntryEntity es = createLegislationEntity();
            es.setPublished(true);
            es.setLocale("es-ES");

            PublicContentEntryEntity enUs = createLegislationEntity();
            enUs.setId(UUID.randomUUID());
            enUs.setTranslationGroupId(groupId);
            enUs.setPublished(true);
            enUs.setLocale("en-US");
            enUs.setTitleText("English US Law");

            when(repository.findByEntryKindAndPublishedTrueOrderBySortOrderAscEventDateAscCreatedAtAsc("LEGISLATION"))
                    .thenReturn(List.of(es, enUs));

            List<PublicContentDtos.LegislationEntry> result = service.listPublicLegislation(null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).locale()).isEqualTo("en-US");
        }
    }
}
