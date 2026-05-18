import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MessagesService, MessageThread } from '../../../application/services/messages.service';
import { changePage, updatePageSize, getPaginationState, PaginationState } from '../../../application/utils/pagination';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  threads: MessageThread[] = [];
  selectedThread: MessageThread | null = null;
  reply = '';
  readonly paginationOptions = [10, 20, 50];
  paginationState: PaginationState = { currentPage: 1, totalPages: 1, pageSize: 10 };

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    type: ['all'],
    caseId: ['all'],
    sort: ['updated'],
    pageSize: [10]
  });

  constructor(
    private readonly messagesService: MessagesService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.threads = this.messagesService.getThreads();
    this.selectedThread = this.threads[0] ?? null;
    this.updatePaginationState();
  }

  get filteredThreads(): MessageThread[] {
    const search = (this.filterForm.value.search ?? '').toString().toLowerCase();
    const status = this.filterForm.value.status ?? 'all';
    const caseId = this.filterForm.value.caseId ?? 'all';
    const sort = this.filterForm.value.sort ?? 'updated';

    let items = this.threads.filter((thread) => {
      const matchesSearch =
        thread.subjectKey.toLowerCase().includes(search) ||
        (thread.lastMessageKey ?? thread.lastMessageText ?? '').toLowerCase().includes(search) ||
        thread.caseId.toLowerCase().includes(search) ||
        thread.caseTitleKey.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || (status === 'unread' ? thread.unread : !thread.unread);
      const matchesCase = caseId === 'all' || thread.caseId === caseId;
      return matchesSearch && matchesStatus && matchesCase;
    });

    items = items.sort((a, b) => {
      if (sort === 'subject') {
        return a.subjectKey.localeCompare(b.subjectKey);
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    return items;
  }

  get pagedThreads(): MessageThread[] {
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize;
    return this.filteredThreads.slice(start, start + this.paginationState.pageSize);
  }

  get caseOptions(): { id: string; labelKey: string }[] {
    const uniqueCases = new Map<string, string>();
    this.threads.forEach((thread) => {
      if (!uniqueCases.has(thread.caseId)) {
        uniqueCases.set(thread.caseId, thread.caseTitleKey);
      }
    });
    return Array.from(uniqueCases.entries()).map(([id, labelKey]) => ({ id, labelKey }));
  }

  selectThread(thread: MessageThread): void {
    this.selectedThread = thread;
    this.selectedThread.unread = false;
  }

  sendReply(): void {
    if (!this.selectedThread || !this.reply.trim()) {
      return;
    }
    const trimmed = this.reply.trim();
    const newMessage = {
      id: `MSG-${this.selectedThread.id}-${this.selectedThread.messages.length + 1}`,
      senderKey: 'MESSAGES.SENDER_CITIZEN',
      bodyText: trimmed,
      sentAt: new Date().toLocaleDateString('es-ES')
    };
    this.selectedThread.messages = [...this.selectedThread.messages, newMessage];
    this.selectedThread.lastMessageText = trimmed;
    this.selectedThread.updatedAt = newMessage.sentAt;
    this.reply = '';
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
}
