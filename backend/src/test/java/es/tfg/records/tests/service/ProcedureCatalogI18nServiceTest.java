package es.tfg.records.tests.service;

import es.tfg.records.application.dto.FieldOptionDto;
import es.tfg.records.application.dto.FormFieldDto;
import es.tfg.records.application.service.ProcedureCatalogI18nService;
import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.domain.model.TaskType;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTaskFieldI18nEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeI18nEntity;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTaskFieldI18nJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTaskI18nJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeI18nJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProcedureCatalogI18nService")
class ProcedureCatalogI18nServiceTest {

    @Mock
    private ProcedureTypeI18nJpaRepository procedureTypeI18nRepository;

    @Mock
    private ProcedureTaskFieldI18nJpaRepository fieldI18nRepository;

    @Mock
    private ProcedureTaskI18nJpaRepository taskI18nRepository;

    @Mock
    private MessageSource messageSource;

    @InjectMocks
    private ProcedureCatalogI18nService service;

    private UUID procedureId;
    private ProcedureType procedureType;
    private ProcedureTask task;

    @BeforeEach
    void setUp() {
        procedureId = UUID.randomUUID();
        procedureType = new ProcedureType();
        procedureType.setId(procedureId);
        procedureType.setTitle("Citizen License");
        procedureType.setDescription("Apply for a citizen license");
        procedureType.setUnit("General Affairs");

        task = new ProcedureTask();
        task.setId(UUID.randomUUID());
        task.setProcedureTypeId(procedureId);
        task.setType(TaskType.FORM);
        task.setOrderIndex(1);
        task.setTitle("Personal Data");
        task.setDescription("Enter your personal data");
    }

    @Nested
    @DisplayName("localizeProcedureTitle")
    class LocalizeProcedureTitle {

