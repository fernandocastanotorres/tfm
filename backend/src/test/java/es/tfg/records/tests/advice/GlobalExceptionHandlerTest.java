package es.tfg.records.tests.advice;

import es.tfg.records.application.dto.ErrorResponse;
import es.tfg.records.application.exception.*;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.validation.FieldError;
import org.springframework.validation.BindingResult;
import org.springframework.http.HttpMethod;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/v1/test");
    }

    // ===== RecordsException Tests =====

    @Test
    void handleRecordsException_shouldReturnCorrectStatusAndBody() {
        // Given
        ResourceNotFoundException ex = new ResourceNotFoundException("CASE", "123");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleRecordsException(ex, request);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(404);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("CASE-404-NOT_FOUND");
        assertThat(response.getBody().message()).contains("CASE");
        assertThat(response.getBody().status()).isEqualTo(404);
    }

    @Test
    void handleRecordsException_shouldHandleDifferentHttpStatuses() {
        // Given
        AuthenticationException authEx = new AuthenticationException("AUTH-401-INVALID", "Invalid credentials");
        ConflictException conflictEx = new ConflictException("CASE", "already exists");

        // When
        ResponseEntity<ErrorResponse> authResponse = handler.handleRecordsException(authEx, request);
        ResponseEntity<ErrorResponse> conflictResponse = handler.handleRecordsException(conflictEx, request);

        // Then
        assertThat(authResponse.getStatusCode().value()).isEqualTo(401);
        assertThat(conflictResponse.getStatusCode().value()).isEqualTo(409);
    }

    @Test
    void handleRecordsException_shouldIncludePathInResponse() {
        // Given
        when(request.getRequestURI()).thenReturn("/api/v1/cases/123");
        ResourceNotFoundException ex = new ResourceNotFoundException("CASE", "123");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleRecordsException(ex, request);

        // Then
        assertThat(response.getBody().path()).isEqualTo("/api/v1/cases/123");
    }

    // ===== ValidationException Tests =====

    @Test
    void handleValidationException_shouldReturn400WithDetails() {
        // Given
        List<ValidationException.ValidationError> errors = List.of(
                new ValidationException.ValidationError("email", "must be valid"),
                new ValidationException.ValidationError("password", "must not be blank")
        );
        ValidationException ex = new ValidationException(errors);

        // When
        ResponseEntity<ErrorResponse> response = handler.handleValidationException(ex, request);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("SYS-400-VALIDATION_ERROR");
        assertThat(response.getBody().details()).hasSize(2);
        assertThat(response.getBody().details()).extracting("field")
                .containsExactly("email", "password");
    }

    @Test
    void handleValidationException_shouldHandleSingleError() {
        // Given
        List<ValidationException.ValidationError> errors = List.of(
                new ValidationException.ValidationError("username", "required")
        );
        ValidationException ex = new ValidationException(errors);

        // When
        ResponseEntity<ErrorResponse> response = handler.handleValidationException(ex, request);

        // Then
        assertThat(response.getBody().details()).hasSize(1);
        assertThat(response.getBody().details().get(0).field()).isEqualTo("username");
    }

    // ===== MethodArgumentNotValidException Tests =====

    @Test
    void handleMethodArgumentNotValid_shouldReturn400WithFieldErrors() {
        // Given
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        FieldError fieldError1 = new FieldError("object", "email", "Invalid email");
        FieldError fieldError2 = new FieldError("object", "age", "Must be positive");

        BindingResult bindingResult = mock(BindingResult.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError1, fieldError2));

        // When
        ResponseEntity<ErrorResponse> response = handler.handleValidationException(ex, request);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody().code()).isEqualTo("SYS-400-VALIDATION_ERROR");
        assertThat(response.getBody().message()).isEqualTo("Request validation failed");
        assertThat(response.getBody().details()).hasSize(2);
    }

    // ===== HttpMessageNotReadableException Tests =====

    @Test
    void handleMessageNotReadable_shouldReturn400MalformedBody() {
        // Given
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException("Malformed JSON");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleMessageNotReadable(request);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("SYS-400-BAD_REQUEST");
        assertThat(response.getBody().message()).contains("malformed");
    }

    @Test
    void handleMessageNotReadable_shouldHandleMissingBody() {
        // Given
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException("Required body missing");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleMessageNotReadable(request);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody().message()).contains("missing");
    }

    // ===== NoResourceFoundException Tests =====

    @Test
    void handleNoResourceFound_shouldReturn404() {
        // Given
        NoResourceFoundException ex = new NoResourceFoundException(HttpMethod.GET, "/api/v1/unknown");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleNoResourceFound(request);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(404);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("SYS-404-NOT_FOUND");
        assertThat(response.getBody().message()).isEqualTo("Resource not found");
    }

    // ===== Generic Exception Tests =====

    @Test
    void handleGenericException_shouldReturn500AndGenericMessage() {
        // Given
        Exception ex = new RuntimeException("Something went wrong");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleGenericException(ex, request);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(500);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("SYS-500-INTERNAL_ERROR");
        assertThat(response.getBody().message()).isEqualTo("An unexpected error occurred");
    }

    @Test
    void handleGenericException_shouldNotExposeInternalErrorDetails() {
        // Given - security: internal details should not be exposed
        Exception ex = new IllegalStateException("Database connection failed: db.prod.internal:5432");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleGenericException(ex, request);

        // Then
        assertThat(response.getBody().message()).doesNotContain("Database");
        assertThat(response.getBody().message()).doesNotContain("db.prod");
    }

    // ===== Edge Cases =====

    @Test
    void handleRecordsException_shouldHandleAccessDeniedException() {
        // Given
        AccessDeniedException ex = new AccessDeniedException("CASE", "123");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleRecordsException(ex, request);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(response.getBody().code()).isEqualTo("CASE-403-NOT_OWNER");
    }

    @Test
    void handleRecordsException_shouldHandleInvalidProcedureException() {
        // Given
        InvalidProcedureException ex = new InvalidProcedureException("invalid-type");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleRecordsException(ex, request);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody().code()).isEqualTo("PROC-400-INVALID_PROCEDURE");
    }
}