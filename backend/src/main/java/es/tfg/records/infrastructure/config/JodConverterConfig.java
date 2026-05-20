package es.tfg.records.infrastructure.config;

import org.jodconverter.core.DocumentConverter;
import org.jodconverter.core.office.OfficeManager;
import org.jodconverter.local.LocalConverter;
import org.jodconverter.local.office.LocalOfficeManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;

/**
 * Configuration for JODConverter (LibreOffice integration) for document conversion.
 * Used for converting documents to PDF/A format before signing.
 * Only active when jodconverter.office-home is explicitly configured.
 */
@Configuration
@ConditionalOnProperty(name = "jodconverter.enabled", havingValue = "true")
public class JodConverterConfig {

    private static final Logger log = LoggerFactory.getLogger(JodConverterConfig.class);

    @Value("${jodconverter.office-home}")
    private String officeHome;

    @Value("${jodconverter.port-numbers:2002}")
    private int portNumber;

    @Bean(destroyMethod = "stop")
    public OfficeManager officeManager() {
        log.info("JODConverter enabled with LibreOffice at: {}", officeHome);
        return LocalOfficeManager.builder()
                .officeHome(new File(officeHome))
                .portNumbers(portNumber)
                .build();
    }

    @Bean
    public DocumentConverter documentConverter(OfficeManager officeManager) {
        return LocalConverter.builder()
                .officeManager(officeManager)
                .build();
    }
}
