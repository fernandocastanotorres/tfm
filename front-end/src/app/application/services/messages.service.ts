import { Injectable } from '@angular/core';

export interface MessageThread {
  id: string;
  subjectKey: string;
  lastMessageKey?: string;
  lastMessageText?: string;
  updatedAt: string;
  unread: boolean;
  caseId: string;
  caseTitleKey: string;
  messages: MessageItem[];
}

export interface MessageItem {
  id: string;
  senderKey: string;
  bodyKey?: string;
  bodyText?: string;
  sentAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  getThreads(): MessageThread[] {
    return [
      {
        id: 'MSG-1',
        subjectKey: 'MESSAGES.MOCK_SUBJECT_LICENSE',
        lastMessageKey: 'MESSAGES.MOCK_MESSAGE_RECEIVED',
        updatedAt: '14/05/2026',
        unread: true,
        caseId: 'EXP-2026-001',
        caseTitleKey: 'CASE_DETAIL.MOCK_LICENSE_TITLE',
        messages: [
          {
            id: 'MSG-1-1',
            senderKey: 'MESSAGES.SENDER_OFFICE',
            bodyKey: 'MESSAGES.MOCK_MESSAGE_RECEIVED',
            sentAt: '14/05/2026'
          }
        ]
      },
      {
        id: 'MSG-2',
        subjectKey: 'MESSAGES.MOCK_SUBJECT_DOCUMENTS',
        lastMessageKey: 'MESSAGES.MOCK_MESSAGE_PENDING',
        updatedAt: '12/05/2026',
        unread: false,
        caseId: 'EXP-2026-002',
        caseTitleKey: 'DASHBOARD.CASES_TITLE',
        messages: [
          {
            id: 'MSG-2-1',
            senderKey: 'MESSAGES.SENDER_OFFICE',
            bodyKey: 'MESSAGES.MOCK_MESSAGE_PENDING',
            sentAt: '12/05/2026'
          }
        ]
      }
    ];
  }
}
