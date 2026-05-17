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
  PublicResourceUpsertRequest
} from '../../../application/models/backoffice.models';
import { PublicContentManagementService } from '../../../application/services/public-content-management.service';
import { ConfirmDialogService } from '../../../application/services/confirm-dialog.service';

type ContentTab = 'legislation' | 'faq' | 'calendar' | 'institutional' | 'organisms' | 'resources';

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
    { value: 'resources', label: 'Recursos' }
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

  selectedLegislation: PublicLegislationEntry | null = null;
  selectedFaqCategory: PublicFaqCategoryEntry | null = null;
  selectedFaqEntry: PublicFaqEntry | null = null;
  selectedCalendarEntry: PublicCalendarEntry | null = null;
  selectedInstitutionalEntry: PublicInstitutionalEntry | null = null;
  selectedOrganismEntry: PublicOrganismEntry | null = null;
  selectedResourceEntry: PublicResourceEntry | null = null;

  legislationForm: PublicLegislationUpsertRequest = this.createLegislationForm();
  faqCategoryForm: PublicFaqCategoryUpsertRequest = this.createFaqCategoryForm();
  faqForm: PublicFaqUpsertRequest = this.createFaqForm();
  calendarForm: PublicCalendarUpsertRequest = this.createCalendarForm();
  institutionalForm: PublicInstitutionalUpsertRequest = this.createInstitutionalForm();
  organismForm: PublicOrganismUpsertRequest = this.createOrganismForm();
  resourceForm: PublicResourceUpsertRequest = this.createResourceForm();

  ngOnInit(): void {
    this.reload();
  }

  selectTab(tab: ContentTab): void {
    this.activeTab = tab;
  }

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
      this.service.listResources().toPromise()
    ]).then(([legislation, categories, faqs, calendar, institutional, organismCategories, organisms, resources]) => {
      this.legislation = legislation ?? [];
      this.faqCategories = categories ?? [];
      this.faqEntries = faqs ?? [];
      this.calendarEntries = calendar ?? [];
      this.institutionalEntries = institutional ?? [];
      this.organismCategories = organismCategories ?? [];
      this.organismEntries = organisms ?? [];
      this.resourceEntries = resources ?? [];
      this.isLoading = false;
    }).catch(() => {
      this.isLoading = false;
    });
  }

  editLegislation(item: PublicLegislationEntry): void {
    this.selectedLegislation = item;
    this.legislationForm = {
      locale: item.locale,
      type: item.type,
      title: item.title,
      description: item.description,
      publicationDate: item.publicationDate,
      externalUrl: item.externalUrl,
      downloadUrl: item.downloadUrl,
      sortOrder: item.sortOrder,
      published: item.published
    };
  }

  newLegislation(): void {
    this.selectedLegislation = null;
    this.legislationForm = this.createLegislationForm();
  }

  async saveLegislation(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Guardar normativa', 'Se guardaran los cambios de normativa publica.', 'Guardar');
    if (!confirmed) return;
    this.isSaving = true;
    const request = this.selectedLegislation
      ? this.service.updateLegislation(this.selectedLegislation.id, this.legislationForm)
      : this.service.createLegislation(this.legislationForm);
    request.subscribe({ next: () => this.afterSave('legislation'), error: () => this.isSaving = false });
  }

  async deleteLegislation(item: PublicLegislationEntry): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Eliminar normativa', 'Esta accion eliminara la normativa seleccionada.', 'Eliminar');
    if (!confirmed) return;
    this.service.deleteLegislation(item.id).subscribe({ next: () => this.reload() });
  }

  editFaqCategory(item: PublicFaqCategoryEntry): void {
    this.selectedFaqCategory = item;
    this.faqCategoryForm = {
      locale: item.locale,
      categoryCode: item.categoryCode,
      categoryName: item.categoryName,
      sortOrder: item.sortOrder,
      published: item.published
    };
  }

  newFaqCategory(): void {
    this.selectedFaqCategory = null;
    this.faqCategoryForm = this.createFaqCategoryForm();
  }

  async saveFaqCategory(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Guardar categoria FAQ', 'Se guardaran los cambios de categoria FAQ.', 'Guardar');
    if (!confirmed) return;
    this.isSaving = true;
    const request = this.selectedFaqCategory
      ? this.service.updateFaqCategory(this.selectedFaqCategory.id, this.faqCategoryForm)
      : this.service.createFaqCategory(this.faqCategoryForm);
    request.subscribe({ next: () => this.afterSave('faq'), error: () => this.isSaving = false });
  }

  async deleteFaqCategory(item: PublicFaqCategoryEntry): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Eliminar categoria FAQ', 'Esta accion eliminara la categoria seleccionada.', 'Eliminar');
    if (!confirmed) return;
    this.service.deleteFaqCategory(item.id).subscribe({ next: () => this.reload() });
  }

  editFaq(item: PublicFaqEntry): void {
    this.selectedFaqEntry = item;
    this.faqForm = {
      locale: item.locale,
      categoryCode: item.categoryCode,
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
      published: item.published
    };
  }

  newFaq(): void {
    this.selectedFaqEntry = null;
    this.faqForm = this.createFaqForm();
  }

  async saveFaq(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Guardar FAQ', 'Se guardaran los cambios de la entrada FAQ.', 'Guardar');
    if (!confirmed) return;
    this.isSaving = true;
    const request = this.selectedFaqEntry
      ? this.service.updateFaqEntry(this.selectedFaqEntry.id, this.faqForm)
      : this.service.createFaqEntry(this.faqForm);
    request.subscribe({ next: () => this.afterSave('faq'), error: () => this.isSaving = false });
  }

  async deleteFaq(item: PublicFaqEntry): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Eliminar FAQ', 'Esta accion eliminara la FAQ seleccionada.', 'Eliminar');
    if (!confirmed) return;
    this.service.deleteFaqEntry(item.id).subscribe({ next: () => this.reload() });
  }

  editCalendar(item: PublicCalendarEntry): void {
    this.selectedCalendarEntry = item;
    this.calendarForm = {
      locale: item.locale,
      type: item.type,
      title: item.title,
      description: item.description,
      eventDate: item.eventDate,
      relatedProcedure: item.relatedProcedure,
      sortOrder: item.sortOrder,
      published: item.published
    };
  }

  newCalendar(): void {
    this.selectedCalendarEntry = null;
    this.calendarForm = this.createCalendarForm();
  }

  async saveCalendar(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Guardar evento', 'Se guardaran los cambios del plazo o evento.', 'Guardar');
    if (!confirmed) return;
    this.isSaving = true;
    const request = this.selectedCalendarEntry
      ? this.service.updateCalendarEntry(this.selectedCalendarEntry.id, this.calendarForm)
      : this.service.createCalendarEntry(this.calendarForm);
    request.subscribe({ next: () => this.afterSave('calendar'), error: () => this.isSaving = false });
  }

  async deleteCalendar(item: PublicCalendarEntry): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Eliminar evento', 'Esta accion eliminara el plazo o evento seleccionado.', 'Eliminar');
    if (!confirmed) return;
    this.service.deleteCalendarEntry(item.id).subscribe({ next: () => this.reload() });
  }

  editInstitutional(item: PublicInstitutionalEntry): void {
    this.selectedInstitutionalEntry = item;
    this.institutionalForm = { locale: item.locale, sectionCode: item.sectionCode, title: item.title, content: item.content, icon: item.icon, sortOrder: item.sortOrder, published: item.published };
  }

  newInstitutional(): void {
    this.selectedInstitutionalEntry = null;
    this.institutionalForm = this.createInstitutionalForm();
  }

  async saveInstitutional(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Guardar informacion', 'Se guardaran los cambios de informacion institucional.', 'Guardar');
    if (!confirmed) return;
    this.isSaving = true;
    const request = this.selectedInstitutionalEntry
      ? this.service.updateInstitutional(this.selectedInstitutionalEntry.id, this.institutionalForm)
      : this.service.createInstitutional(this.institutionalForm);
    request.subscribe({ next: () => this.afterSave('institutional'), error: () => this.isSaving = false });
  }

  async deleteInstitutional(item: PublicInstitutionalEntry): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Eliminar informacion', 'Esta accion eliminara la seccion institucional seleccionada.', 'Eliminar');
    if (!confirmed) return;
    this.service.deleteInstitutional(item.id).subscribe({ next: () => this.reload() });
  }

  editOrganism(item: PublicOrganismEntry): void {
    this.selectedOrganismEntry = item;
    this.organismForm = { locale: item.locale, categoryCode: item.categoryCode, name: item.name, description: item.description, phone: item.phone, email: item.email, address: item.address, websiteUrl: item.websiteUrl, sortOrder: item.sortOrder, published: item.published };
  }

  newOrganism(): void {
    this.selectedOrganismEntry = null;
    this.organismForm = this.createOrganismForm();
  }

  async saveOrganism(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Guardar organismo', 'Se guardaran los cambios del organismo.', 'Guardar');
    if (!confirmed) return;
    this.isSaving = true;
    const request = this.selectedOrganismEntry
      ? this.service.updateOrganism(this.selectedOrganismEntry.id, this.organismForm)
      : this.service.createOrganism(this.organismForm);
    request.subscribe({ next: () => this.afterSave('organisms'), error: () => this.isSaving = false });
  }

  async deleteOrganism(item: PublicOrganismEntry): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Eliminar organismo', 'Esta accion eliminara el organismo seleccionado.', 'Eliminar');
    if (!confirmed) return;
    this.service.deleteOrganism(item.id).subscribe({ next: () => this.reload() });
  }

  editResource(item: PublicResourceEntry): void {
    this.selectedResourceEntry = item;
    this.resourceForm = { locale: item.locale, resourceType: item.resourceType, title: item.title, description: item.description, content: item.content, externalUrl: item.externalUrl, sortOrder: item.sortOrder, published: item.published };
  }

  newResource(): void {
    this.selectedResourceEntry = null;
    this.resourceForm = this.createResourceForm();
  }

  async saveResource(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Guardar recurso', 'Se guardaran los cambios del recurso publico.', 'Guardar');
    if (!confirmed) return;
    this.isSaving = true;
    const request = this.selectedResourceEntry
      ? this.service.updateResource(this.selectedResourceEntry.id, this.resourceForm)
      : this.service.createResource(this.resourceForm);
    request.subscribe({ next: () => this.afterSave('resources'), error: () => this.isSaving = false });
  }

  async deleteResource(item: PublicResourceEntry): Promise<void> {
    const confirmed = await this.confirmDialog.confirm('Eliminar recurso', 'Esta accion eliminara el recurso seleccionado.', 'Eliminar');
    if (!confirmed) return;
    this.service.deleteResource(item.id).subscribe({ next: () => this.reload() });
  }

  private afterSave(tab: ContentTab): void {
    this.isSaving = false;
    this.activeTab = tab;
    this.reload();
  }

  private createLegislationForm(): PublicLegislationUpsertRequest {
    return { locale: 'es-ES', type: 'law', title: '', description: '', publicationDate: '', externalUrl: '', downloadUrl: '', sortOrder: 0, published: true };
  }

  private createFaqCategoryForm(): PublicFaqCategoryUpsertRequest {
    return { locale: 'es-ES', categoryCode: '', categoryName: '', sortOrder: 0, published: true };
  }

  private createFaqForm(): PublicFaqUpsertRequest {
    return { locale: 'es-ES', categoryCode: '', question: '', answer: '', sortOrder: 0, published: true };
  }

  private createCalendarForm(): PublicCalendarUpsertRequest {
    return { locale: 'es-ES', type: 'deadline', title: '', description: '', eventDate: '', relatedProcedure: '', sortOrder: 0, published: true };
  }

  private createInstitutionalForm(): PublicInstitutionalUpsertRequest {
    return { locale: 'es-ES', sectionCode: '', title: '', content: '', icon: '', sortOrder: 0, published: true };
  }

  private createOrganismForm(): PublicOrganismUpsertRequest {
    return { locale: 'es-ES', categoryCode: '', name: '', description: '', phone: '', email: '', address: '', websiteUrl: '', sortOrder: 0, published: true };
  }

  private createResourceForm(): PublicResourceUpsertRequest {
    return { locale: 'es-ES', resourceType: 'glossary', title: '', description: '', content: '', externalUrl: '', sortOrder: 0, published: true };
  }
}
