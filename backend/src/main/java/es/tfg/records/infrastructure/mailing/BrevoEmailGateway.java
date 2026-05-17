package es.tfg.records.infrastructure.mailing;

import es.tfg.records.application.service.EmailGateway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class BrevoEmailGateway implements EmailGateway {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailGateway.class);

    private final RestClient restClient;
    private final String apiKey;
    private final boolean enabled;
    private final String fromEmail;
    private final String fromName;

    public BrevoEmailGateway(
            @Value("${mailing.brevo.api-key:}") String apiKey,
            @Value("${mailing.enabled:false}") boolean enabled,
            @Value("${mailing.from.email:no-reply@records.local}") String fromEmail,
            @Value("${mailing.from.name:Records}") String fromName
    ) {
        this.apiKey = apiKey;
        this.enabled = enabled;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.brevo.com/v3")
                .build();
    }

    @Override
    public void sendVerificationEmail(String recipientEmail, String recipientName, String verificationUrl) {
        if (!enabled || apiKey.isBlank()) {
            log.info("Mail disabled. Verification URL for {}: {}", recipientEmail, verificationUrl);
            return;
        }

        String html = """
                <div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;color:#0f172a\">
                  <div style=\"background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px\">
                    <h1 style=\"margin:0 0 12px;font-size:22px\">Activa tu cuenta</h1>
                    <p style=\"margin:0 0 10px\">Hola %s,</p>
                    <p style=\"margin:0 0 18px\">Gracias por registrarte en la Sede Electronica. Para activar tu cuenta, confirma tu correo pulsando el siguiente boton:</p>
                    <p style=\"margin:0 0 20px\">
                      <a href=\"%s\" style=\"display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700\">Confirmar cuenta</a>
                    </p>
                    <p style=\"margin:0 0 6px;color:#475569\">Este enlace caduca en 24 horas.</p>
                    <p style=\"margin:0;color:#475569\">Si no has solicitado este registro, puedes ignorar este mensaje.</p>
                  </div>
                </div>
                """.formatted(recipientName, verificationUrl);

        Map<String, Object> body = Map.of(
                "sender", Map.of("email", fromEmail, "name", fromName),
                "to", new Object[]{Map.of("email", recipientEmail, "name", recipientName)},
                "subject", "Confirma tu cuenta en la Sede Electronica",
                "htmlContent", html
        );

        restClient.post()
                .uri("/smtp/email")
                .header("api-key", apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }
}
