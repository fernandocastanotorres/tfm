import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MessagesService } from '../../../application/services/messages.service';
import { MessageThreadSummary, MessageDto } from '../../../application/models/message.models';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';
import { ToastService } from '../../../application/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.css'],
    standalone: false
})
export class MessagesComponent implements OnInit, OnDestroy {
  threads: MessageThreadSummary[] = [];
  selectedThread: MessageThreadSummary | null = null;
  expandedThreadId: string | null = null;
  messages: MessageDto[] = [];
  reply = '';
  isSending = false;
  isLoadingThreads = false;
  isLoadingMessages = false;
  readonly paginationOptions = [10, 20, 50];
  paginationState: PaginationState = { currentPage: 1, totalPages: 1, pageSize: 10 };
  messagePage = 0;
  messagePageSize = 20;
  messageTotalPages = 1;
  messageTotalItems = 0;

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    caseId: ['all'],
    sort: ['updated'],
    pageSize: [10]
  });

  constructor(
    private readonly messagesService: MessagesService,
    private readonly fb: FormBuilder,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadThreads();
    this.filterForm.valueChanges.subscribe(() => {
      this.paginationState = getPaginationState(this.filteredThreads.length, this.filterForm);
    });
  }

  ngOnDestroy(): void {}

  loadThreads(): void {
    this.isLoadingThreads = true;
    this.messagesService.getThreads().subscribe({
      next: (threads) => {
        this.threads = threads;
        this.isLoadingThreads = false;
        this.updatePaginationState();
      },
      error: () => {
        this.threads = [];
        this.isLoadingThreads = false;
      }
    });
  }

  toggleThread(procedureId: string): void {
    if (this.expandedThreadId === procedureId) {
      this.expandedThreadId = null;
      this.selectedThread = null;
    } else {
      this.expandedThreadId = procedureId;
      const thread = this.threads.find(t => t.procedureId === procedureId);
      if (thread) {
        this.selectedThread = thread;
        this.messagePage = 0;
        this.loadMessages(procedureId);
      }
    }
  }

  loadMessages(procedureId: string): void {
    this.isLoadingMessages = true;
    this.messagesService.getThreadMessages(procedureId, this.messagePage, this.messagePageSize).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.messageTotalPages = response.totalPages;
        this.messageTotalItems = response.totalItems;
        this.isLoadingMessages = false;
        this.loadThreads();
      },
      error: () => {
        this.messages = [];
        this.isLoadingMessages = false;
      }
    });
  }

  sendReply(): void {
    if (!this.selectedThread || !this.reply.trim()) {
      return;
    }
    this.isSending = true;
    this.messagesService.sendMessage(this.selectedThread.procedureId, this.reply.trim()).subscribe({
      next: () => {
        this.reply = '';
        this.messagePage = 0;
        this.loadMessages(this.selectedThread!.procedureId);
        this.isSending = false;
        this.toast.success('Mensaje enviado correctamente');
      },
      error: () => {
        this.isSending = false;
        this.toast.error('Error al enviar el mensaje');
      }
    });
  }

  downloadAttachment(attachmentId: string, filename: string): void {
    this.messagesService.downloadAttachment(attachmentId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename || 'adjunto';
        link.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: () => {
        this.toast.error('Error al descargar el adjunto');
      }
    });
  }

  toggleFilter(filter: 'all' | 'unread' | 'read'): void {
    this.filterForm.patchValue({ status: filter });
    this.paginationState = updatePageSize(this.filterForm, this.paginationState.pageSize, this.paginationState);
    this.updatePaginationState();
  }

  changePage(page: number): void {
    this.paginationState = changePage(page, this.paginationState);
  }

  updatePageSize(size: number): void {
    this.paginationState = updatePageSize(this.filterForm, size, this.paginationState);
    this.updatePaginationState();
  }

  private updatePaginationState(): void {
    this.paginationState = getPaginationState(this.filteredThreads.length, this.filterForm);
  }

  get filteredThreads(): MessageThreadSummary[] {
    const search = (this.filterForm.value.search ?? '').toString().toLowerCase();
    const status = this.filterForm.value.status ?? 'all';
    const caseId = this.filterForm.value.caseId ?? 'all';
    const sort = this.filterForm.value.sort ?? 'updated';

    let items = this.threads.filter((thread) => {
      const matchesSearch =
        thread.caseTitle.toLowerCase().includes(search) ||
        thread.lastMessagePreview.toLowerCase().includes(search) ||
        thread.procedureId.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || (status === 'unread' ? thread.unreadCount > 0 : thread.unreadCount === 0);
      const matchesCase = caseId === 'all' || thread.procedureId === caseId;
      return matchesSearch && matchesStatus && matchesCase;
    });

    items = items.sort((a, b) => {
      if (sort === 'subject') {
        return a.caseTitle.localeCompare(b.caseTitle);
      }
      return b.lastMessageAt.localeCompare(a.lastMessageAt);
    });

    return items;
  }

  get pagedThreads(): MessageThreadSummary[] {
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize;
    return this.filteredThreads.slice(start, start + this.paginationState.pageSize);
  }

  get caseOptions(): { id: string; label: string }[] {
    const uniqueCases = new Map<string, string>();
    this.threads.forEach((thread) => {
      if (!uniqueCases.has(thread.procedureId)) {
        uniqueCases.set(thread.procedureId, thread.caseTitle);
      }
    });
    return Array.from(uniqueCases.entries()).map(([id, label]) => ({ id, label }));
  }

  formatMessageDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  changeMessagePage(page: number): void {
    if (this.selectedThread) {
      this.messagePage = page;
      this.loadMessages(this.selectedThread.procedureId);
    }
  }

  changeMessagePageSize(size: number): void {
    this.messagePageSize = size;
    this.messagePage = 0;
    if (this.selectedThread) {
      this.loadMessages(this.selectedThread.procedureId);
    }
  }
}
