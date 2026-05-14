import { Injectable } from '@angular/core';

export interface CaseDraft {
  procedureId: string;
  payload: {
    form: Record<string, unknown>;
    uploads: Record<string, string[]>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CaseWizardService {
  saveDraft(draft: CaseDraft): void {
    localStorage.setItem('tfg.case.draft', JSON.stringify(draft));
  }

  loadDraft(): CaseDraft | null {
    const raw = localStorage.getItem('tfg.case.draft');
    return raw ? (JSON.parse(raw) as CaseDraft) : null;
  }

  clearDraft(): void {
    localStorage.removeItem('tfg.case.draft');
  }
}
