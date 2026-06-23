package es.tfm.records.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactMessageRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 255)
        String fullName,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no es valido")
        String email,

        @NotBlank(message = "El asunto es obligatorio")
        @Size(max = 500)
        String subject,

        @NotBlank(message = "El mensaje es obligatorio")
        @Size(max = 5000)
        String message,

        @Size(max = 50)
        String category
) {
}
