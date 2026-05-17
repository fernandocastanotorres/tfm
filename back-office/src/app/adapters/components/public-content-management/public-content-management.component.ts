import { Component, OnInit, inject } from '@angular/core';
import {
  PublicCalendarEntry,
  PublicCalendarUpsertRequest,
  PublicFaqCategoryEntry,
  PublicFaqCategoryUpsertRequest,
  PublicFaqEntry,
  PublicFaqUpsertRequest,
  PublicInstitutionalEntry,
  PublicInstitutionalUpsertRequest,
  PublicLegislationEntry,
  PublicLegislationUpsertRequest,
  PublicOrganismEntry,
  PublicOrganismUpsertRequest,
  PublicResourceEntry,
  PublicResourceUpsertRequest,
  ThemeColor,
  ThemeCatalog,
  ThemeVariant
} from '../../../application/models/backoffice.models';
import { PublicContentManagementService } from '../../../application/services/public-content-management.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

type ContentTab = 'legislation' | 'faq' | 'calendar' | 'institutional' | 'organisms' | 'resources' | 'theme';

@Component({
  selector: 'bo-public-content-management',
  templateUrl: './public-content-management.component.html',
  styleUrls: ['./public-content-management.component.css']
})
export class PublicContentManagementComponent implements OnInit {
  private readonly service = inject(PublicContentManagementService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly supportedLocales = ['es-ES', 'ca-ES', 'eu-ES', 'gl-ES', 'va-ES'];
  readonly tabs: { value: ContentTab; label: string }[] = [
    { value: 'legislation', label: 'Normativa' },
    { value: 'faq', label: 'FAQ' },
    { value: 'calendar', label: 'Plazos y Eventos' },
    { value: 'institutional', label: 'Informacion' },
    { value: 'organisms', label: 'Organismos' },
    { value: 'resources', label: 'Recursos' },
    { value: 'theme', label: 'Tema sede' }
  ];

  activeTab: ContentTab = 'legislation';
  isLoading = true;
  isSaving = false;

  legislation: PublicLegislationEntry[] = [];
  faqCategories: PublicFaqCategoryEntry[] = [];
  faqEntries: PublicFaqEntry[] = [];
  organismCategories: PublicFaqCategoryEntry[] = [];
  calendarEntries: PublicCalendarEntry[] = [];
  institutionalEntries: PublicInstitutionalEntry[] = [];
  organismEntries: PublicOrganismEntry[] = [];
  resourceEntries: PublicResourceEntry[] = [];
  themePalette: ThemeCatalog = { themes: [], activeThemeId: null, updatedAt: null };
  themeForm: ThemeColor[] = this.createThemeForm();
  themeValidationError = '';
  selectedThemePreset = '';
  activeThemeId = 'institucional-azul';
  themeVariants: ThemeVariant[] = [];
  currentThemeId = 'institucional-azul';
  currentThemeName = 'Institucional Azul';

  selectedLegislation: PublicLegislationEntry | null = null;
  selectedFaqCategory: PublicFaqCategoryEntry | null = null;
  selectedFaqEntry: PublicFaqEntry | null = null;
  selectedCalendarEntry: PublicCalendarEntry | null = null;
  selectedInstitutionalEntry: PublicInstitutionalEntry | null = null;
  selectedOrganismEntry: PublicOrganismEntry | null = null;
  selectedResourceEntry: PublicResourceEntry | null = null;

  legislationForm = this.createLegislationForm();
  faqCategoryForm = this.createFaqCategoryForm();
  faqForm = this.createFaqForm();
  calendarForm = this.createCalendarForm();
  institutionalForm = this.createInstitutionalForm();
  organismForm = this.createOrganismForm();
  resourceForm = this.createResourceForm();

  legislationLocale = 'es-ES';
  faqCategoryLocale = 'es-ES';
  faqLocale = 'es-ES';
  calendarLocale = 'es-ES';
  institutionalLocale = 'es-ES';
  organismLocale = 'es-ES';
  resourceLocale = 'es-ES';

  private legislationTranslations: Record<string, PublicLegislationUpsertRequest> = {};
  private faqCategoryTranslations: Record<string, PublicFaqCategoryUpsertRequest> = {};
  private faqTranslations: Record<string, PublicFaqUpsertRequest> = {};
  private calendarTranslations: Record<string, PublicCalendarUpsertRequest> = {};
  private institutionalTranslations: Record<string, PublicInstitutionalUpsertRequest> = {};
  private organismTranslations: Record<string, PublicOrganismUpsertRequest> = {};
  private resourceTranslations: Record<string, PublicResourceUpsertRequest> = {};
  readonly themePresets: { name: string; colors: ThemeColor[] }[] = [
    {
      name: 'Institucional Azul',
      colors: [
        { token: '--sede-color-primary', value: '#2563eb' },
        { token: '--sede-color-primary-hover', value: '#1d4ed8' },
        { token: '--sede-color-primary-contrast', value: '#ffffff' },
        { token: '--sede-color-link', value: '#0ea5e9' },
        { token: '--sede-color-bg', value: '#f8fafc' },
        { token: '--sede-color-surface', value: '#ffffff' },
        { token: '--sede-color-text', value: '#0f172a' },
        { token: '--sede-color-muted', value: '#475569' }
      ]
    },
    {
      name: 'Verde Administrativo',
      colors: [
        { token: '--sede-color-primary', value: '#0f766e' },
        { token: '--sede-color-primary-hover', value: '#115e59' },
        { token: '--sede-color-primary-contrast', value: '#ffffff' },
        { token: '--sede-color-link', value: '#0d9488' },
        { token: '--sede-color-bg', value: '#f5fffa' },
        { token: '--sede-color-surface', value: '#ffffff' },
        { token: '--sede-color-text', value: '#0f172a' },
        { token: '--sede-color-muted', value: '#4b5563' }
      ]
    },
    {
      name: 'Granate Oficial',
      colors: [
        { token: '--sede-color-primary', value: '#9f1239' },
        { token: '--sede-color-primary-hover', value: '#881337' },
        { token: '--sede-color-primary-contrast', value: '#ffffff' },
        { token: '--sede-color-link', value: '#be123c' },
        { token: '--sede-color-bg', value: '#fff7f9' },
        { token: '--sede-color-surface', value: '#ffffff' },
        { token: '--sede-color-text', value: '#111827' },
        { token: '--sede-color-muted', value: '#4b5563' }
      ]
    }
  ];

  ngOnInit(): void {
    this.reload();
    this.newLegislation();
    this.newFaqCategory();
    this.newFaq();
    this.newCalendar();
    this.newInstitutional();
    this.newOrganism();
    this.newResource();
  }

  selectTab(tab: ContentTab): void { this.activeTab = tab; }

  reload(): void {
    this.isLoading = true;
    Promise.all([
      this.service.listLegislation().toPromise(),
      this.service.listFaqCategories().toPromise(),
      this.service.listFaqEntries().toPromise(),
      this.service.listCalendarEntries().toPromise(),
      this.service.listInstitutional().toPromise(),
      this.service.listOrganismCategories().toPromise(),
      this.service.listOrganisms().toPromise(),
      this.service.listResources().toPromise(),
      this.service.getThemePalette().toPromise()
    ]).then(([legislation, categories, faqs, calendar, institutional, organismCategories, organisms, resources, themePalette]) => {
      this.legislation = legislation ?? [];
      this.faqCategories = categories ?? [];
      this.faqEntries = faqs ?? [];
      this.calendarEntries = calendar ?? [];
      this.institutionalEntries = institutional ?? [];
      this.organismCategories = organismCategories ?? [];
      this.organismEntries = organisms ?? [];
      this.resourceEntries = resources ?? [];
      this.themePalette = themePalette ?? { themes: [], activeThemeId: null, updatedAt: null };
      this.themeVariants = this.themePalette.themes.length > 0
        ? this.themePalette.themes.map((theme) => ({ ...theme, colors: theme.colors.map((color) => ({ ...color })) }))
        : this.defaultThemeVariants();
      this.activeThemeId = this.themePalette.activeThemeId || this.themeVariants[0]?.id || 'institucional-azul';
      this.selectThemeVariant(this.activeThemeId);
      this.themeValidationError = '';
      this.isLoading = false;
    }).catch(() => { this.isLoading = false; });
  }

  editLegislation(item: PublicLegislationEntry): void {
    this.selectedLegislation = item;
    this.service.listLegislationTranslations(item.id).subscribe((items) => {
      this.legislationTranslations = this.emptyMap(() => this.createLegislationForm());
      for (const entry of items) this.legislationTranslations[entry.locale] = this.toLegislationForm(entry);
      this.switchLegislationLocale('es-ES');
    });
  }
  newLegislation(): void { this.selectedLegislation = null; this.legislationTranslations = this.emptyMap(() => this.createLegislationForm()); this.switchLegislationLocale('es-ES'); }
  switchLegislationLocale(locale: string): void { this.legislationTranslations[this.legislationLocale] = { ...this.legislationForm }; this.legislationLocale = locale; this.legislationForm = { ...(this.legislationTranslations[locale] ?? this.createLegislationForm()), locale }; }
  async saveLegislation(): Promise<void> { await this.saveWithConfirm('Guardar normativa', 'Se guardaran los cambios de normativa publica.', () => this.selectedLegislation ? this.service.updateLegislation(this.selectedLegislation.id, this.legislationForm) : this.service.createLegislation(this.legislationForm), 'legislation'); }
  async deleteLegislation(item: PublicLegislationEntry): Promise<void> { await this.deleteWithConfirm('Eliminar normativa', 'Esta accion eliminara la normativa seleccionada.', () => this.service.deleteLegislation(item.id)); }

  editFaqCategory(item: PublicFaqCategoryEntry): void {
    this.selectedFaqCategory = item;
    this.service.listFaqCategoryTranslations(item.id).subscribe((items) => {
      this.faqCategoryTranslations = this.emptyMap(() => this.createFaqCategoryForm());
      for (const entry of items) this.faqCategoryTranslations[entry.locale] = this.toFaqCategoryForm(entry);
      this.switchFaqCategoryLocale('es-ES');
    });
  }
  newFaqCategory(): void { this.selectedFaqCategory = null; this.faqCategoryTranslations = this.emptyMap(() => this.createFaqCategoryForm()); this.switchFaqCategoryLocale('es-ES'); }
  switchFaqCategoryLocale(locale: string): void { this.faqCategoryTranslations[this.faqCategoryLocale] = { ...this.faqCategoryForm }; this.faqCategoryLocale = locale; this.faqCategoryForm = { ...(this.faqCategoryTranslations[locale] ?? this.createFaqCategoryForm()), locale }; }
  async saveFaqCategory(): Promise<void> { await this.saveWithConfirm('Guardar categoria FAQ', 'Se guardaran los cambios de categoria FAQ.', () => this.selectedFaqCategory ? this.service.updateFaqCategory(this.selectedFaqCategory.id, this.faqCategoryForm) : this.service.createFaqCategory(this.faqCategoryForm), 'faq'); }
  async deleteFaqCategory(item: PublicFaqCategoryEntry): Promise<void> { await this.deleteWithConfirm('Eliminar categoria FAQ', 'Esta accion eliminara la categoria seleccionada.', () => this.service.deleteFaqCategory(item.id)); }

  editFaq(item: PublicFaqEntry): void {
    this.selectedFaqEntry = item;
    this.service.listFaqTranslations(item.id).subscribe((items) => {
      this.faqTranslations = this.emptyMap(() => this.createFaqForm());
      for (const entry of items) this.faqTranslations[entry.locale] = this.toFaqForm(entry);
      this.switchFaqLocale('es-ES');
    });
  }
  newFaq(): void { this.selectedFaqEntry = null; this.faqTranslations = this.emptyMap(() => this.createFaqForm()); this.switchFaqLocale('es-ES'); }
  switchFaqLocale(locale: string): void { this.faqTranslations[this.faqLocale] = { ...this.faqForm }; this.faqLocale = locale; this.faqForm = { ...(this.faqTranslations[locale] ?? this.createFaqForm()), locale }; }
  async saveFaq(): Promise<void> { await this.saveWithConfirm('Guardar FAQ', 'Se guardaran los cambios de la entrada FAQ.', () => this.selectedFaqEntry ? this.service.updateFaqEntry(this.selectedFaqEntry.id, this.faqForm) : this.service.createFaqEntry(this.faqForm), 'faq'); }
  async deleteFaq(item: PublicFaqEntry): Promise<void> { await this.deleteWithConfirm('Eliminar FAQ', 'Esta accion eliminara la FAQ seleccionada.', () => this.service.deleteFaqEntry(item.id)); }

  editCalendar(item: PublicCalendarEntry): void {
    this.selectedCalendarEntry = item;
    this.service.listCalendarTranslations(item.id).subscribe((items) => {
      this.calendarTranslations = this.emptyMap(() => this.createCalendarForm());
      for (const entry of items) this.calendarTranslations[entry.locale] = this.toCalendarForm(entry);
      this.switchCalendarLocale('es-ES');
    });
  }
  newCalendar(): void { this.selectedCalendarEntry = null; this.calendarTranslations = this.emptyMap(() => this.createCalendarForm()); this.switchCalendarLocale('es-ES'); }
  switchCalendarLocale(locale: string): void { this.calendarTranslations[this.calendarLocale] = { ...this.calendarForm }; this.calendarLocale = locale; this.calendarForm = { ...(this.calendarTranslations[locale] ?? this.createCalendarForm()), locale }; }
  async saveCalendar(): Promise<void> { await this.saveWithConfirm('Guardar evento', 'Se guardaran los cambios del plazo o evento.', () => this.selectedCalendarEntry ? this.service.updateCalendarEntry(this.selectedCalendarEntry.id, this.calendarForm) : this.service.createCalendarEntry(this.calendarForm), 'calendar'); }
  async deleteCalendar(item: PublicCalendarEntry): Promise<void> { await this.deleteWithConfirm('Eliminar evento', 'Esta accion eliminara el plazo o evento seleccionado.', () => this.service.deleteCalendarEntry(item.id)); }

  editInstitutional(item: PublicInstitutionalEntry): void {
    this.selectedInstitutionalEntry = item;
    this.service.listInstitutionalTranslations(item.id).subscribe((items) => {
      this.institutionalTranslations = this.emptyMap(() => this.createInstitutionalForm());
      for (const entry of items) this.institutionalTranslations[entry.locale] = this.toInstitutionalForm(entry);
      this.switchInstitutionalLocale('es-ES');
    });
  }
  newInstitutional(): void { this.selectedInstitutionalEntry = null; this.institutionalTranslations = this.emptyMap(() => this.createInstitutionalForm()); this.switchInstitutionalLocale('es-ES'); }
  switchInstitutionalLocale(locale: string): void { this.institutionalTranslations[this.institutionalLocale] = { ...this.institutionalForm }; this.institutionalLocale = locale; this.institutionalForm = { ...(this.institutionalTranslations[locale] ?? this.createInstitutionalForm()), locale }; }
  async saveInstitutional(): Promise<void> { await this.saveWithConfirm('Guardar informacion', 'Se guardaran los cambios de informacion institucional.', () => this.selectedInstitutionalEntry ? this.service.updateInstitutional(this.selectedInstitutionalEntry.id, this.institutionalForm) : this.service.createInstitutional(this.institutionalForm), 'institutional'); }
  async deleteInstitutional(item: PublicInstitutionalEntry): Promise<void> { await this.deleteWithConfirm('Eliminar informacion', 'Esta accion eliminara la seccion institucional seleccionada.', () => this.service.deleteInstitutional(item.id)); }

  editOrganism(item: PublicOrganismEntry): void {
    this.selectedOrganismEntry = item;
    this.service.listOrganismTranslations(item.id).subscribe((items) => {
      this.organismTranslations = this.emptyMap(() => this.createOrganismForm());
      for (const entry of items) this.organismTranslations[entry.locale] = this.toOrganismForm(entry);
      this.switchOrganismLocale('es-ES');
    });
  }
  newOrganism(): void { this.selectedOrganismEntry = null; this.organismTranslations = this.emptyMap(() => this.createOrganismForm()); this.switchOrganismLocale('es-ES'); }
  switchOrganismLocale(locale: string): void { this.organismTranslations[this.organismLocale] = { ...this.organismForm }; this.organismLocale = locale; this.organismForm = { ...(this.organismTranslations[locale] ?? this.createOrganismForm()), locale }; }
  async saveOrganism(): Promise<void> { await this.saveWithConfirm('Guardar organismo', 'Se guardaran los cambios del organismo.', () => this.selectedOrganismEntry ? this.service.updateOrganism(this.selectedOrganismEntry.id, this.organismForm) : this.service.createOrganism(this.organismForm), 'organisms'); }
  async deleteOrganism(item: PublicOrganismEntry): Promise<void> { await this.deleteWithConfirm('Eliminar organismo', 'Esta accion eliminara el organismo seleccionado.', () => this.service.deleteOrganism(item.id)); }

  editResource(item: PublicResourceEntry): void {
    this.selectedResourceEntry = item;
    this.service.listResourceTranslations(item.id).subscribe((items) => {
      this.resourceTranslations = this.emptyMap(() => this.createResourceForm());
      for (const entry of items) this.resourceTranslations[entry.locale] = this.toResourceForm(entry);
      this.switchResourceLocale('es-ES');
    });
  }
  newResource(): void { this.selectedResourceEntry = null; this.resourceTranslations = this.emptyMap(() => this.createResourceForm()); this.switchResourceLocale('es-ES'); }
  switchResourceLocale(locale: string): void { this.resourceTranslations[this.resourceLocale] = { ...this.resourceForm }; this.resourceLocale = locale; this.resourceForm = { ...(this.resourceTranslations[locale] ?? this.createResourceForm()), locale }; }
  async saveResource(): Promise<void> { await this.saveWithConfirm('Guardar recurso', 'Se guardaran los cambios del recurso publico.', () => this.selectedResourceEntry ? this.service.updateResource(this.selectedResourceEntry.id, this.resourceForm) : this.service.createResource(this.resourceForm), 'resources'); }
  async deleteResource(item: PublicResourceEntry): Promise<void> { await this.deleteWithConfirm('Eliminar recurso', 'Esta accion eliminara el recurso seleccionado.', () => this.service.deleteResource(item.id)); }

  applyThemePreset(): void {
    const preset = this.themePresets.find((item) => item.name === this.selectedThemePreset);
    if (!preset) {
      return;
    }
    this.themeForm = preset.colors.map((color) => ({ ...color }));
    this.themeValidationError = '';
  }

  applyPresetAsNewTheme(): void {
    const preset = this.themePresets.find((item) => item.name === this.selectedThemePreset);
    if (!preset) {
      return;
    }

    const suffix = this.themeVariants.length + 1;
    const baseId = this.normalizeThemeId(preset.name, suffix - 1);
    const nextId = this.themeVariants.some((theme) => theme.id === baseId) ? `${baseId}-${suffix}` : baseId;
    const variant: ThemeVariant = {
      id: nextId,
      name: `${preset.name} ${suffix}`,
      colors: preset.colors.map((color) => ({ ...color })),
      active: false
    };

    this.themeVariants = [...this.themeVariants, variant];
    this.selectThemeVariant(variant.id);
  }

  selectThemeVariant(themeId: string): void {
    const theme = this.themeVariants.find((item) => item.id === themeId);
    if (!theme) {
      return;
    }
    this.currentThemeId = theme.id;
    this.currentThemeName = theme.name;
    this.themeForm = theme.colors.map((color) => ({ ...color }));
    this.themeValidationError = '';
  }

  createThemeVariant(): void {
    const nextId = `tema-${this.themeVariants.length + 1}`;
    const name = `Tema ${this.themeVariants.length + 1}`;
    const variant: ThemeVariant = {
      id: nextId,
      name,
      colors: this.createThemeForm(),
      active: false
    };
    this.themeVariants = [...this.themeVariants, variant];
    this.selectThemeVariant(nextId);
  }

  duplicateCurrentThemeVariant(): void {
    const current = this.themeVariants.find((theme) => theme.id === this.currentThemeId);
    if (!current) {
      return;
    }

    const suffix = this.themeVariants.length + 1;
    const duplicated: ThemeVariant = {
      id: `${current.id}-copy-${suffix}`,
      name: `${current.name} (copia)`,
      colors: current.colors.map((color) => ({ ...color })),
      active: false
    };

    this.themeVariants = [...this.themeVariants, duplicated];
    this.selectThemeVariant(duplicated.id);
  }

  removeCurrentThemeVariant(): void {
    if (this.themeVariants.length <= 1) {
      return;
    }
    this.themeVariants = this.themeVariants.filter((theme) => theme.id !== this.currentThemeId);
    if (this.activeThemeId === this.currentThemeId) {
      this.activeThemeId = this.themeVariants[0].id;
    }
    this.selectThemeVariant(this.themeVariants[0].id);
  }

  resetCurrentThemeToDefaults(): void {
    this.themeForm = this.createThemeForm();
    this.themeValidationError = '';
  }

  exportThemesAsJson(): void {
    const payload = {
      activeThemeId: this.activeThemeId,
      themes: this.themeVariants
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sede-theme-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  importThemesFromJson(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result ?? '{}')) as {
          activeThemeId?: string;
          themes?: ThemeVariant[];
        };

        if (!raw.themes || !Array.isArray(raw.themes) || raw.themes.length === 0) {
          this.themeValidationError = 'El JSON no contiene temas validos.';
          return;
        }

        this.themeVariants = raw.themes.map((theme) => ({
          id: String(theme.id ?? '').trim(),
          name: String(theme.name ?? '').trim() || 'Tema importado',
          colors: Array.isArray(theme.colors)
            ? theme.colors
                .filter((color) => color && typeof color.token === 'string' && typeof color.value === 'string')
                .map((color) => ({ token: color.token.trim(), value: color.value.trim() }))
            : [],
          active: false
        }));

        this.activeThemeId = String(raw.activeThemeId ?? this.themeVariants[0]?.id ?? '').trim();
        this.selectThemeVariant(this.activeThemeId || this.themeVariants[0].id);
        this.themeValidationError = this.validateThemePalette();
      } catch {
        this.themeValidationError = 'No se pudo importar el archivo JSON.';
      } finally {
        input.value = '';
      }
    };
    reader.readAsText(file);
  }

  updateCurrentThemeMeta(field: 'id' | 'name', value: string): void {
    this.themeVariants = this.themeVariants.map((theme) => {
      if (theme.id !== this.currentThemeId) {
        return theme;
      }
      if (field === 'id') {
        this.currentThemeId = value;
        return { ...theme, id: value.trim() || theme.id };
      }
      this.currentThemeName = value;
      return { ...theme, name: value.trim() || theme.name };
    });
  }

  async saveThemePalette(): Promise<void> {
    this.themeVariants = this.themeVariants.map((theme) => {
      if (theme.id !== this.currentThemeId) {
        return theme;
      }
      return { ...theme, name: this.currentThemeName.trim() || theme.name, id: this.currentThemeId.trim() || theme.id, colors: this.themeForm.map((color) => ({ ...color })) };
    });

    this.themeValidationError = this.validateThemePalette();
    if (this.themeValidationError) {
      return;
    }

    const confirmed = await this.confirmDialog.confirm('Guardar tema de la sede', 'Se aplicaran los nuevos colores en la sede publica.', 'Guardar');
    if (!confirmed) return;
    this.isSaving = true;
    this.service.saveThemePalette({ themes: this.themeVariants, activeThemeId: this.activeThemeId }).subscribe({ next: () => this.afterSave('theme'), error: () => this.isSaving = false });
  }

  get themePreviewStyle(): Record<string, string> {
    return this.themeForm.reduce<Record<string, string>>((acc, color) => {
      if (color.token && color.value) {
        acc[color.token] = color.value;
      }
      return acc;
    }, {});
  }

  get currentThemeColors(): ThemeColor[] {
    const theme = this.themeVariants.find((item) => item.id === this.currentThemeId) ?? this.themeVariants[0];
    return theme?.colors ?? [];
  }

  private async saveWithConfirm(title: string, message: string, requestFactory: () => any, tab: ContentTab): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(title, message, 'Guardar');
    if (!confirmed) return;
    this.isSaving = true;
    requestFactory().subscribe({ next: () => this.afterSave(tab), error: () => this.isSaving = false });
  }

  private async deleteWithConfirm(title: string, message: string, requestFactory: () => any): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(title, message, 'Eliminar');
    if (!confirmed) return;
    requestFactory().subscribe({ next: () => this.reload() });
  }

  private afterSave(tab: ContentTab): void { this.isSaving = false; this.activeTab = tab; this.reload(); }

  private createLegislationForm(): PublicLegislationUpsertRequest { return { locale: 'es-ES', type: 'law', title: '', description: '', publicationDate: '', externalUrl: '', downloadUrl: '', sortOrder: 0, published: true }; }
  private createFaqCategoryForm(): PublicFaqCategoryUpsertRequest { return { locale: 'es-ES', categoryCode: '', categoryName: '', sortOrder: 0, published: true }; }
  private createFaqForm(): PublicFaqUpsertRequest { return { locale: 'es-ES', categoryCode: '', question: '', answer: '', sortOrder: 0, published: true }; }
  private createCalendarForm(): PublicCalendarUpsertRequest { return { locale: 'es-ES', type: 'deadline', title: '', description: '', eventDate: '', relatedProcedure: '', sortOrder: 0, published: true }; }
  private createInstitutionalForm(): PublicInstitutionalUpsertRequest { return { locale: 'es-ES', sectionCode: '', title: '', content: '', icon: '', sortOrder: 0, published: true }; }
  private createOrganismForm(): PublicOrganismUpsertRequest { return { locale: 'es-ES', categoryCode: '', name: '', description: '', phone: '', email: '', address: '', websiteUrl: '', sortOrder: 0, published: true }; }
  private createResourceForm(): PublicResourceUpsertRequest { return { locale: 'es-ES', resourceType: 'glossary', title: '', description: '', content: '', externalUrl: '', sortOrder: 0, published: true }; }
  private createThemeForm(): ThemeColor[] {
    return [
      { token: '--sede-color-primary', value: '#2563eb' },
      { token: '--sede-color-primary-hover', value: '#1d4ed8' },
      { token: '--sede-color-primary-contrast', value: '#ffffff' },
      { token: '--sede-color-link', value: '#0ea5e9' },
      { token: '--sede-color-bg', value: '#f8fafc' },
      { token: '--sede-color-surface', value: '#ffffff' },
      { token: '--sede-color-text', value: '#0f172a' },
      { token: '--sede-color-muted', value: '#475569' }
    ];
  }

  private defaultThemeVariants(): ThemeVariant[] {
    return this.themePresets.map((preset, index) => ({
      id: this.normalizeThemeId(preset.name, index),
      name: preset.name,
      colors: preset.colors.map((color) => ({ ...color })),
      active: index === 0
    }));
  }

  private normalizeThemeId(name: string, index: number): string {
    const normalized = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return normalized || `tema-${index + 1}`;
  }

  private emptyMap<T>(factory: () => T): Record<string, T> {
    return this.supportedLocales.reduce<Record<string, T>>((acc, locale) => {
      acc[locale] = factory();
      return acc;
    }, {});
  }

  private toLegislationForm(entry: PublicLegislationEntry): PublicLegislationUpsertRequest { return { locale: entry.locale, type: entry.type, title: entry.title, description: entry.description, publicationDate: entry.publicationDate, externalUrl: entry.externalUrl, downloadUrl: entry.downloadUrl, sortOrder: entry.sortOrder, published: entry.published }; }
  private toFaqCategoryForm(entry: PublicFaqCategoryEntry): PublicFaqCategoryUpsertRequest { return { locale: entry.locale, categoryCode: entry.categoryCode, categoryName: entry.categoryName, sortOrder: entry.sortOrder, published: entry.published }; }
  private toFaqForm(entry: PublicFaqEntry): PublicFaqUpsertRequest { return { locale: entry.locale, categoryCode: entry.categoryCode, question: entry.question, answer: entry.answer, sortOrder: entry.sortOrder, published: entry.published }; }
  private toCalendarForm(entry: PublicCalendarEntry): PublicCalendarUpsertRequest { return { locale: entry.locale, type: entry.type, title: entry.title, description: entry.description, eventDate: entry.eventDate, relatedProcedure: entry.relatedProcedure, sortOrder: entry.sortOrder, published: entry.published }; }
  private toInstitutionalForm(entry: PublicInstitutionalEntry): PublicInstitutionalUpsertRequest { return { locale: entry.locale, sectionCode: entry.sectionCode, title: entry.title, content: entry.content, icon: entry.icon, sortOrder: entry.sortOrder, published: entry.published }; }
  private toOrganismForm(entry: PublicOrganismEntry): PublicOrganismUpsertRequest { return { locale: entry.locale, categoryCode: entry.categoryCode, name: entry.name, description: entry.description, phone: entry.phone, email: entry.email, address: entry.address, websiteUrl: entry.websiteUrl, sortOrder: entry.sortOrder, published: entry.published }; }
  private toResourceForm(entry: PublicResourceEntry): PublicResourceUpsertRequest { return { locale: entry.locale, resourceType: entry.resourceType, title: entry.title, description: entry.description, content: entry.content, externalUrl: entry.externalUrl, sortOrder: entry.sortOrder, published: entry.published }; }

  localeStatusFor(tab: ContentTab, locale: string): 'translated' | 'pending' {
    const form = this.formByTabAndLocale(tab, locale);
    if (!form) return 'pending';
    switch (tab) {
      case 'legislation': return this.hasValue(form.title) && this.hasValue(form.description) ? 'translated' : 'pending';
      case 'faq':
        if (this.selectedFaqCategory) return this.hasValue(form.categoryName) ? 'translated' : 'pending';
        return this.hasValue(form.question) && this.hasValue(form.answer) ? 'translated' : 'pending';
      case 'calendar': return this.hasValue(form.title) && this.hasValue(form.description) ? 'translated' : 'pending';
      case 'institutional': return this.hasValue(form.title) && this.hasValue(form.content) ? 'translated' : 'pending';
      case 'organisms': return this.hasValue(form.name) && this.hasValue(form.description) ? 'translated' : 'pending';
      case 'resources': return this.hasValue(form.title) && this.hasValue(form.description) ? 'translated' : 'pending';
      default: return 'pending';
    }
  }

  private formByTabAndLocale(tab: ContentTab, locale: string): any {
    switch (tab) {
      case 'legislation': return this.legislationTranslations[locale];
      case 'faq': return this.selectedFaqCategory ? this.faqCategoryTranslations[locale] : this.faqTranslations[locale];
      case 'calendar': return this.calendarTranslations[locale];
      case 'institutional': return this.institutionalTranslations[locale];
      case 'organisms': return this.organismTranslations[locale];
      case 'resources': return this.resourceTranslations[locale];
      default: return null;
    }
  }

  private hasValue(value: string | null | undefined): boolean {
    return !!value && value.trim().length > 0;
  }

  private validateThemePalette(): string {
    if (!this.themeVariants.length) {
      return 'Debes definir al menos un tema.';
    }

    const ids = this.themeVariants.map((theme) => theme.id.trim()).filter((id) => id.length > 0);
    if (ids.length !== this.themeVariants.length) {
      return 'Todos los temas deben tener un ID valido.';
    }
    if (new Set(ids).size !== ids.length) {
      return 'Hay IDs de tema duplicados. Cada tema debe tener un ID unico.';
    }

    if (!this.activeThemeId || !this.themeVariants.some((theme) => theme.id === this.activeThemeId)) {
      return 'Debes seleccionar un tema activo valido.';
    }

    const tokenMap = new Map(this.themeForm.map((color) => [color.token, color.value]));
    const primary = tokenMap.get('--sede-color-primary') ?? '';
    const primaryContrast = tokenMap.get('--sede-color-primary-contrast') ?? '';
    const surface = tokenMap.get('--sede-color-surface') ?? '';
    const text = tokenMap.get('--sede-color-text') ?? '';
    const link = tokenMap.get('--sede-color-link') ?? '';
    const muted = tokenMap.get('--sede-color-muted') ?? '';

    if (!primary || !primaryContrast || !surface || !text) {
      return 'Faltan colores obligatorios: primary, primary-contrast, surface o text.';
    }

    const buttonContrast = this.contrastRatio(primary, primaryContrast);
    if (buttonContrast < 4.5) {
      return `Contraste insuficiente en boton primario (${buttonContrast.toFixed(2)}:1). Minimo recomendado 4.5:1.`;
    }

    const textContrast = this.contrastRatio(surface, text);
    if (textContrast < 4.5) {
      return `Contraste insuficiente entre texto y superficie (${textContrast.toFixed(2)}:1). Minimo recomendado 4.5:1.`;
    }

    if (link) {
      const linkContrast = this.contrastRatio(surface, link);
      if (linkContrast < 3) {
        return `Contraste insuficiente para enlaces (${linkContrast.toFixed(2)}:1). Minimo recomendado 3:1.`;
      }
    }

    if (muted) {
      const mutedContrast = this.contrastRatio(surface, muted);
      if (mutedContrast < 3) {
        return `Contraste insuficiente para texto secundario (${mutedContrast.toFixed(2)}:1). Minimo recomendado 3:1.`;
      }
    }

    return '';
  }

  private contrastRatio(hexA: string, hexB: string): number {
    const lumA = this.relativeLuminance(hexA);
    const lumB = this.relativeLuminance(hexB);
    const lighter = Math.max(lumA, lumB);
    const darker = Math.min(lumA, lumB);
    return (lighter + 0.05) / (darker + 0.05);
  }

  private relativeLuminance(hex: string): number {
    const [r, g, b] = this.hexToRgb(hex);
    const channels = [r, g, b].map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  private hexToRgb(hex: string): [number, number, number] {
    const normalized = hex.replace('#', '').trim();
    const safeHex = normalized.length === 3
      ? normalized.split('').map((char) => `${char}${char}`).join('')
      : normalized;
    const parsed = Number.parseInt(safeHex, 16);
    const r = (parsed >> 16) & 255;
    const g = (parsed >> 8) & 255;
    const b = parsed & 255;
    return [r, g, b];
  }
}
