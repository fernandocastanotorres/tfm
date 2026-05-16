package es.tfg.records.application.service;

import es.tfg.records.domain.model.ProcedureTask;
import es.tfg.records.domain.model.ProcedureType;
import es.tfg.records.infrastructure.persistence.entity.ProcedureTypeI18nEntity;
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

    private final MessageSource messageSource;
    private final ProcedureTypeI18nJpaRepository procedureTypeI18nRepository;

    public ProcedureCatalogI18nService(MessageSource messageSource,
                                       ProcedureTypeI18nJpaRepository procedureTypeI18nRepository) {
        this.messageSource = messageSource;
        this.procedureTypeI18nRepository = procedureTypeI18nRepository;
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

    private String getMessageOrDefault(String key, String fallback) {
        return messageSource.getMessage(key, null, fallback, resolveLocale());
    }

    private Locale resolveLocale() {
        return Locale.forLanguageTag(resolveLocaleTag());
    }

    private String resolveLocaleTag() {
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
