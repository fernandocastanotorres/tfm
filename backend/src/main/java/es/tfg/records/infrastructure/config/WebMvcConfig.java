package es.tfg.records.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Web MVC configuration for CORS, i18n and global pagination defaults.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private static final List<Locale> SUPPORTED_LOCALES = Arrays.asList(
            new Locale("es", "ES"),
            new Locale("ca", "ES"),
            new Locale("eu", "ES"),
            new Locale("gl", "ES"),
            new Locale("va", "ES")
    );

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Content-Type", "Authorization", "X-Correlation-Id", "Accept-Language", "X-Requested-With")
                .exposedHeaders("X-Correlation-Id")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LocaleInterceptor(localeResolver()));
    }

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setSupportedLocales(SUPPORTED_LOCALES);
        resolver.setDefaultLocale(new Locale("es", "ES"));
        return resolver;
    }
}
