package es.tfg.records.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting filter for authentication endpoints.
 * Uses a sliding window counter: 10 requests per minute per IP for auth endpoints.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private static final int MAX_REQUESTS_PER_WINDOW = 10;
    private static final long WINDOW_SIZE_MS = 60_000; // 1 minute

    private static final String[] RATE_LIMITED_PATHS = {
            "/auth/login",
            "/auth/register",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/refresh"
    };

    private final Map<String, RequestWindow> requestWindows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        if (!isRateLimitedPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        RequestWindow window = requestWindows.computeIfAbsent(clientIp, k -> new RequestWindow());

        synchronized (window) {
            window.pruneOldRequests();

            if (window.count >= MAX_REQUESTS_PER_WINDOW) {
                log.warn("Rate limit exceeded for IP {} on {}", clientIp, path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"status\":429,\"code\":\"AUTH-429-RATE_LIMITED\"," +
                        "\"message\":\"Too many requests. Please try again later.\"}");
                return;
            }

            window.addRequest(System.currentTimeMillis());
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimitedPath(String path) {
        for (String limitedPath : RATE_LIMITED_PATHS) {
            if (path.endsWith(limitedPath)) {
                return true;
            }
        }
        return false;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RequestWindow {
        int count = 0;
        long windowStart = System.currentTimeMillis();

        void addRequest(long timestamp) {
            if (timestamp - windowStart > WINDOW_SIZE_MS) {
                windowStart = timestamp;
                count = 0;
            }
            count++;
        }

        void pruneOldRequests() {
            long now = System.currentTimeMillis();
            if (now - windowStart > WINDOW_SIZE_MS) {
                windowStart = now;
                count = 0;
            }
        }
    }
}
