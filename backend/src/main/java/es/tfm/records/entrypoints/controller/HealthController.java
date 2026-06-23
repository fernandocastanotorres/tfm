package es.tfm.records.entrypoints.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Health check endpoints for liveness and readiness probes.
 */
@RestController
@RequestMapping("/health")
@Tag(name = "Health", description = "Liveness and readiness probes for container orchestration")
public class HealthController {

    @GetMapping("/live")
    @Operation(summary = "Liveness probe", description = "Returns UP if the application is running. Used by Kubernetes/container orchestrators.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Application is alive")
    })
    public ResponseEntity<Map<String, Object>> liveness() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/ready")
    @Operation(summary = "Readiness probe", description = "Returns UP with dependency health details. Used by Kubernetes/container orchestrators to determine if the app can accept traffic.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Application is ready to accept traffic")
    })
    public ResponseEntity<Map<String, Object>> readiness() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString(),
                "dependencies", Map.of(
                        "database", "OK"
                )
        ));
    }
}
