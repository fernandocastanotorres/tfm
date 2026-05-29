package es.tfg.records.tests.security;

import es.tfg.records.infrastructure.security.RateLimitFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Field;
import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RateLimitFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private RateLimitFilter filter;

    private StringWriter responseWriter;
    private PrintWriter printWriter;

    @BeforeEach
    void setUp() throws Exception {
        filter = new RateLimitFilter();
        responseWriter = new StringWriter();
        printWriter = new PrintWriter(responseWriter);
        when(response.getWriter()).thenReturn(printWriter);
    }

    @Test
    void shouldAllowRequest_whenPathIsNotRateLimited() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/public/test");

        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void shouldAllowRequest_whenUnderLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void shouldBlockRequest_whenOverLimit() throws Exception {
        String clientIp = "10.0.0.1";
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getRemoteAddr()).thenReturn(clientIp);
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        // 10 requests should pass (MAX_REQUESTS_PER_WINDOW = 10)
        for (int i = 0; i < 10; i++) {
            filter.doFilter(request, response, filterChain);
        }

        // 11th request should be rate limited
        filter.doFilter(request, response, filterChain);

        verify(filterChain, org.mockito.Mockito.times(10)).doFilter(request, response);
        verify(response).setStatus(429);
        verify(response).setContentType("application/json");
        assertThat(responseWriter.toString()).contains("\"code\":\"AUTH-429-RATE_LIMITED\"");
    }

    @Test
    void shouldAllowAdminRequest_whenUnderLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/admin/users");
        when(request.getMethod()).thenReturn("POST");
        when(request.getRemoteAddr()).thenReturn("10.0.0.2");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        // 20 requests should pass (MAX_ADMIN_REQUESTS_PER_WINDOW = 20)
        for (int i = 0; i < 20; i++) {
            filter.doFilter(request, response, filterChain);
        }

        filter.doFilter(request, response, filterChain);

        verify(filterChain, org.mockito.Mockito.times(20)).doFilter(request, response);
        verify(response).setStatus(429);
        assertThat(responseWriter.toString()).contains("AUTH-429-RATE_LIMITED");
    }

    @Test
    void shouldNotRateLimitAdminPath_whenMethodIsGET() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/admin/users");
        when(request.getMethod()).thenReturn("GET");
        when(request.getRemoteAddr()).thenReturn("10.0.0.3");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        // Make many GET requests to admin path - none should be rate limited
        for (int i = 0; i < 25; i++) {
            filter.doFilter(request, response, filterChain);
        }

        verify(filterChain, org.mockito.Mockito.times(25)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    void shouldRateLimitAdminPath_whenMethodIsPut() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/admin/procedure-types");
        when(request.getMethod()).thenReturn("PUT");
        when(request.getRemoteAddr()).thenReturn("10.0.0.4");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        for (int i = 0; i < 20; i++) {
            filter.doFilter(request, response, filterChain);
        }

        filter.doFilter(request, response, filterChain);

        verify(filterChain, org.mockito.Mockito.times(20)).doFilter(request, response);
        verify(response).setStatus(429);
    }

    @Test
    void shouldRateLimitAdminPath_whenMethodIsPatch() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/admin/users/123");
        when(request.getMethod()).thenReturn("PATCH");
        when(request.getRemoteAddr()).thenReturn("10.0.0.5");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        for (int i = 0; i < 20; i++) {
            filter.doFilter(request, response, filterChain);
        }

        filter.doFilter(request, response, filterChain);

        verify(response).setStatus(429);
    }

    @Test
    void shouldRateLimitAdminPath_whenMethodIsDelete() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/admin/users/456");
        when(request.getMethod()).thenReturn("DELETE");
        when(request.getRemoteAddr()).thenReturn("10.0.0.6");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        for (int i = 0; i < 20; i++) {
            filter.doFilter(request, response, filterChain);
        }

        filter.doFilter(request, response, filterChain);

        verify(response).setStatus(429);
    }

    @Test
    void shouldUseXForwardedForHeader_whenPresent() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.5, 10.0.0.1");

        // Make 10 requests from the X-Forwarded-For IP
        for (int i = 0; i < 10; i++) {
            filter.doFilter(request, response, filterChain);
        }

        // 11th should be blocked - keyed by X-Forwarded-For first IP, not remoteAddr
        filter.doFilter(request, response, filterChain);

        verify(response).setStatus(429);
    }

    @Test
    void shouldFallbackToRemoteAddr_whenNoXForwardedForHeader() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getRemoteAddr()).thenReturn("10.0.0.99");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        for (int i = 0; i < 10; i++) {
            filter.doFilter(request, response, filterChain);
        }

        filter.doFilter(request, response, filterChain);

        verify(response).setStatus(429);
    }

    @Test
    void shouldDifferentiateClients_byIp() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        // Client A uses all 10 requests
        when(request.getRemoteAddr()).thenReturn("10.0.0.10");
        for (int i = 0; i < 10; i++) {
            filter.doFilter(request, response, filterChain);
        }

        // Client B with different IP should be under limit
        when(request.getRemoteAddr()).thenReturn("10.0.0.20");
        filter.doFilter(request, response, filterChain);

        // Client B's request should pass
        verify(filterChain, org.mockito.Mockito.times(11)).doFilter(request, response);
    }

    @Test
    void shouldReturn429_withCorrectJsonBody() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getRemoteAddr()).thenReturn("10.0.0.30");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        for (int i = 0; i < 11; i++) {
            filter.doFilter(request, response, filterChain);
        }

        String jsonBody = responseWriter.toString();
        assertThat(jsonBody)
                .contains("\"status\":429")
                .contains("\"code\":\"AUTH-429-RATE_LIMITED\"")
                .contains("\"message\":\"Too many requests. Please try again later.\"");
    }

    @Test
    void shouldBlockOnlyOverLimitClient_notOthers() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);

        // Client C goes over limit
        when(request.getRemoteAddr()).thenReturn("10.0.0.40");
        for (int i = 0; i < 11; i++) {
            filter.doFilter(request, response, filterChain);
        }
        verify(response).setStatus(429);

        // Client D with different IP is unaffected
        org.mockito.Mockito.clearInvocations(response);
        when(request.getRemoteAddr()).thenReturn("10.0.0.50");
        filter.doFilter(request, response, filterChain);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void shouldCleanupStaleWindows() throws Exception {
        // Create a window entry by making a request
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getRemoteAddr()).thenReturn("192.168.1.99");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        filter.doFilter(request, response, filterChain);

        // Access the requestWindows map via reflection
        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Object> windows =
                (ConcurrentHashMap<String, Object>) ReflectionTestUtils.getField(filter, "requestWindows");

        assertThat(windows).isNotNull();
        assertThat(windows).hasSize(1);

        // Set the lastAccess timestamp to be very old (older than CLEANUP_INTERVAL_MS = 300000)
        Object window = windows.get("192.168.1.99");
        assertThat(window).isNotNull();

        Field lastAccessField = window.getClass().getDeclaredField("lastAccess");
        lastAccessField.setAccessible(true);
        lastAccessField.setLong(window, System.currentTimeMillis() - 600_000L); // 10 minutes old

        // Invoke cleanupStaleWindows() via reflection
        ReflectionTestUtils.invokeMethod(filter, "cleanupStaleWindows");

        // Stale window should be removed
        assertThat(windows).isEmpty();
    }

    @Test
    void shouldNotCleanupRecentWindows() throws Exception {
        // Create a window entry with a recent timestamp
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getRemoteAddr()).thenReturn("192.168.1.100");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        filter.doFilter(request, response, filterChain);

        // Invoke cleanup immediately (window is recent, should be kept)
        ReflectionTestUtils.invokeMethod(filter, "cleanupStaleWindows");

        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Object> windows =
                (ConcurrentHashMap<String, Object>) ReflectionTestUtils.getField(filter, "requestWindows");

        assertThat(windows).isNotEmpty();
    }
}
