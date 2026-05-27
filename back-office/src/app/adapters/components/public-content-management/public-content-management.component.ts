import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

const CSS = {
  PRIMARY: '--sede-color-primary',
  PRIMARY_HOVER: '--sede-color-primary-hover',
  PRIMARY_50: '--sede-color-primary-50',
  PRIMARY_CONTRAST: '--sede-color-primary-contrast',
  LINK: '--sede-color-link',
  BG: '--sede-color-bg',
  SURFACE: '--sede-color-surface',
  TEXT: '--sede-color-text',
  MUTED: '--sede-color-muted',
  BORDER: '--sede-color-border',
  HERO_BG: '--sede-color-hero-bg',
  HERO_TEXT: '--sede-color-hero-text',
  HERO_SUBTITLE: '--sede-color-hero-subtitle',
  CALENDAR_DATE_BG: '--sede-color-calendar-date-bg',
  CALENDAR_DATE_TEXT: '--sede-color-calendar-date-text',
  FOOTER_BG: '--sede-color-footer-bg',
  FOOTER_TEXT: '--sede-color-footer-text'
} as const;

const DEFAULT_THEME_ID = 'institucional-azul';
const FALLBACK_PRIMARY = '#2563eb';
const FALLBACK_PRIMARY_HOVER = '#1d4ed8';

