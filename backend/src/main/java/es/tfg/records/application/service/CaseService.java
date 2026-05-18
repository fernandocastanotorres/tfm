package es.tfg.records.application.service;

import es.tfg.records.application.dto.*;
import org.springframework.core.io.Resource;

import java.util.Map;
import java.util.UUID;

/**
 * Application service port for case (expediente) management operations.
 */
public interface CaseService {

    PagedResponse<CaseItem> listCases(UUID ownerId, int page, int size, String sort);

    CaseDetail getCaseDetail(UUID caseId, UUID ownerId);

    CaseStatusResponse getCaseStatus(UUID caseId, UUID ownerId);

    CaseItem createCase(UUID ownerId, CreateCaseRequest request);

    CaseStatusResponse submitCase(UUID caseId, UUID ownerId);

    CaseStatusResponse requestAmendment(UUID caseId, UUID ownerId, CreateCaseRequest request);

    CaseStatusResponse updateCaseStatus(UUID caseId, UUID ownerId, String newStatus);

    Resource downloadReceipt(UUID caseId, UUID ownerId);

    CaseStatusResponse updateDraft(UUID caseId, UUID ownerId, CreateCaseRequest request);
}
