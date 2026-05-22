package es.tfg.records.infrastructure.mailing;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class BrevoEmailGateway {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailGateway.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String fromEmail;
    private final String fromName;

    public BrevoEmailGateway(
            @Value("${mailing.enabled:false}") boolean enabled,
            @Value("${mailing.from.email:no-reply@records.local}") String fromEmail,
            @Value("${mailing.from.name:Records}") String fromName,
            JavaMailSender mailSender
    ) {
        this.enabled = enabled;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String recipientEmail, String recipientName, String verificationUrl) {
        if (!enabled) {
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

        sendHtml(recipientEmail, recipientName, "Confirma tu cuenta en la Sede Electronica", html);
    }

    public void sendPasswordResetEmail(String recipientEmail, String recipientName, String resetUrl) {
        if (!enabled) {
            log.info("Mail disabled. Password reset URL for {}: {}", recipientEmail, resetUrl);
            return;
        }

        String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;color:#0f172a">
                  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
                    <h1 style="margin:0 0 12px;font-size:22px">Restablece tu contrasena</h1>
                    <p style="margin:0 0 10px">Hola %s,</p>
                    <p style="margin:0 0 18px">Hemos recibido una solicitud para restablecer la contrasena de tu cuenta. Pulsa el siguiente boton para continuar:</p>
                    <p style="margin:0 0 20px">
                      <a href="%s" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Restablecer contrasena</a>
                    </p>
                    <p style="margin:0 0 6px;color:#475569">Este enlace caduca en 1 hora.</p>
                    <p style="margin:0;color:#475569">Si no has solicitado este cambio, puedes ignorar este mensaje.</p>
                  </div>
                </div>
                """.formatted(recipientName, resetUrl);

        sendHtml(recipientEmail, recipientName, "Restablece tu contrasena - Sede Electronica", html);
    }

    public void sendNewMessageNotification(String recipientEmail, String senderName, String messagePreview, String caseId) {
        if (!enabled) {
            log.info("Mail disabled. New message notification for {}: case {}", recipientEmail, caseId);
            return;
        }

        String preview = messagePreview != null && messagePreview.length() > 200
                ? messagePreview.substring(0, 200) + "..."
                : messagePreview;

        String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;color:#0f172a">
                  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
                    <h1 style="margin:0 0 12px;font-size:22px">Nuevo mensaje en tu expediente</h1>
                    <p style="margin:0 0 10px">Hola,</p>
                    <p style="margin:0 0 18px"><strong>%s</strong> te ha enviado un mensaje sobre tu expediente:</p>
                    <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:0 0 20px">
                      <p style="margin:0;color:#334155">%s</p>
                    </div>
                    <p style="margin:0 0 20px">
                      <a href="http://localhost:4200/sede/expedientes/%s/detalle" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Ver expediente</a>
                    </p>
                    <p style="margin:0;color:#475569">Este es un mensaje automatico de la Sede Electronica.</p>
                  </div>
                </div>
                """.formatted(senderName, preview != null ? preview : "(sin contenido)", caseId);

        sendHtml(recipientEmail, null, "Nuevo mensaje en tu expediente - Sede Electronica", html);
    }

    private void sendHtml(String toEmail, String toName, String subject, String html) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            if (toName != null && !toName.isBlank()) {
                helper.setTo(toEmail);
            } else {
                helper.setTo(toEmail);
            }
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(mimeMessage);
        } catch (Exception ex) {
            log.error("Failed to send email to {}", toEmail, ex);
            throw new IllegalStateException("Unable to send email", ex);
        }
    }
}
