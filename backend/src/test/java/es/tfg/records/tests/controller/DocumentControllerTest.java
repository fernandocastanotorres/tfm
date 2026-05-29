package es.tfg.records.tests.controller;

import es.tfg.records.application.dto.DocumentDetail;
import es.tfg.records.application.dto.DocumentItem;
import es.tfg.records.application.dto.DocumentVersionDto;
import es.tfg.records.application.service.DocumentService;
import es.tfg.records.application.service.DocumentDownloadVariant;
import es.tfg.records.entrypoints.advice.GlobalExceptionHandler;
import es.tfg.records.entrypoints.controller.DocumentController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DocumentController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DocumentService documentService;

    @Test
    void uploadDocument_shouldReturn201() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        DocumentItem item = new DocumentItem(UUID.randomUUID(), "test.pdf", "application/pdf", 100, 1, Instant.now(), "PENDING", true, false, caseId);
        when(documentService.uploadDocument(eq(caseId), eq(ownerId), any(MultipartFile.class))).thenReturn(item);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/citizen/procedures/{caseId}/documents", caseId)
                        .file("file", "hello".getBytes())
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("test.pdf"));
    }

    @Test
    void listDocuments_shouldReturn200() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        when(documentService.listDocumentsByCase(eq(caseId), eq(ownerId)))
                .thenReturn(List.of(new DocumentItem(UUID.randomUUID(), "a.pdf", "application/pdf", 1, 1, Instant.now(), "PENDING", true, false, caseId)));

        mockMvc.perform(get("/citizen/procedures/{caseId}/documents", caseId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("a.pdf"));
    }

    @Test
    void getDocument_shouldReturn200() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID caseId = UUID.randomUUID();
        UUID docId = UUID.randomUUID();
        DocumentDetail detail = new DocumentDetail(docId, "a.pdf", "application/pdf", 1, 1, Instant.now(), "PENDING", true, false, caseId, List.<DocumentVersionDto>of());
        when(documentService.getDocumentDetail(caseId, docId, ownerId)).thenReturn(detail);

        mockMvc.perform(get("/citizen/procedures/{procedureUuid}/documents/{docUuid}", caseId, docId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(docId.toString()));
    }

    @Test
    void deleteDocument_shouldReturn204() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID docId = UUID.randomUUID();
        doNothing().when(documentService).deleteDocument(docId, ownerId);

        mockMvc.perform(delete("/citizen/procedures/documents/{id}", docId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isNoContent());
    }

    @Test
    void downloadDocument_shouldReturnFileResponse() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID docId = UUID.randomUUID();
        ByteArrayResource resource = new ByteArrayResource("file-content".getBytes()) {
            @Override
            public String getFilename() {
                return "a.pdf";
            }
        };
        when(documentService.downloadDocument(docId, ownerId, DocumentDownloadVariant.CURRENT)).thenReturn(resource);

        mockMvc.perform(get("/citizen/procedures/documents/{id}/download", docId)
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"a.pdf\""))
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_OCTET_STREAM_VALUE));
    }

    @Test
    void downloadDocument_shouldUseCurrentVariantFromRequestParam() throws Exception {
        UUID ownerId = UUID.randomUUID();
        UUID docId = UUID.randomUUID();

        ByteArrayResource resource = new ByteArrayResource("pdf-content".getBytes()) {
            @Override
            public String getFilename() {
                return "Documento Resumen del Expediente.pdf";
            }
        };

        when(documentService.downloadDocument(docId, ownerId, DocumentDownloadVariant.CURRENT)).thenReturn(resource);

        mockMvc.perform(get("/citizen/procedures/documents/{id}/download", docId)
                        .param("variant", "CURRENT")
                        .principal(new TestingAuthenticationToken(ownerId.toString(), null)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=\"Documento Resumen del Expediente.pdf\""))
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_OCTET_STREAM_VALUE));

        verify(documentService).downloadDocument(docId, ownerId, DocumentDownloadVariant.CURRENT);
    }
}
