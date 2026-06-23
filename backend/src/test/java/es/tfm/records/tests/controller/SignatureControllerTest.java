package es.tfm.records.tests.controller;

import es.tfm.records.application.service.SignatureService;
import es.tfm.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfm.records.entrypoints.controller.SignatureController;
import es.tfm.records.infrastructure.audit.AuditService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SignatureController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class SignatureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SignatureService signatureService;

    @MockitoBean
    private AuditService auditService;

    @Test
    void signDocument_shouldReturn200() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());
        byte[] signedContent = "signed-pdf-content".getBytes();
        
        when(signatureService.signDocument(any())).thenReturn(signedContent);

        mockMvc.perform(multipart("/citizen/signatures/sign")
                        .file(file)
                        .principal(new TestingAuthenticationToken("user-id", null)))
                .andExpect(status().isOk())
                .andExpect(content().bytes(signedContent));
        
        verify(auditService).record(any(), any(), any(), anyString());
    }

    @Test
    void signDocument_shouldReturn500OnException() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());
        when(signatureService.signDocument(any())).thenThrow(new RuntimeException("Signing failed"));

        mockMvc.perform(multipart("/citizen/signatures/sign")
                        .file(file)
                        .principal(new TestingAuthenticationToken("user-id", null)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void computeDigest_shouldReturn200() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "content".getBytes());
        String digest = "a1b2c3d4e5f6";
        
        when(signatureService.computeDigest(any())).thenReturn(digest);

        mockMvc.perform(multipart("/citizen/signatures/digest")
                        .file(file)
                        .principal(new TestingAuthenticationToken("user-id", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.digest").value(digest))
                .andExpect(jsonPath("$.algorithm").value("SHA-256"));
    }

    @Test
    void verifySignature_shouldReturn200_WhenValid() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "signed.pdf", "application/pdf", "content".getBytes());
        when(signatureService.verifySignature(any())).thenReturn(true);

        mockMvc.perform(multipart("/citizen/signatures/verify")
                        .file(file)
                        .principal(new TestingAuthenticationToken("user-id", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true));
    }

    @Test
    void verifySignature_shouldReturn200_WhenInvalid() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "signed.pdf", "application/pdf", "content".getBytes());
        when(signatureService.verifySignature(any())).thenReturn(false);

        mockMvc.perform(multipart("/citizen/signatures/verify")
                        .file(file)
                        .principal(new TestingAuthenticationToken("user-id", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));
    }

    @Test
    void getCertificateInfo_shouldReturn200() throws Exception {
        String subject = "CN=TFG-Service, O=University";
        when(signatureService.getSigningCertificateSubject()).thenReturn(subject);

        mockMvc.perform(get("/citizen/signatures/certificate-info")
                        .principal(new TestingAuthenticationToken("user-id", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subject").value(subject))
                .andExpect(jsonPath("$.type").value("PAdES-BES"));
    }
}
