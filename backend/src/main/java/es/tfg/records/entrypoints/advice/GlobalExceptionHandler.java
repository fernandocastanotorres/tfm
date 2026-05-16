package es.tfg.records.entrypoints.advice;

import es.tfg.records.application.dto.ErrorResponse;
import es.tfg.records.application.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.List;

/**
 * Global exception handler mapping all exceptions to canonical ErrorResponse format.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RecordsException.class)
    public ResponseEntity<ErrorResponse> handleRecordsException(RecordsException ex, HttpServletRequest request) {
        ErrorResponse response = buildErrorResponse(
                ex.getHttpStatus(),
                ex.getErrorCode(),
                ex.getMessage(),
                request.getRequestURI(),
                null);

        return ResponseEntity.status(ex.getHttpStatus()).body(response);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex, HttpServletRequest request) {
        List<ErrorResponse.ErrorDetail> details = ex.getErrors().stream()
                .map(e -> new ErrorResponse.ErrorDetail(e.field(), e.issue()))
                .toList();

        ErrorResponse response = buildErrorResponse(
                400,
                ex.getErrorCode(),
                ex.getMessage(),
                request.getRequestURI(),
                details);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ErrorResponse.ErrorDetail> details = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ErrorResponse.ErrorDetail(fe.getField(), fe.getDefaultMessage()))
                .toList();

        ErrorResponse response = buildErrorResponse(
                400,
                "SYS-400-VALIDATION_ERROR",
                "Request validation failed",
                request.getRequestURI(),
                details);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(HttpServletRequest request) {
        ErrorResponse response = buildErrorResponse(
                400,
                "SYS-400-BAD_REQUEST",
                "Request body is malformed or missing required fields",
                request.getRequestURI(),
                null);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(HttpServletRequest request) {
        ErrorResponse response = buildErrorResponse(
                404,
                "SYS-404-NOT_FOUND",
                "Resource not found",
                request.getRequestURI(),
                null);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse response = buildErrorResponse(
                500,
                "SYS-500-INTERNAL_ERROR",
                "An unexpected error occurred",
                request.getRequestURI(),
                null);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private ErrorResponse buildErrorResponse(int status, String code, String message,
                                              String path, List<ErrorResponse.ErrorDetail> details) {
        return new ErrorResponse(
                Instant.now(),
                status,
                code,
                message,
                path,
                MDC.get("correlationId"),
                details);
    }
}
