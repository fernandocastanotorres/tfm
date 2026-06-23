package es.tfm.records.tests.security;

import es.tfm.records.infrastructure.security.JwtAuthenticationFilter;
import es.tfm.records.infrastructure.security.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private JwtAuthenticationFilter filter;

    private static final String VALID_TOKEN = "valid.jwt.token";
    private static final UUID USER_ID = UUID.randomUUID();
    private static final String EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtTokenProvider);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldSetAuthentication_whenTokenIsValid() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer " + VALID_TOKEN);
        when(jwtTokenProvider.validateToken(VALID_TOKEN)).thenReturn(true);
        when(jwtTokenProvider.getUserId(VALID_TOKEN)).thenReturn(USER_ID);
        when(jwtTokenProvider.getEmail(VALID_TOKEN)).thenReturn(EMAIL);
        when(jwtTokenProvider.getRoles(VALID_TOKEN)).thenReturn(List.of("ROLE_CITIZEN"));

        filter.doFilter(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(USER_ID.toString());
        assertThat(authentication.getAuthorities())
                .extracting(a -> a.getAuthority())
                .containsExactly("ROLE_CITIZEN");
    }

    @Test
    void shouldNotSetAuthentication_whenNoToken() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilter(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNull();
    }

    @Test
    void shouldNotSetAuthentication_whenTokenIsInvalid() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer " + VALID_TOKEN);
        when(jwtTokenProvider.validateToken(VALID_TOKEN)).thenReturn(false);

        filter.doFilter(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNull();
    }

    @Test
    void shouldNotSetAuthentication_whenWrongAuthHeaderFormat() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Basic credentials");

        filter.doFilter(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNull();
    }

    @Test
    void shouldNotSetAuthentication_whenEmptyAuthHeader() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("");

        filter.doFilter(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNull();
    }

    @Test
    void shouldProceedInChain_always() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldProceedInChain_evenWhenTokenIsValid() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer " + VALID_TOKEN);
        when(jwtTokenProvider.validateToken(VALID_TOKEN)).thenReturn(true);
        when(jwtTokenProvider.getUserId(VALID_TOKEN)).thenReturn(USER_ID);
        when(jwtTokenProvider.getEmail(VALID_TOKEN)).thenReturn(EMAIL);
        when(jwtTokenProvider.getRoles(VALID_TOKEN)).thenReturn(List.of("ROLE_CITIZEN"));

        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }
}