        @Test
        @DisplayName("returns DB translation when available")
        void returnsDbTranslationWhenAvailable() {
            ProcedureTypeI18nEntity translation = new ProcedureTypeI18nEntity();
            translation.setTitle("Licencia de Ciudadano");
            translation.setDescription("Solicitar licencia");
            translation.setUnit("Asuntos Generales");

            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("es-ES"));
                when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureId, "es-ES"))
                        .thenReturn(Optional.of(translation));

                String result = service.localizeProcedureTitle(procedureType);

                assertThat(result).isEqualTo("Licencia de Ciudadano");
            }
        }

        @Test
        @DisplayName("falls back to messageSource when DB translation is missing")
        void fallsBackToMessageSourceWhenDbTranslationMissing() {
            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("ca-ES"));
                when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureId, "ca-ES"))
                        .thenReturn(Optional.empty());
                when(messageSource.getMessage(eq("procedure.citizen-license.title"), isNull(), eq("Citizen License"), any(Locale.class)))
                        .thenReturn("Llicència de Ciutadà");

                String result = service.localizeProcedureTitle(procedureType);

                assertThat(result).isEqualTo("Llicència de Ciutadà");
            }
        }

        @Test
        @DisplayName("falls back to messageSource when DB translation is blank")
        void fallsBackToMessageSourceWhenDbTranslationBlank() {
            ProcedureTypeI18nEntity translation = new ProcedureTypeI18nEntity();
            translation.setTitle("   ");

            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("es-ES"));
                when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureId, "es-ES"))
                        .thenReturn(Optional.of(translation));
                when(messageSource.getMessage(eq("procedure.citizen-license.title"), isNull(), eq("Citizen License"), any(Locale.class)))
                        .thenReturn("Translated via Bundle");

                String result = service.localizeProcedureTitle(procedureType);

                assertThat(result).isEqualTo("Translated via Bundle");
            }
        }

        @Test
        @DisplayName("falls back to original title when messageSource has no translation")
        void fallsBackToOriginalTitleWhenMessageSourceMissing() {
            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("ca-ES"));
                when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureId, "ca-ES"))
                        .thenReturn(Optional.empty());
                when(messageSource.getMessage(eq("procedure.citizen-license.title"), isNull(), eq("Citizen License"), any(Locale.class)))
                        .thenReturn("Citizen License");

                String result = service.localizeProcedureTitle(procedureType);

                assertThat(result).isEqualTo("Citizen License");
            }
        }
    }

    @Nested
    @DisplayName("localizeProcedureDescription")
    class LocalizeProcedureDescription {

        @Test
        @DisplayName("returns DB translation when available")
        void returnsDbTranslationWhenAvailable() {
            ProcedureTypeI18nEntity translation = new ProcedureTypeI18nEntity();
            translation.setTitle("Licencia");
            translation.setDescription("Descripción traducida");

            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("es-ES"));
                when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureId, "es-ES"))
                        .thenReturn(Optional.of(translation));

                String result = service.localizeProcedureDescription(procedureType);

                assertThat(result).isEqualTo("Descripción traducida");
            }
        }

        @Test
        @DisplayName("falls back to messageSource then to original description")
        void fallsBackToMessageSourceThenOriginal() {
            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("eu-ES"));
                when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureId, "eu-ES"))
                        .thenReturn(Optional.empty());
                when(messageSource.getMessage(eq("procedure.citizen-license.description"), isNull(), eq("Apply for a citizen license"), any(Locale.class)))
                        .thenReturn("Apply for a citizen license");

                String result = service.localizeProcedureDescription(procedureType);

                assertThat(result).isEqualTo("Apply for a citizen license");
            }
        }
    }

    @Nested
    @DisplayName("localizeProcedureUnit")
    class LocalizeProcedureUnit {

        @Test
        @DisplayName("returns DB translation when available")
        void returnsDbTranslationWhenAvailable() {
            ProcedureTypeI18nEntity translation = new ProcedureTypeI18nEntity();
            translation.setUnit("Unitate Translated");

            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("eu-ES"));
                when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureId, "eu-ES"))
                        .thenReturn(Optional.of(translation));

                String result = service.localizeProcedureUnit(procedureType);

                assertThat(result).isEqualTo("Unitate Translated");
            }
        }

        @Test
        @DisplayName("falls back through messageSource to original unit")
        void fallsBackThroughMessageSourceToOriginal() {
            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("gl-ES"));
                when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureId, "gl-ES"))
                        .thenReturn(Optional.empty());
                when(messageSource.getMessage(eq("procedure.citizen-license.unit"), isNull(), eq("General Affairs"), any(Locale.class)))
                        .thenReturn("Asuntos Xerais");

                String result = service.localizeProcedureUnit(procedureType);

                assertThat(result).isEqualTo("Asuntos Xerais");
            }
        }
    }

    @Nested
    @DisplayName("localizeTaskTitle")
    class LocalizeTaskTitle {

        @Test
        @DisplayName("uses specific procedure-task key when available")
        void usesSpecificProcedureTaskKey() {
            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("es-ES"));
                // Inner call: generic key returns fallback (task title) since no translation
                when(messageSource.getMessage(eq("procedure.task.1.title"), isNull(), eq("Personal Data"), any(Locale.class)))
                        .thenReturn("Personal Data");
                // Outer call: specific key has a translation
                when(messageSource.getMessage(eq("procedure.citizen-license.task.1.title"), isNull(), eq("Personal Data"), any(Locale.class)))
                        .thenReturn("Datos Personales");

                String result = service.localizeTaskTitle(procedureType, task);

                assertThat(result).isEqualTo("Datos Personales");
            }
        }

        @Test
        @DisplayName("falls back to generic task key then to original title")
        void fallsBackToGenericTaskKeyThenOriginal() {
            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("es-ES"));
                // Inner call: generic key has a translation
                when(messageSource.getMessage(eq("procedure.task.1.title"), isNull(), eq("Personal Data"), any(Locale.class)))
                        .thenReturn("Task One Translated");
                // Outer call: specific key returns its fallback (the generic translation)
                when(messageSource.getMessage(eq("procedure.citizen-license.task.1.title"), isNull(), eq("Task One Translated"), any(Locale.class)))
                        .thenReturn("Task One Translated");

                String result = service.localizeTaskTitle(procedureType, task);

                assertThat(result).isEqualTo("Task One Translated");
            }
        }
    }

    @Nested
    @DisplayName("localizeTaskDescription")
    class LocalizeTaskDescription {

        @Test
        @DisplayName("uses specific procedure-task key when available")
        void usesSpecificProcedureTaskKey() {
            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("ca-ES"));
                // Inner call: generic key returns fallback (task description)
                when(messageSource.getMessage(eq("procedure.task.1.description"), isNull(), eq("Enter your personal data"), any(Locale.class)))
                        .thenReturn("Enter your personal data");
                // Outer call: specific key has a translation
                when(messageSource.getMessage(eq("procedure.citizen-license.task.1.description"), isNull(), eq("Enter your personal data"), any(Locale.class)))
                        .thenReturn("Descripció de la tasca");

                String result = service.localizeTaskDescription(procedureType, task);

                assertThat(result).isEqualTo("Descripció de la tasca");
            }
        }

        @Test
        @DisplayName("falls back to generic key then to original description")
        void fallsBackToGenericKeyThenOriginal() {
            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("ca-ES"));
                // Inner call: generic key returns fallback (no translation available)
                when(messageSource.getMessage(eq("procedure.task.1.description"), isNull(), eq("Enter your personal data"), any(Locale.class)))
                        .thenReturn("Enter your personal data");
                // Outer call: specific key also returns its fallback
                when(messageSource.getMessage(eq("procedure.citizen-license.task.1.description"), isNull(), eq("Enter your personal data"), any(Locale.class)))
                        .thenReturn("Enter your personal data");

                String result = service.localizeTaskDescription(procedureType, task);

                assertThat(result).isEqualTo("Enter your personal data");
            }
        }
    }

    @Nested
    @DisplayName("localizeFormField")
    class LocalizeFormField {

        private FormFieldDto originalField;

        @BeforeEach
        void setUpField() {
            originalField = new FormFieldDto(
                    "firstName",
                    "First Name",
                    "Enter first name",
                    true,
                    "text",
                    List.of()
            );
        }

        @Test
        @DisplayName("returns translated field when translation exists for requested locale")
        void returnsTranslatedFieldWhenTranslationExists() {
            ProcedureTaskFieldI18nEntity translation = new ProcedureTaskFieldI18nEntity();
            translation.setName("Nombre");
            translation.setPlaceholder("Introduce tu nombre");

            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("es-ES"));
                when(fieldI18nRepository.findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
                        procedureId, 1, "firstName", "es-ES"))
                        .thenReturn(Optional.of(translation));

                FormFieldDto result = service.localizeFormField(procedureType, task, originalField);

                assertThat(result.label()).isEqualTo("Nombre");
                assertThat(result.placeholder()).isEqualTo("Introduce tu nombre");
                assertThat(result.required()).isTrue();
                assertThat(result.type()).isEqualTo("text");
            }
        }

        @Test
        @DisplayName("falls back to default locale when requested locale translation missing")
        void fallsBackToDefaultLocaleWhenRequestedMissing() {
            ProcedureTaskFieldI18nEntity defaultTranslation = new ProcedureTaskFieldI18nEntity();
            defaultTranslation.setName("Nombre (default)");
            defaultTranslation.setPlaceholder("Placeholder default");

            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("ca-ES"));
                when(fieldI18nRepository.findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
                        procedureId, 1, "firstName", "ca-ES"))
                        .thenReturn(Optional.empty());
                when(fieldI18nRepository.findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
                        procedureId, 1, "firstName", "es-ES"))
                        .thenReturn(Optional.of(defaultTranslation));

                FormFieldDto result = service.localizeFormField(procedureType, task, originalField);

                assertThat(result.label()).isEqualTo("Nombre (default)");
                assertThat(result.placeholder()).isEqualTo("Placeholder default");
            }
        }

        @Test
        @DisplayName("falls back to original field values when no translation exists at all")
        void fallsBackToOriginalValuesWhenNoTranslation() {
            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("ca-ES"));
                when(fieldI18nRepository.findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
                        procedureId, 1, "firstName", "ca-ES"))
                        .thenReturn(Optional.empty());
                when(fieldI18nRepository.findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
                        procedureId, 1, "firstName", "es-ES"))
                        .thenReturn(Optional.empty());

                FormFieldDto result = service.localizeFormField(procedureType, task, originalField);

                assertThat(result.label()).isEqualTo("First Name");
                assertThat(result.placeholder()).isEqualTo("Enter first name");
            }
        }

        @Test
        @DisplayName("parses optionsJson when translation includes options")
        void parsesOptionsJsonWhenTranslationIncludesOptions() {
            String optionsJson = "[{\"value\":\"M\",\"label\":\"Male\"},{\"value\":\"F\",\"label\":\"Female\"}]";
            ProcedureTaskFieldI18nEntity translation = new ProcedureTaskFieldI18nEntity();
            translation.setName("Gender");
            translation.setPlaceholder("Select gender");
            translation.setOptionsJson(optionsJson);

            FormFieldDto selectField = new FormFieldDto(
                    "gender", "Gender", "Select", false, "select", List.of()
            );

            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("es-ES"));
                when(fieldI18nRepository.findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
                        procedureId, 1, "gender", "es-ES"))
                        .thenReturn(Optional.of(translation));

                FormFieldDto result = service.localizeFormField(procedureType, task, selectField);

                assertThat(result.options()).hasSize(2);
                assertThat(result.options().get(0)).isEqualTo(new FieldOptionDto("M", "Male"));
                assertThat(result.options().get(1)).isEqualTo(new FieldOptionDto("F", "Female"));
            }
        }

        @Test
        @DisplayName("returns empty options list when optionsJson is invalid")
        void returnsEmptyOptionsWhenOptionsJsonInvalid() {
            ProcedureTaskFieldI18nEntity translation = new ProcedureTaskFieldI18nEntity();
            translation.setName("Gender");
            translation.setOptionsJson("not valid json");

            FormFieldDto selectField = new FormFieldDto(
                    "gender", "Gender", "Select", false, "select", List.of()
            );

            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("es-ES"));
                when(fieldI18nRepository.findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
                        procedureId, 1, "gender", "es-ES"))
                        .thenReturn(Optional.of(translation));

                FormFieldDto result = service.localizeFormField(procedureType, task, selectField);

                assertThat(result.options()).isEmpty();
            }
        }

        @Test
        @DisplayName("resolves unsupported locale to default locale")
        void resolvesUnsupportedLocaleToDefaultLocale() {
            // We test that "fr-FR" resolves to "es-ES" (default)
            // For procedure-level, this means the repository is called with "es-ES"

            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("fr-FR"));
                when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureId, "es-ES"))
                        .thenReturn(Optional.empty());
                when(messageSource.getMessage(eq("procedure.citizen-license.title"), isNull(), eq("Citizen License"), any(Locale.class)))
                        .thenReturn("Citizen License");

                String result = service.localizeProcedureTitle(procedureType);

                assertThat(result).isEqualTo("Citizen License");
            }
        }

        @Test
        @DisplayName("resolves locale with matching language to supported variant")
        void resolvesLocaleWithMatchingLanguageToSupportedVariant() {
            // "ca" should match "ca-ES" since it starts with "ca-"
            try (MockedStatic<LocaleContextHolder> mocked = mockStatic(LocaleContextHolder.class)) {
                mocked.when(LocaleContextHolder::getLocale).thenReturn(Locale.forLanguageTag("ca"));
                when(procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureId, "ca-ES"))
                        .thenReturn(Optional.empty());
                when(messageSource.getMessage(eq("procedure.citizen-license.title"), isNull(), eq("Citizen License"), any(Locale.class)))
                        .thenReturn("Llicència");

                String result = service.localizeProcedureTitle(procedureType);

                assertThat(result).isEqualTo("Llicència");
            }
        }
    }
}
