package es.tfm.records.tests.controller;

import es.tfm.records.application.dto.PublicSignatureVerificationDto;
import es.tfm.records.application.service.PublicSignatureVerificationService;
import es.tfm.records.application.service.SignatureService;
import es.tfm.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfm.records.entrypoints.controller.PublicSignatureVerificationController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublicSignatureVerificationController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class PublicSignatureVerificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SignatureService signatureService;

    @MockitoBean
    private PublicSignatureVerificationService publicSignatureVerificationService;

    @Test
    void verifyFile_shouldReturnValidResult() throws Exception {
        when(signatureService.verifySignature("pdf".getBytes())).thenReturn(true);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/public/signatures/verify-file")
                        .file("file", "pdf".getBytes()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true));
    }

    @Test
    void verifyByCsv_shouldReturnDetails() throws Exception {
        when(publicSignatureVerificationService.verifyByCsv("ABC123")).thenReturn(
                new PublicSignatureVerificationDto(true, "ok", "ABC123", UUID.randomUUID(), UUID.randomUUID(), Instant.now(), "deadbeef")
        );

        mockMvc.perform(get("/public/signatures/verify-csv/{csvCode}", "ABC123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.csvCode").value("ABC123"));
    }
}
