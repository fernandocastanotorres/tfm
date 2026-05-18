import { Component, Input, OnInit, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  FieldI18nEntry,
  FieldI18nGroup,
  FieldI18nUpsertRequest,
  FieldOptionEntry,
  ManagedProcedure
} from '../../../application/models/backoffice.models';
import { ProcedureManagementService } from '../../../application/services/procedure-management.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

@Component({
  selector: 'bo-field-i18n-management',
  templateUrl: './field-i18n-management.component.html',
  styleUrls: ['./field-i18n-management.component.css']
})
export class FieldI18nManagementComponent implements OnInit {
  private readonly procedureService = inject(ProcedureManagementService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  @Input() procedure: ManagedProcedure | null = null;

  readonly supportedLocales = ['es-ES', 'ca-ES', 'eu-ES', 'gl-ES', 'va-ES'];
  readonly localeLabels: Record<string, string> = {
    'es-ES': 'Espanol',
    'ca-ES': 'Catala',
    'eu-ES': 'Euskera',
    'gl-ES': 'Gallego',
    'va-ES': 'Valenciano'
  };

  groups: FieldI18nGroup[] = [];
  filteredGroups: FieldI18nGroup[] = [];
  selectedLocale = 'es-ES';
  isLoading = false;
  isSaving = false;
  showForm = false;
  loaded = false;

  // Editable map: key = `${taskOrderIndex}:${fieldId}:${locale}`, value = entry
  editMap = new Map<string, FieldI18nEntry>();

  ngOnInit(): void {
    // No auto-load — data is loaded on-demand when user clicks "Gestionar traducciones"
  }

  onProcedureChanged(procedure: ManagedProcedure | null): void {
    this.procedure = procedure;
    this.groups = [];
    this.loaded = false;
    this.showForm = false;
  }

  loadFieldTranslations(): void {
    if (!this.procedure) return;
    this.isLoading = true;
    this.editMap.clear();
    console.log('[FieldI18n] Loading for procedure:', this.procedure.id);
    this.procedureService.listFieldTranslations(this.procedure.id).subscribe({
      next: (groups) => {
        console.log('[FieldI18n] Received groups:', groups.length, JSON.stringify(groups).substring(0, 200));
        this.groups = groups;
        this.indexEntries(groups);
        this.applyLocaleFilter();
        this.isLoading = false;
        this.loaded = true;
      },
      error: (err) => {
        console.error('[FieldI18n] Error loading:', err);
        this.groups = [];
        this.filteredGroups = [];
        this.isLoading = false;
        this.loaded = true;
      }
    });
  }

  selectLocale(locale: string): void {
    this.selectedLocale = locale;
    this.applyLocaleFilter();
  }

  private applyLocaleFilter(): void {
    this.filteredGroups = this.groups.map(group => {
      const filteredFields = group.fields
        .filter(f => f.locale === this.selectedLocale)
        .map(f => this.editMap.get(this.entryKey(f)) || f);
      return { ...group, fields: filteredFields };
    });
  }

  getEntry(taskIndex: number, fieldId: string, locale: string): FieldI18nEntry | undefined {
    return this.editMap.get(`${taskIndex}:${fieldId}:${locale}`);
  }

  updateEntryName(taskIndex: number, fieldId: string, locale: string, value: string): void {
    const key = `${taskIndex}:${fieldId}:${locale}`;
    const existing = this.editMap.get(key);
    if (existing) {
      existing.name = value;
    }
  }

  updateEntryPlaceholder(taskIndex: number, fieldId: string, locale: string, value: string): void {
    const key = `${taskIndex}:${fieldId}:${locale}`;
    const existing = this.editMap.get(key);
    if (existing) {
      existing.placeholder = value;
    }
  }

  updateOptionLabel(taskIndex: number, fieldId: string, locale: string, optionValue: string, label: string): void {
    const key = `${taskIndex}:${fieldId}:${locale}`;
    const existing = this.editMap.get(key);
    if (existing && existing.options) {
      const opt = existing.options.find(o => o.value === optionValue);
      if (opt) {
        opt.label = label;
      }
    }
  }

  async save(): Promise<void> {
    if (!this.procedure) return;
    const confirmed = await this.confirmDialog.confirm(
      'Guardar traducciones de campos',
      'Se actualizaran las traducciones de todos los campos modificados para el locale seleccionado.',
      'Si, guardar'
    );
    if (!confirmed) return;
    this.isSaving = true;

    const requests = Array.from(this.editMap.values())
      .filter(entry => entry.name.trim() || entry.placeholder.trim())
      .map(entry => {
        const request: FieldI18nUpsertRequest = {
          taskOrderIndex: entry.taskOrderIndex,
          fieldId: entry.fieldId,
          locale: entry.locale,
          name: entry.name,
          placeholder: entry.placeholder,
          options: entry.options || []
        };
        return this.procedureService.upsertFieldTranslation(this.procedure!.id, request).pipe(
          catchError(() => of(null))
        );
      });

    if (requests.length === 0) {
      this.isSaving = false;
      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.isSaving = false;
        this.loadFieldTranslations();
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }

  close(): void {
    this.showForm = false;
  }

  open(): void {
    this.showForm = true;
    if (this.procedure && !this.loaded) {
      this.loadFieldTranslations();
    }
  }

  private indexEntries(groups: FieldI18nGroup[]): void {
    for (const group of groups) {
      for (const field of group.fields) {
        const key = this.entryKey(field);
        this.editMap.set(key, { ...field });
      }
    }
  }

  private entryKey(entry: FieldI18nEntry): string {
    return `${entry.taskOrderIndex}:${entry.fieldId}:${entry.locale}`;
  }
}
