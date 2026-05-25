export interface MessageThreadSummary {
  id: string;
  procedureId: string;
  recordNumber?: string | null;
  caseTitle: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  totalMessages: number;
}

export interface MessageAttachmentDto {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface MessageDto {
  id: string;
  threadId: string;
  senderRole: string;
  senderName: string;
  senderEmail: string;
  content: string;
  templateKey: string | null;
  read: boolean;
  readAt: string | null;
  attachmentCount: number;
  attachments: MessageAttachmentDto[];
  createdAt: string;
}

export interface PagedMessages {
  messages: MessageDto[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
