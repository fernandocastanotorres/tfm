export interface NotificationInboxItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  caseId: string;
  recordNumber?: string | null;
  caseTitle: string;
  typeKey: string;
}

export interface DashboardNotificationItem {
  id: string;
  message: string;
  date: string;
  caseId: string;
  caseTitle: string;
  recordNumber?: string | null;
}
