import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminCasesService } from '../../../application/services/admin-cases.service';
import { MessagingAdminService, MessageDto, PagedMessages } from '../../../application/services/messaging-admin.service';
import { CaseDetail, CaseWorkflowGraph, CaseWorkflowNode } from '../../../application/models/backoffice.models';
import { ProcedureManagementService } from '../../../application/services/procedure-management.service';

@Component({
    selector: 'bo-case-detail',
    templateUrl: './case-detail.component.html',
    styleUrls: ['./case-detail.component.css'],
    standalone: false
})
export class CaseDetailComponent implements OnInit {
  private readonly adminCasesService = inject(AdminCasesService);
  private readonly messagingService = inject(MessagingAdminService);
  private readonly procedureManagementService = inject(ProcedureManagementService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  caseDetail: CaseDetail | null = null;
  isLoading = true;
  activeTab: 'timeline' | 'documents' | 'data' | 'tasks' | 'messages' | 'workflow' | 'actions' = 'timeline';
  showStatusModal = false;
  newStatus = '';
  tabs: ('timeline' | 'documents' | 'data' | 'tasks' | 'messages' | 'workflow' | 'actions')[] = ['timeline', 'documents', 'tasks', 'workflow', 'messages', 'data', 'actions'];
  workflowGraph: CaseWorkflowGraph | null = null;
  selectedWorkflowNodeKey: string | null = null;
  formFieldLabels: Record<string, string> = {};

  pendingTasks: { id: string; name: string; description: string; type: string; assignedRole: string }[] = [];

  // Messaging state
  messages: MessageDto[] = [];
  messagePage = 0;
  messagePageSize = 20;
  messageTotalPages = 1;
  messageTotalItems = 0;
  replyContent = '';
  replyTemplateKey = '';
  replyNotifyByEmail = true;
  isSendingMessage = false;
  replyFiles: File[] = [];

  readonly MESSAGE_TEMPLATES = [
    { key: '', label: 'Texto libre' },
    { key: 'REQUEST_INFO', label: 'Solicitud de informacion adicional' },
    { key: 'DOCUMENT_INCOMPLETE', label: 'Documentacion incompleta' },
    { key: 'APPROVED', label: 'Expediente aprobado' },
    { key: 'REJECTED', label: 'Expediente rechazado' },
    { key: 'AMENDMENT_REQUIRED', label: 'Subsanacion requerida' }
  ];

  readonly PAGE_SIZE_OPTIONS = [10, 20, 50];

  statusOptions = [
    { value: 'IN_PROGRESS', label: 'En Tramitacion' },
    { value: 'PENDING_AMENDMENT', label: 'Pendiente Subsanacion' },
    { value: 'RESOLVED', label: 'Resuelto' },
    { value: 'REJECTED', label: 'Rechazado' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab && ['timeline', 'documents', 'data', 'tasks', 'messages', 'workflow', 'actions'].includes(tab)) {
      this.activeTab = tab as typeof this.activeTab;
    }
    if (id) {
      this.loadCase(id);
    }
  }

  loadCase(id: string): void {
    this.isLoading = true;
    this.adminCasesService.getDetail(id).subscribe({
      next: (detail) => {
        this.caseDetail = detail;
        this.loadFormFieldLabels(detail.procedureTypeId);
        this.loadPendingTasks(id);
        this.loadWorkflowGraph(id);
        this.loadMessages(id);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadWorkflowGraph(caseId: string): void {
    this.adminCasesService.getWorkflowGraph(caseId).subscribe({
      next: (graph) => {
        this.workflowGraph = graph;
        this.selectedWorkflowNodeKey = graph.nodes.find((node) => node.current)?.key ?? graph.nodes[0]?.key ?? null;
      },
      error: () => {
        this.workflowGraph = null;
        this.selectedWorkflowNodeKey = null;
      }
    });
  }

  get workflowNodesInOrder(): CaseWorkflowNode[] {
    return [...(this.workflowGraph?.nodes ?? [])].sort((a, b) => a.order - b.order);
  }

  get selectedWorkflowNode(): CaseWorkflowNode | null {
    if (!this.workflowGraph || !this.selectedWorkflowNodeKey) {
      return null;
    }
    return this.workflowGraph.nodes.find((node) => node.key === this.selectedWorkflowNodeKey) ?? null;
  }

  selectWorkflowNode(nodeKey: string): void {
    this.selectedWorkflowNodeKey = nodeKey;
  }

  getNodeTransitions(nodeKey: string): { to: CaseWorkflowNode; candidate: boolean; visited: boolean }[] {
    if (!this.workflowGraph) {
      return [];
    }
    const nodeByKey = new Map(this.workflowGraph.nodes.map((node) => [node.key, node]));
    return this.workflowGraph.transitions
      .filter((transition) => transition.from === nodeKey)
      .map((transition) => ({
        to: nodeByKey.get(transition.to),
        candidate: transition.candidate,
        visited: transition.visited
      }))
      .filter((item): item is { to: CaseWorkflowNode; candidate: boolean; visited: boolean } => Boolean(item.to));
  }

  getNodeClass(node: CaseWorkflowNode): string {
    const byCategory: Record<string, string> = {
      current: 'border-blue-600 bg-blue-50 text-blue-700',
      next: 'border-emerald-500 bg-emerald-50 text-emerald-700',
      visited: 'border-slate-400 bg-slate-100 text-slate-700',
      idle: 'border-gray-200 bg-white text-gray-600'
    };
    return byCategory[node.category] ?? byCategory['idle'];
  }

  loadMessages(caseId: string): void {
    this.messagingService.getThreadMessages(caseId, this.messagePage, this.messagePageSize).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.messageTotalPages = response.totalPages;
        this.messageTotalItems = response.totalItems;
      },
      error: () => {
        this.messages = [];
      }
    });
  }

  changeMessagePage(page: number): void {
    if (this.caseDetail) {
      this.messagePage = page;
      this.loadMessages(this.caseDetail.id);
    }
  }

  changeMessagePageSize(size: number): void {
    this.messagePageSize = size;
    this.messagePage = 0;
    if (this.caseDetail) {
      this.loadMessages(this.caseDetail.id);
    }
  }

  selectTemplate(templateKey: string): void {
    this.replyTemplateKey = templateKey;
    const templateTexts: Record<string, string> = {
      'REQUEST_INFO': 'Estimado/a ciudadano/a,\n\nLe solicitamos que nos facilite la siguiente informacion adicional sobre su expediente:\n\n',
      'DOCUMENT_INCOMPLETE': 'Estimado/a ciudadano/a,\n\nLa documentacion presentada para su expediente es incompleta. Por favor, adjunte los siguientes documentos:\n\n',
      'APPROVED': 'Estimado/a ciudadano/a,\n\nLe informamos de que su expediente ha sido aprobado.\n\n',
      'REJECTED': 'Estimado/a ciudadano/a,\n\nLamentamos informarle de que su expediente ha sido rechazado por los siguientes motivos:\n\n',
      'AMENDMENT_REQUIRED': 'Estimado/a ciudadano/a,\n\nEs necesario que subsane los siguientes aspectos de su expediente:\n\n'
    };
    if (templateKey && templateTexts[templateKey]) {
      this.replyContent = templateTexts[templateKey];
    }
  }

  sendMessage(): void {
    if (!this.caseDetail || !this.replyContent.trim()) return;

    this.isSendingMessage = true;
    this.messagingService.sendMessage(
      this.caseDetail.id,
      this.replyContent.trim(),
      this.replyTemplateKey || undefined,
      this.replyNotifyByEmail,
      this.replyFiles.length > 0 ? this.replyFiles : undefined
    ).subscribe({
      next: () => {
        this.replyContent = '';
        this.replyTemplateKey = '';
        this.replyFiles = [];
        this.messagePage = 0;
        this.loadMessages(this.caseDetail!.id);
        this.isSendingMessage = false;
      },
      error: () => {
        this.isSendingMessage = false;
      }
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.replyFiles = input.files ? Array.from(input.files) : [];
  }

  formatMessageDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getSenderLabel(role: string, name: string): string {
    const labels: Record<string, string> = {
      'CITIZEN': 'Ciudadano',
      'ADMIN': 'Administracion',
      'SYSTEM': 'Sistema'
    };
    return `${labels[role] || role} (${name})`;
  }

  loadPendingTasks(caseId: string): void {
    this.adminCasesService.getPendingTasksByCase(caseId).subscribe({
      next: (tasks) => {
        this.pendingTasks = tasks.map((t) => ({
          id: t.id,
          name: t.taskName,
          description: `Tipo: ${t.taskType} · Prioridad: ${t.priority}`,
          type: t.taskType,
          assignedRole: t.assignedTo || 'Sin asignar'
        }));
      },
      error: () => {
        this.pendingTasks = [];
      }
    });
  }

  openStatusModal(): void {
    this.newStatus = this.caseDetail?.status || '';
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
  }

  updateStatus(): void {
    if (!this.caseDetail || !this.newStatus) return;

    this.adminCasesService.updateStatus(this.caseDetail.id, this.newStatus).subscribe({
      next: () => {
        this.loadCase(this.caseDetail!.id);
        this.showStatusModal = false;
      },
      error: () => {
        // Error handled by interceptor
      }
    });
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option?.label || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      PENDING_AMENDMENT: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getFormDataEntries(): Array<{ key: string; value: unknown }> {
    if (!this.caseDetail?.formData) {
      return [];
    }
    const entries: Array<{ key: string; value: unknown }> = [];
    for (const [key, value] of Object.entries(this.caseDetail.formData)) {
      this.collectLeafEntries(key, value, entries);
    }
    return entries;
  }

  private collectLeafEntries(path: string, value: unknown, entries: Array<{ key: string; value: unknown }>): void {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        entries.push({ key: path, value: null });
        return;
      }
      value.forEach((item, index) => this.collectLeafEntries(`${path}[${index}]`, item, entries));
      return;
    }

    if (value !== null && typeof value === 'object') {
      const objectEntries = Object.entries(value as Record<string, unknown>);
      if (objectEntries.length === 0) {
        entries.push({ key: path, value: null });
        return;
      }
      objectEntries.forEach(([childKey, childValue]) => this.collectLeafEntries(`${path}.${childKey}`, childValue, entries));
      return;
    }

    entries.push({ key: path, value });
  }

  formatFieldLabel(fieldKey: string): string {
    return fieldKey
      .replace(/\./g, ' ')
      .replace(/\[(\d+)\]/g, ' $1 ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim()
      .replace(/^./, (char) => char.toUpperCase());
  }

  getFieldLabel(fieldKey: string): string {
    const rootKey = fieldKey.split(/[.[]/)[0];
    const rootLabel = this.formFieldLabels[rootKey];
    if (!rootLabel || rootKey === fieldKey) {
      return this.formFieldLabels[fieldKey] ?? this.formatFieldLabel(fieldKey);
    }
    const suffix = fieldKey.slice(rootKey.length);
    return `${rootLabel}${this.formatFieldLabel(suffix) ? ` · ${this.formatFieldLabel(suffix)}` : ''}`;
  }

  isBooleanValue(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  isSimpleValue(value: unknown): boolean {
    return value === null || value === undefined || ['string', 'number'].includes(typeof value);
  }

  formatSimpleValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  }

  private loadFormFieldLabels(procedureTypeId: string): void {
    this.formFieldLabels = {};
    this.procedureManagementService.list().subscribe({
      next: (procedures) => {
        const matchedProcedure = procedures.find((procedure) => procedure.id === procedureTypeId);
        if (!matchedProcedure) {
          return;
        }

        this.formFieldLabels = matchedProcedure.formSchema.reduce<Record<string, string>>((acc, field) => {
          if (field.id && field.label) {
            acc[field.id] = field.label;
          }
          return acc;
        }, {});
      },
      error: () => {
        this.formFieldLabels = {};
      }
    });
  }

  downloadDocument(documentId: string, filename: string): void {
    this.adminCasesService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename || 'documento';
        link.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: () => {
        alert('Error al descargar el documento');
      }
    });
  }

  downloadAttachment(attachmentId: string, filename: string): void {
    this.messagingService.downloadAttachment(attachmentId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename || 'adjunto';
        link.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: () => {
        alert('Error al descargar el adjunto');
      }
    });
  }

  getTabLabel(tab: string): string {
    const labels: Record<string, string> = {
      timeline: 'Historial',
      documents: 'Documentos',
      tasks: 'Tareas',
      messages: 'Mensajes',
      workflow: 'Diagrama',
      data: 'Datos',
      actions: 'Acciones'
    };
    return labels[tab] || tab;
  }
}
