package es.tfg.records.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import es.tfg.records.application.dto.FieldOptionDto;
import es.tfg.records.application.dto.FormFieldDto;
import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTaskFieldI18nEntity;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeI18nEntity;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTaskFieldI18nJpaRepository;
import es.tfg.records.infrastructure.persistence.repository.ProcedureTypeI18nJpaRepository;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class ProcedureCatalogI18nService {

    private static final Set<String> SUPPORTED = Set.of("es-ES", "ca-ES", "eu-ES", "gl-ES", "va-ES");
    private static final Locale DEFAULT_LOCALE = Locale.forLanguageTag("es-ES");

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final MessageSource messageSource;
    private final ProcedureTypeI18nJpaRepository procedureTypeI18nRepository;
    private final ProcedureTaskFieldI18nJpaRepository fieldI18nRepository;

    public ProcedureCatalogI18nService(MessageSource messageSource,
                                       ProcedureTypeI18nJpaRepository procedureTypeI18nRepository,
                                       ProcedureTaskFieldI18nJpaRepository fieldI18nRepository) {
        this.messageSource = messageSource;
        this.procedureTypeI18nRepository = procedureTypeI18nRepository;
        this.fieldI18nRepository = fieldI18nRepository;
    }

    public String localizeProcedureTitle(ProcedureType procedureType) {
        String translated = findProcedureTranslation(procedureType).map(ProcedureTypeI18nEntity::getTitle).orElse(null);
        if (translated != null && !translated.isBlank()) {
            return translated;
        }
        String key = "procedure." + toSlug(procedureType.getTitle()) + ".title";
        return getMessageOrDefault(key, procedureType.getTitle());
    }

    public String localizeProcedureDescription(ProcedureType procedureType) {
        String translated = findProcedureTranslation(procedureType).map(ProcedureTypeI18nEntity::getDescription).orElse(null);
        if (translated != null && !translated.isBlank()) {
            return translated;
        }
        String key = "procedure." + toSlug(procedureType.getTitle()) + ".description";
        return getMessageOrDefault(key, procedureType.getDescription());
    }

    public String localizeProcedureUnit(ProcedureType procedureType) {
        String translated = findProcedureTranslation(procedureType).map(ProcedureTypeI18nEntity::getUnit).orElse(null);
        if (translated != null && !translated.isBlank()) {
            return translated;
        }
        String key = "procedure." + toSlug(procedureType.getTitle()) + ".unit";
        return getMessageOrDefault(key, procedureType.getUnit());
    }

    public String localizeTaskTitle(ProcedureType procedureType, ProcedureTask task) {
        String key = "procedure." + toSlug(procedureType.getTitle()) + ".task." + task.getOrderIndex() + ".title";
        String genericKey = "procedure.task." + task.getOrderIndex() + ".title";
        return getMessageOrDefault(key, getMessageOrDefault(genericKey, task.getTitle()));
    }

    public String localizeTaskDescription(ProcedureType procedureType, ProcedureTask task) {
        String key = "procedure." + toSlug(procedureType.getTitle()) + ".task." + task.getOrderIndex() + ".description";
        String genericKey = "procedure.task." + task.getOrderIndex() + ".description";
        return getMessageOrDefault(key, getMessageOrDefault(genericKey, task.getDescription()));
    }

    /**
     * Localize a form field's display text (name, placeholder, options) for the
     * current request locale. Falls back through: requested locale → default
     * locale → raw values from the formSchema JSON.
     */
    public FormFieldDto localizeFormField(ProcedureType procedureType, ProcedureTask task, FormFieldDto field) {
        String localeTag = resolveLocaleTag();
        String defaultLocaleTag = DEFAULT_LOCALE.toLanguageTag();

        ProcedureTaskFieldI18nEntity translation = fieldI18nRepository
                .findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
                        procedureType.getId(), task.getOrderIndex(), field.id(), localeTag)
                .orElse(null);

        if (translation == null) {
            translation = fieldI18nRepository
                    .findByProcedureTypeIdAndTaskOrderIndexAndFieldIdAndLocale(
                            procedureType.getId(), task.getOrderIndex(), field.id(), defaultLocaleTag)
                    .orElse(null);
        }

        String resolvedName = (translation != null && translation.getName() != null && !translation.getName().isBlank())
                ? translation.getName()
                : field.label();

        String resolvedPlaceholder = (translation != null && translation.getPlaceholder() != null && !translation.getPlaceholder().isBlank())
                ? translation.getPlaceholder()
                : field.placeholder();

        List<FieldOptionDto> resolvedOptions = field.options();
        if (translation != null && translation.getOptionsJson() != null && !translation.getOptionsJson().isBlank()) {
            resolvedOptions = parseOptionsJson(translation.getOptionsJson());
        }

        return new FormFieldDto(
                field.id(),
                resolvedName,
                resolvedPlaceholder,
                field.required(),
                field.type(),
                resolvedOptions
        );
    }

    private List<FieldOptionDto> parseOptionsJson(String json) {
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<List<FieldOptionDto>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private String getMessageOrDefault(String key, String fallback) {
        return messageSource.getMessage(key, null, fallback, resolveLocale());
    }

    private Locale resolveLocale() {
        return Locale.forLanguageTag(resolveLocaleTag());
    }

    String resolveLocaleTag() {
        Locale requestLocale = LocaleContextHolder.getLocale();
        String tag = requestLocale.toLanguageTag();
        if (SUPPORTED.contains(tag)) {
            return tag;
        }
        for (String supportedTag : SUPPORTED) {
            if (supportedTag.startsWith(requestLocale.getLanguage() + "-")) {
                return supportedTag;
            }
        }
        return DEFAULT_LOCALE.toLanguageTag();
    }

    private java.util.Optional<ProcedureTypeI18nEntity> findProcedureTranslation(ProcedureType procedureType) {
        return procedureTypeI18nRepository.findByProcedureTypeIdAndLocale(procedureType.getId(), resolveLocaleTag());
    }

    private String toSlug(String title) {
        return title.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}