@Component({
    selector: 'bo-public-content-management',
    templateUrl: './public-content-management.component.html',
    styleUrls: ['./public-content-management.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
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
  activeThemeId = DEFAULT_THEME_ID;
  themeVariants: ThemeVariant[] = [];
  currentThemeId = DEFAULT_THEME_ID;
  currentThemeName = 'Institucional Azul';
  themeMode: 'light' | 'dark' = 'light';
  themeModeVariantsList: { id: string; name: string }[] = [];
  currentThemeColorsList: ThemeColor[] = [];
  sectionsExpanded: Record<string, boolean> = { primary: true, surface: true, hero: false, calendar: false, footer: false };

  toggleSection(section: string): void {
    this.sectionsExpanded[section] = !this.sectionsExpanded[section];
  }

  async setActiveTheme(themeId: string): Promise<void> {
    const theme = this.themeModeVariantsList.find(t => t.id === themeId);
    const confirmed = await this.confirmDialog.confirm(
      'Activar tema',
      `Se aplicara el tema "${theme?.name ?? themeId}" como tema activo de la sede publica.`,
      'Activar'
    );
    if (!confirmed) return;

    this.activeThemeId = themeId;
    this.saveCurrentModeToVariants();
    this.isSaving = true;
    this.service.saveThemePalette({ themes: this.themeVariants, activeThemeId: this.activeThemeId }).subscribe({
      next: () => { this.isSaving = false; this.reload(); },
      error: () => { this.isSaving = false; }
    });
  }

  getThemeSwatchGradient(theme: { id: string; name: string }): string {
    const full = this.themeVariants.find(t => t.id === theme.id && t.mode === this.themeMode)
      ?? this.themeVariants.find(t => t.id === theme.id);
    if (!full) return '#e5e7eb';
    const primary = full.colors.find(c => c.token === CSS.PRIMARY)?.value ?? FALLBACK_PRIMARY;
    const primaryHover = full.colors.find(c => c.token === CSS.PRIMARY_HOVER)?.value ?? FALLBACK_PRIMARY_HOVER;
    return `linear-gradient(135deg, ${primary} 50%, ${primaryHover} 50%)`;
  }

  getPresetSwatchGradient(preset: { name: string; colors: ThemeColor[]; darkColors: ThemeColor[] }): string {
    const colors = this.themeMode === 'dark' ? preset.darkColors : preset.colors;
    const primary = colors.find(c => c.token === CSS.PRIMARY)?.value ?? FALLBACK_PRIMARY;
    const primaryHover = colors.find(c => c.token === CSS.PRIMARY_HOVER)?.value ?? FALLBACK_PRIMARY_HOVER;
    return `linear-gradient(135deg, ${primary} 50%, ${primaryHover} 50%)`;
  }

  private refreshThemeLists(): void {
    const seen = new Set<string>();
    this.themeModeVariantsList = this.themeVariants
      .filter((t) => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      })
      .map((t) => ({ id: t.id, name: t.name }));

    const theme = this.themeVariants.find((item) => item.id === this.currentThemeId && item.mode === this.themeMode)
      ?? this.themeVariants.find((item) => item.id === this.currentThemeId)
      ?? this.themeVariants.find((item) => item.mode === this.themeMode)
      ?? this.themeVariants[0];
    this.currentThemeColorsList = theme?.colors ?? [];
  }

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
  readonly themePresets: ReturnType<typeof PublicContentManagementComponent.createPreset>[] = [
    PublicContentManagementComponent.createPreset('Institucional Azul',
      { [CSS.PRIMARY]: '#2563eb', [CSS.PRIMARY_HOVER]: '#1d4ed8', [CSS.PRIMARY_50]: '#eff6ff', [CSS.PRIMARY_CONTRAST]: '#ffffff', [CSS.LINK]: '#0ea5e9', [CSS.BG]: '#f8fafc', [CSS.SURFACE]: '#ffffff', [CSS.TEXT]: '#0f172a', [CSS.MUTED]: '#475569', [CSS.BORDER]: '#e2e8f0', [CSS.HERO_BG]: '#0e2a47', [CSS.HERO_TEXT]: '#f8fafc', [CSS.HERO_SUBTITLE]: '#d9e2ec', [CSS.CALENDAR_DATE_BG]: 'rgba(14, 116, 144, 0.10)', [CSS.CALENDAR_DATE_TEXT]: '#0ea5e9', [CSS.FOOTER_BG]: '#0f172a', [CSS.FOOTER_TEXT]: '#cbd5e1' },
      { [CSS.PRIMARY]: '#3b82f6', [CSS.PRIMARY_HOVER]: '#60a5fa', [CSS.PRIMARY_50]: '#1e3a5f', [CSS.PRIMARY_CONTRAST]: '#ffffff', [CSS.LINK]: '#38bdf8', [CSS.BG]: '#0f172a', [CSS.SURFACE]: '#1e293b', [CSS.TEXT]: '#f1f5f9', [CSS.MUTED]: '#94a3b8', [CSS.BORDER]: '#334155', [CSS.HERO_BG]: '#0c1929', [CSS.HERO_TEXT]: '#f8fafc', [CSS.HERO_SUBTITLE]: '#94a3b8', [CSS.CALENDAR_DATE_BG]: 'rgba(59, 130, 246, 0.15)', [CSS.CALENDAR_DATE_TEXT]: '#60a5fa', [CSS.FOOTER_BG]: '#020617', [CSS.FOOTER_TEXT]: '#64748b' }
    ),
    PublicContentManagementComponent.createPreset('Verde Administrativo',
      { [CSS.PRIMARY]: '#0f766e', [CSS.PRIMARY_HOVER]: '#115e59', [CSS.PRIMARY_50]: '#f0fdfa', [CSS.PRIMARY_CONTRAST]: '#ffffff', [CSS.LINK]: '#0d9488', [CSS.BG]: '#f5fffa', [CSS.SURFACE]: '#ffffff', [CSS.TEXT]: '#0f172a', [CSS.MUTED]: '#4b5563', [CSS.BORDER]: '#e2e8f0', [CSS.HERO_BG]: '#064e3b', [CSS.HERO_TEXT]: '#f0fdf4', [CSS.HERO_SUBTITLE]: '#bbf7d0', [CSS.CALENDAR_DATE_BG]: 'rgba(15, 118, 110, 0.10)', [CSS.CALENDAR_DATE_TEXT]: '#0d9488', [CSS.FOOTER_BG]: '#064e3b', [CSS.FOOTER_TEXT]: '#a7f3d0' },
      { [CSS.PRIMARY]: '#2dd4bf', [CSS.PRIMARY_HOVER]: '#5eead4', [CSS.PRIMARY_50]: '#134e4a', [CSS.PRIMARY_CONTRAST]: '#042f2e', [CSS.LINK]: '#2dd4bf', [CSS.BG]: '#042f2e', [CSS.SURFACE]: '#134e4a', [CSS.TEXT]: '#f0fdfa', [CSS.MUTED]: '#5eead4', [CSS.BORDER]: '#1a5c56', [CSS.HERO_BG]: '#022c22', [CSS.HERO_TEXT]: '#f0fdf4', [CSS.HERO_SUBTITLE]: '#5eead4', [CSS.CALENDAR_DATE_BG]: 'rgba(45, 212, 191, 0.15)', [CSS.CALENDAR_DATE_TEXT]: '#2dd4bf', [CSS.FOOTER_BG]: '#022c22', [CSS.FOOTER_TEXT]: '#5eead4' }
    ),
    PublicContentManagementComponent.createPreset('Granate Oficial',
      { [CSS.PRIMARY]: '#9f1239', [CSS.PRIMARY_HOVER]: '#881337', [CSS.PRIMARY_50]: '#fff1f2', [CSS.PRIMARY_CONTRAST]: '#ffffff', [CSS.LINK]: '#be123c', [CSS.BG]: '#fff7f9', [CSS.SURFACE]: '#ffffff', [CSS.TEXT]: '#111827', [CSS.MUTED]: '#4b5563', [CSS.BORDER]: '#fce7e7', [CSS.HERO_BG]: '#4c0519', [CSS.HERO_TEXT]: '#fff1f2', [CSS.HERO_SUBTITLE]: '#fecdd3', [CSS.CALENDAR_DATE_BG]: 'rgba(159, 18, 57, 0.10)', [CSS.CALENDAR_DATE_TEXT]: '#be123c', [CSS.FOOTER_BG]: '#4c0519', [CSS.FOOTER_TEXT]: '#fda4af' },
      { [CSS.PRIMARY]: '#f43f5e', [CSS.PRIMARY_HOVER]: '#fb7185', [CSS.PRIMARY_50]: '#4c1025', [CSS.PRIMARY_CONTRAST]: '#ffffff', [CSS.LINK]: '#fb7185', [CSS.BG]: '#1a0a10', [CSS.SURFACE]: '#2d1019', [CSS.TEXT]: '#fff1f2', [CSS.MUTED]: '#fda4af', [CSS.BORDER]: '#4c1525', [CSS.HERO_BG]: '#120508', [CSS.HERO_TEXT]: '#fff1f2', [CSS.HERO_SUBTITLE]: '#fda4af', [CSS.CALENDAR_DATE_BG]: 'rgba(244, 63, 94, 0.15)', [CSS.CALENDAR_DATE_TEXT]: '#fb7185', [CSS.FOOTER_BG]: '#0a0305', [CSS.FOOTER_TEXT]: '#94a3b8' }
    )
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
    Promise.allSettled([
      this.service.listLegislation().toPromise(),
      this.service.listFaqCategories().toPromise(),
      this.service.listFaqEntries().toPromise(),
      this.service.listCalendarEntries().toPromise(),
      this.service.listInstitutional().toPromise(),
      this.service.listOrganismCategories().toPromise(),
      this.service.listOrganisms().toPromise(),
      this.service.listResources().toPromise(),
      this.service.getThemePalette().toPromise()
    ]).then((results) => {
      const legislation = results[0].status === 'fulfilled' ? (results[0].value as PublicLegislationEntry[]) : null;
      const categories = results[1].status === 'fulfilled' ? (results[1].value as PublicFaqCategoryEntry[]) : null;
      const faqs = results[2].status === 'fulfilled' ? (results[2].value as PublicFaqEntry[]) : null;
      const calendar = results[3].status === 'fulfilled' ? (results[3].value as PublicCalendarEntry[]) : null;
      const institutional = results[4].status === 'fulfilled' ? (results[4].value as PublicInstitutionalEntry[]) : null;
      const organismCategories = results[5].status === 'fulfilled' ? (results[5].value as PublicFaqCategoryEntry[]) : null;
      const organisms = results[6].status === 'fulfilled' ? (results[6].value as PublicOrganismEntry[]) : null;
      const resources = results[7].status === 'fulfilled' ? (results[7].value as PublicResourceEntry[]) : null;
      const themePalette = results[8].status === 'fulfilled' ? (results[8].value as ThemeCatalog) : null;

      if (results[8].status === 'rejected') {
        console.error('Theme palette load failed:', (results[8] as PromiseRejectedResult).reason);
      }

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
      this.activeThemeId = this.themePalette.activeThemeId || this.themeVariants[0]?.id || DEFAULT_THEME_ID;
      this.selectThemeVariant(this.activeThemeId);
      this.refreshThemeLists();
      this.themeValidationError = '';
      this.isLoading = false;
    }).catch((err) => {
      console.error('Reload failed:', err);
      this.isLoading = false;
    });
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
  switchLegislationLocale(locale: string): void {
    if (this.legislationLocale !== locale) {
      this.legislationTranslations[this.legislationLocale] = { ...this.legislationForm };
    }
    this.legislationLocale = locale;
    this.legislationForm = { ...(this.legislationTranslations[locale] ?? this.createLegislationForm()), locale };
  }

  syncLegislationCommon(field: 'type' | 'sortOrder' | 'published', value: any): void {
    for (const loc of this.supportedLocales) {
      if (this.legislationTranslations[loc]) {
        (this.legislationTranslations[loc] as any)[field] = value;
      }
    }
  }
  async saveLegislation(): Promise<void> {
    const payload = { ...this.legislationForm };
    if (this.selectedLegislation) payload.translationGroupId = this.selectedLegislation.id;
    await this.saveWithConfirm('Guardar normativa', 'Se guardaran los cambios de normativa publica.', () => this.selectedLegislation ? this.service.updateLegislation(this.selectedLegislation.id, payload) : this.service.createLegislation(payload), 'legislation');
  }
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
  switchFaqCategoryLocale(locale: string): void {
    if (this.faqCategoryLocale !== locale) {
      this.faqCategoryTranslations[this.faqCategoryLocale] = { ...this.faqCategoryForm };
    }
    this.faqCategoryLocale = locale;
    this.faqCategoryForm = { ...(this.faqCategoryTranslations[locale] ?? this.createFaqCategoryForm()), locale };
  }

  syncFaqCategoryCommon(field: 'categoryCode' | 'sortOrder' | 'published', value: any): void {
    for (const loc of this.supportedLocales) {
      if (this.faqCategoryTranslations[loc]) {
        (this.faqCategoryTranslations[loc] as any)[field] = value;
      }
    }
  }
  async saveFaqCategory(): Promise<void> {
    const payload = { ...this.faqCategoryForm };
    if (this.selectedFaqCategory) payload.translationGroupId = this.selectedFaqCategory.id;
    await this.saveWithConfirm('Guardar categoria FAQ', 'Se guardaran los cambios de categoria FAQ.', () => this.selectedFaqCategory ? this.service.updateFaqCategory(this.selectedFaqCategory.id, payload) : this.service.createFaqCategory(payload), 'faq');
  }
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
  switchFaqLocale(locale: string): void {
    if (this.faqLocale !== locale) {
      this.faqTranslations[this.faqLocale] = { ...this.faqForm };
    }
    this.faqLocale = locale;
    this.faqForm = { ...(this.faqTranslations[locale] ?? this.createFaqForm()), locale };
  }

  syncFaqCommon(field: 'categoryCode' | 'sortOrder' | 'published', value: any): void {
    for (const loc of this.supportedLocales) {
      if (this.faqTranslations[loc]) {
        (this.faqTranslations[loc] as any)[field] = value;
      }
    }
  }
  async saveFaq(): Promise<void> {
    const payload = { ...this.faqForm };
    if (this.selectedFaqEntry) payload.translationGroupId = this.selectedFaqEntry.id;
    await this.saveWithConfirm('Guardar FAQ', 'Se guardaran los cambios de la entrada FAQ.', () => this.selectedFaqEntry ? this.service.updateFaqEntry(this.selectedFaqEntry.id, payload) : this.service.createFaqEntry(payload), 'faq');
  }
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
  switchCalendarLocale(locale: string): void {
    if (this.calendarLocale !== locale) {
      this.calendarTranslations[this.calendarLocale] = { ...this.calendarForm };
    }
    this.calendarLocale = locale;
    this.calendarForm = { ...(this.calendarTranslations[locale] ?? this.createCalendarForm()), locale };
  }

  syncCalendarCommon(field: 'type' | 'eventDate' | 'relatedProcedure' | 'sortOrder' | 'published', value: any): void {
    for (const loc of this.supportedLocales) {
      if (this.calendarTranslations[loc]) {
        (this.calendarTranslations[loc] as any)[field] = value;
      }
    }
  }
  async saveCalendar(): Promise<void> {
    const payload = { ...this.calendarForm };
    if (this.selectedCalendarEntry) payload.translationGroupId = this.selectedCalendarEntry.id;
    await this.saveWithConfirm('Guardar evento', 'Se guardaran los cambios del plazo o evento.', () => this.selectedCalendarEntry ? this.service.updateCalendarEntry(this.selectedCalendarEntry.id, payload) : this.service.createCalendarEntry(payload), 'calendar');
  }
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
  switchInstitutionalLocale(locale: string): void {
    if (this.institutionalLocale !== locale) {
      this.institutionalTranslations[this.institutionalLocale] = { ...this.institutionalForm };
    }
    this.institutionalLocale = locale;
    this.institutionalForm = { ...(this.institutionalTranslations[locale] ?? this.createInstitutionalForm()), locale };
  }

  syncInstitutionalCommon(field: 'sectionCode' | 'icon' | 'sortOrder' | 'published', value: any): void {
    for (const loc of this.supportedLocales) {
      if (this.institutionalTranslations[loc]) {
        (this.institutionalTranslations[loc] as any)[field] = value;
      }
    }
  }
  async saveInstitutional(): Promise<void> {
    const payload = { ...this.institutionalForm };
    if (this.selectedInstitutionalEntry) payload.translationGroupId = this.selectedInstitutionalEntry.id;
    await this.saveWithConfirm('Guardar informacion', 'Se guardaran los cambios de informacion institucional.', () => this.selectedInstitutionalEntry ? this.service.updateInstitutional(this.selectedInstitutionalEntry.id, payload) : this.service.createInstitutional(payload), 'institutional');
  }
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
  switchOrganismLocale(locale: string): void {
    if (this.organismLocale !== locale) {
      this.organismTranslations[this.organismLocale] = { ...this.organismForm };
    }
    this.organismLocale = locale;
    this.organismForm = { ...(this.organismTranslations[locale] ?? this.createOrganismForm()), locale };
  }

  syncOrganismCommon(field: 'categoryCode' | 'phone' | 'email' | 'address' | 'websiteUrl' | 'sortOrder' | 'published', value: any): void {
    for (const loc of this.supportedLocales) {
      if (this.organismTranslations[loc]) {
        (this.organismTranslations[loc] as any)[field] = value;
      }
    }
  }
  async saveOrganism(): Promise<void> {
    const payload = { ...this.organismForm };
    if (this.selectedOrganismEntry) payload.translationGroupId = this.selectedOrganismEntry.id;
    await this.saveWithConfirm('Guardar organismo', 'Se guardaran los cambios del organismo.', () => this.selectedOrganismEntry ? this.service.updateOrganism(this.selectedOrganismEntry.id, payload) : this.service.createOrganism(payload), 'organisms');
  }
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
  switchResourceLocale(locale: string): void {
    if (this.resourceLocale !== locale) {
      this.resourceTranslations[this.resourceLocale] = { ...this.resourceForm };
    }
    this.resourceLocale = locale;
    this.resourceForm = { ...(this.resourceTranslations[locale] ?? this.createResourceForm()), locale };
  }

  syncResourceCommon(field: 'resourceType' | 'externalUrl' | 'sortOrder' | 'published', value: any): void {
    for (const loc of this.supportedLocales) {
      if (this.resourceTranslations[loc]) {
        (this.resourceTranslations[loc] as any)[field] = value;
      }
    }
  }
  async saveResource(): Promise<void> {
    const payload = { ...this.resourceForm };
    if (this.selectedResourceEntry) payload.translationGroupId = this.selectedResourceEntry.id;
    await this.saveWithConfirm('Guardar recurso', 'Se guardaran los cambios del recurso publico.', () => this.selectedResourceEntry ? this.service.updateResource(this.selectedResourceEntry.id, payload) : this.service.createResource(payload), 'resources');
  }
  async deleteResource(item: PublicResourceEntry): Promise<void> { await this.deleteWithConfirm('Eliminar recurso', 'Esta accion eliminara el recurso seleccionado.', () => this.service.deleteResource(item.id)); }

  applyThemePreset(): void {
    const preset = this.themePresets.find((item) => item.name === this.selectedThemePreset);
    if (!preset) return;
    const colors = this.themeMode === 'dark' ? preset.darkColors : preset.colors;
    this.themeForm = colors.map((color) => ({ ...color }));
    this.themeValidationError = '';
  }

  applyPresetAsNewTheme(): void {
    const preset = this.themePresets.find((item) => item.name === this.selectedThemePreset);
    if (!preset) return;

    const suffix = this.themeVariants.length + 1;
    const baseId = this.normalizeThemeId(preset.name, suffix - 1);
    const nextId = this.themeVariants.some((theme) => theme.id === baseId) ? `${baseId}-${suffix}` : baseId;
    const lightVariant: ThemeVariant = {
      id: nextId,
      name: `${preset.name} ${suffix}`,
      mode: 'light',
      colors: preset.colors.map((color) => ({ ...color })),
      active: false
    };
    const darkVariant: ThemeVariant = {
      id: nextId,
      name: `${preset.name} ${suffix}`,
      mode: 'dark',
      colors: preset.darkColors.map((color) => ({ ...color })),
      active: false
    };

    this.themeVariants = [...this.themeVariants, lightVariant, darkVariant];
    this.selectThemeVariant(lightVariant.id);
    this.refreshThemeLists();
  }

  selectThemeVariant(themeId: string): void {
    const theme = this.themeVariants.find((item) => item.id === themeId && item.mode === this.themeMode);
    if (!theme) {
      const fallback = this.themeVariants.find((item) => item.id === themeId)
        ?? this.themeVariants.find((item) => item.mode === this.themeMode)
        ?? this.themeVariants[0];
      if (!fallback) return;
      this.currentThemeId = fallback.id;
      this.currentThemeName = fallback.name;
      this.themeForm = fallback.colors.map((color) => ({ ...color }));
      this.themeValidationError = '';
      this.refreshThemeLists();
      return;
    }
    this.currentThemeId = theme.id;
    this.currentThemeName = theme.name;
    this.themeForm = theme.colors.map((color) => ({ ...color }));
    this.themeValidationError = '';
    this.refreshThemeLists();
  }

  setThemeMode(mode: 'light' | 'dark'): void {
    this.themeMode = mode;
    this.saveCurrentModeToVariants();
    this.selectThemeVariant(this.currentThemeId);
  }

  private saveCurrentModeToVariants(): void {
    const idx = this.themeVariants.findIndex((t) => t.id === this.currentThemeId && t.mode === this.themeMode);
    if (idx >= 0) {
      const updated = [...this.themeVariants];
      updated[idx] = { ...updated[idx], colors: [...this.themeForm] };
      this.themeVariants = updated;
    }
  }

  createThemeVariant(): void {
    const nextId = `tema-${this.themeVariants.length + 1}`;
    const name = `Tema ${this.themeVariants.length + 1}`;
    const variant: ThemeVariant = {
      id: nextId,
      name,
      mode: 'light',
      colors: this.createThemeForm(),
      active: false
    };
    const darkVariant: ThemeVariant = {
      id: nextId,
      name,
      mode: 'dark',
      colors: this.createDarkThemeForm(),
      active: false
    };
    this.themeVariants = [...this.themeVariants, variant, darkVariant];
    this.selectThemeVariant(nextId);
    this.refreshThemeLists();
  }

  duplicateCurrentThemeVariant(): void {
    const current = this.themeVariants.find((theme) => theme.id === this.currentThemeId && theme.mode === this.themeMode);
    if (!current) return;

    const suffix = this.themeVariants.length + 1;
    const duplicated: ThemeVariant = {
      id: `${current.id}-copy-${suffix}`,
      name: `${current.name} (copia)`,
      mode: current.mode,
      colors: current.colors.map((color) => ({ ...color })),
      active: false
    };

    const oppositeMode = current.mode === 'light' ? 'dark' : 'light';
    const oppositeColors = oppositeMode === 'dark' ? this.createDarkThemeForm() : this.createThemeForm();
    const duplicatedOpposite: ThemeVariant = {
      id: `${current.id}-copy-${suffix}`,
      name: `${current.name} (copia)`,
      mode: oppositeMode,
      colors: oppositeColors,
      active: false
    };

    this.themeVariants = [...this.themeVariants, duplicated, duplicatedOpposite];
    this.selectThemeVariant(duplicated.id);
    this.refreshThemeLists();
  }

  removeCurrentThemeVariant(): void {
    if (this.themeVariants.length <= 2) {
      return;
    }
    this.themeVariants = this.themeVariants.filter((theme) => theme.id !== this.currentThemeId);
    if (this.activeThemeId === this.currentThemeId) {
      const remaining = [...new Set(this.themeVariants.map((t) => t.id))];
      this.activeThemeId = remaining[0];
    }
    const remaining = [...new Set(this.themeVariants.map((t) => t.id))];
    this.selectThemeVariant(remaining[0]);
    this.refreshThemeLists();
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

        this.themeVariants = raw.themes.flatMap((theme) => {
          const base = {
            id: String(theme.id ?? '').trim(),
            name: String(theme.name ?? '').trim() || 'Tema importado',
            colors: Array.isArray(theme.colors)
              ? theme.colors
                  .filter((color) => color && typeof color.token === 'string' && typeof color.value === 'string')
                  .map((color) => ({ token: color.token.trim(), value: color.value.trim() }))
              : [],
            active: false
          };
          const mode = (theme as any).mode;
          if (mode === 'light' || mode === 'dark') {
            return [{ ...base, mode }];
          }
          return [
            { ...base, mode: 'light' as const },
            { ...base, mode: 'dark' as const, colors: [] }
          ];
        });

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
    this.saveCurrentModeToVariants();

    this.themeVariants = this.themeVariants.map((theme) => {
      if (theme.id !== this.currentThemeId) {
        return theme;
      }
      return { ...theme, name: this.currentThemeName.trim() || theme.name, id: this.currentThemeId.trim() || theme.id };
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
  private static createPreset(
    name: string,
    colors: Record<string, string>,
    darkColors: Record<string, string>
  ): { name: string; colors: ThemeColor[]; darkColors: ThemeColor[] } {
    const toThemeColors = (map: Record<string, string>): ThemeColor[] =>
      Object.entries(map).map(([token, value]) => ({ token, value }));
    return { name, colors: toThemeColors(colors), darkColors: toThemeColors(darkColors) };
  }

  private createThemeForm(): ThemeColor[] {
    return [
      { token: CSS.PRIMARY, value: FALLBACK_PRIMARY },
      { token: CSS.PRIMARY_HOVER, value: FALLBACK_PRIMARY_HOVER },
      { token: CSS.PRIMARY_50, value: '#eff6ff' },
      { token: CSS.PRIMARY_CONTRAST, value: '#ffffff' },
      { token: CSS.LINK, value: '#0ea5e9' },
      { token: CSS.BG, value: '#f8fafc' },
      { token: CSS.SURFACE, value: '#ffffff' },
      { token: CSS.TEXT, value: '#0f172a' },
      { token: CSS.MUTED, value: '#475569' },
      { token: CSS.BORDER, value: '#e2e8f0' },
      { token: CSS.HERO_BG, value: '#0e2a47' },
      { token: CSS.HERO_TEXT, value: '#f8fafc' },
      { token: CSS.HERO_SUBTITLE, value: '#d9e2ec' },
      { token: CSS.CALENDAR_DATE_BG, value: 'rgba(14, 116, 144, 0.10)' },
      { token: CSS.CALENDAR_DATE_TEXT, value: '#0ea5e9' },
      { token: CSS.FOOTER_BG, value: '#0f172a' },
      { token: CSS.FOOTER_TEXT, value: '#cbd5e1' }
    ];
  }

  private createDarkThemeForm(): ThemeColor[] {
    return [
      { token: CSS.PRIMARY, value: '#3b82f6' },
      { token: CSS.PRIMARY_HOVER, value: '#60a5fa' },
      { token: CSS.PRIMARY_50, value: '#1e3a5f' },
      { token: CSS.PRIMARY_CONTRAST, value: '#ffffff' },
      { token: CSS.LINK, value: '#38bdf8' },
      { token: CSS.BG, value: '#0f172a' },
      { token: CSS.SURFACE, value: '#1e293b' },
      { token: CSS.TEXT, value: '#f1f5f9' },
      { token: CSS.MUTED, value: '#94a3b8' },
      { token: CSS.BORDER, value: '#334155' },
      { token: CSS.HERO_BG, value: '#0c1929' },
      { token: CSS.HERO_TEXT, value: '#f8fafc' },
      { token: CSS.HERO_SUBTITLE, value: '#94a3b8' },
      { token: CSS.CALENDAR_DATE_BG, value: 'rgba(59, 130, 246, 0.15)' },
      { token: CSS.CALENDAR_DATE_TEXT, value: '#60a5fa' },
      { token: CSS.FOOTER_BG, value: '#020617' },
      { token: CSS.FOOTER_TEXT, value: '#64748b' }
    ];
  }

  private defaultThemeVariants(): ThemeVariant[] {
    return this.themePresets.flatMap((preset, index) => {
      const id = this.normalizeThemeId(preset.name, index);
      return [
        {
          id,
          name: preset.name,
          mode: 'light' as const,
          colors: preset.colors.map((color) => ({ ...color })),
          active: index === 0
        },
        {
          id,
          name: preset.name,
          mode: 'dark' as const,
          colors: preset.darkColors.map((color) => ({ ...color })),
          active: false
        }
      ];
    });
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

    const validators: Record<string, (f: any) => boolean> = {
      legislation: (f) => this.hasValue(f.title) && this.hasValue(f.description),
      faq: (f) => this.selectedFaqCategory
        ? this.hasValue(f.categoryName)
        : this.hasValue(f.question) && this.hasValue(f.answer),
      calendar: (f) => this.hasValue(f.title) && this.hasValue(f.description),
      institutional: (f) => this.hasValue(f.title) && this.hasValue(f.content),
      organisms: (f) => this.hasValue(f.name) && this.hasValue(f.description),
      resources: (f) => this.hasValue(f.title) && this.hasValue(f.description)
    };

    return validators[tab]?.(form) ? 'translated' : 'pending';
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
    const primary = tokenMap.get(CSS.PRIMARY) ?? '';
    const primaryHover = tokenMap.get(CSS.PRIMARY_HOVER) ?? '';
    const primary50 = tokenMap.get(CSS.PRIMARY_50) ?? '';
    const primaryContrast = tokenMap.get(CSS.PRIMARY_CONTRAST) ?? '';
    const surface = tokenMap.get(CSS.SURFACE) ?? '';
    const text = tokenMap.get(CSS.TEXT) ?? '';
    const link = tokenMap.get(CSS.LINK) ?? '';
    const muted = tokenMap.get(CSS.MUTED) ?? '';
    const border = tokenMap.get(CSS.BORDER) ?? '';

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
