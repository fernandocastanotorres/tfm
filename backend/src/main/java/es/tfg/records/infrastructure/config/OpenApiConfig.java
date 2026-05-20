package es.tfg.records.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * SpringDoc OpenAPI configuration with JWT security scheme.
 * Documents all REST endpoints for interactive exploration via Swagger UI.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("TFG Records API")
                        .description("Electronic Citizen Records Management System — "
                                + "REST API for procedure management, electronic signing, "
                                + "case tracking, and backoffice administration.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("TFG Team")
                                .email("support@tfg.es"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .tags(List.of(
                        new Tag().name("Authentication").description("User registration, login, and token management"),
                        new Tag().name("Citizen Cases").description("Citizen case lifecycle: drafts, submission, status, amendments"),
                        new Tag().name("Procedures Catalog").description("Available procedure types and dynamic form schemas"),
                        new Tag().name("Electronic Signature").description("PAdES-BES document signing, digest computation, and verification"),
                        new Tag().name("Documents").description("Document upload, download, and management"),
                        new Tag().name("Backoffice").description("Admin dashboard, task resolution, user management, and public content"),
                        new Tag().name("Transparency").description("Transparency reports and metrics"),
                        new Tag().name("Public Content").description("Sede electronica public pages: FAQ, calendar, organisms, legislation"),
                        new Tag().name("Workflow").description("BPMN process engine task completion and case progression"),
                        new Tag().name("Health").description("Application liveness and readiness probes")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token obtained from POST /auth/login")));
    }
}
