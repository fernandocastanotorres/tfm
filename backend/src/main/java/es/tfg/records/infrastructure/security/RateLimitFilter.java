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
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Rate limiting filter for authentication endpoints.
 * Uses a sliding window counter: 10 requests per minute per IP for auth endpoints.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private static final int MAX_REQUESTS_PER_WINDOW = 10;
    private static final long WINDOW_SIZE_MS = 60_000;
    private static final long CLEANUP_INTERVAL_MS = 300_000;

    private static final int MAX_ADMIN_REQUESTS_PER_WINDOW = 20;

    private static final String[] RATE_LIMITED_PATHS = {
            "/auth/login",
            "/auth/register",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/refresh",
            "/auth/verify-otp",
            "/auth/resend-verification"
    };

    private static final String[] ADMIN_RATE_LIMITED_PATHS = {
            "/admin/users",
            "/admin/procedure-types"
    };

    private final Map<String, RequestWindow> requestWindows = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupScheduler;

    public RateLimitFilter() {
        this.cleanupScheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "rate-limit-cleanup");
            t.setDaemon(true);
            return t;
        });
        this.cleanupScheduler.scheduleAtFixedRate(this::cleanupStaleWindows,
                CLEANUP_INTERVAL_MS, CLEANUP_INTERVAL_MS, TimeUnit.MILLISECONDS);
    }

    private void cleanupStaleWindows() {
        long now = System.currentTimeMillis();
        requestWindows.entrySet().removeIf(entry ->
                now - entry.getValue().lastAccess > CLEANUP_INTERVAL_MS);
        log.debug("Rate limit cleanup: {} active windows", requestWindows.size());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                      FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        if (!isRateLimitedPath(path) && !isAdminRateLimitedPath(path, request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        RequestWindow window = requestWindows.computeIfAbsent(clientIp, k -> new RequestWindow());
        int limit = isAdminRateLimitedPath(path, request) ? MAX_ADMIN_REQUESTS_PER_WINDOW : MAX_REQUESTS_PER_WINDOW;

        synchronized (window) {
            window.pruneOldRequests();

            if (window.count >= limit) {
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

    private boolean isAdminRateLimitedPath(String path, HttpServletRequest request) {
        for (String limitedPath : ADMIN_RATE_LIMITED_PATHS) {
            if (path.contains(limitedPath)) {
                String method = request.getMethod();
                return "POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method) || "DELETE".equals(method);
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
        long lastAccess = System.currentTimeMillis();

        void addRequest(long timestamp) {
            if (timestamp - windowStart > WINDOW_SIZE_MS) {
                windowStart = timestamp;
                count = 0;
            }
            count++;
            lastAccess = timestamp;
        }

        void pruneOldRequests() {
            long now = System.currentTimeMillis();
            if (now - windowStart > WINDOW_SIZE_MS) {
                windowStart = now;
                count = 0;
            }
            lastAccess = now;
        }
    }
}
