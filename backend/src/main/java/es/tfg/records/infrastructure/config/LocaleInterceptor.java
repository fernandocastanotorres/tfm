package es.tfg.records.infrastructure.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.LocaleResolver;

import java.util.Locale;

/**
 * Interceptor that resolves the locale from the Accept-Language header
 * and binds it to LocaleContextHolder for the current request thread.
 */
public class LocaleInterceptor implements HandlerInterceptor {

    private final LocaleResolver localeResolver;

    public LocaleInterceptor(LocaleResolver localeResolver) {
        this.localeResolver = localeResolver;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Locale locale = localeResolver.resolveLocale(request);
        LocaleContextHolder.setLocale(locale);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        LocaleContextHolder.resetLocaleContext();
    }
}
