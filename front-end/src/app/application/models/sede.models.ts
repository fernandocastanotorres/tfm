/**
 * Models for sede electronica public pages.
 */

export interface FaqCategory {
  id: string;
  name: string;
  code: string;
  icon: string;
}

export interface FaqItem {
  id: string;
  categoryCode: string;
  question: string;
  answer: string;
}

export interface ContactOffice {
  id: string;
  nameKey: string;
  addressKey: string;
  phone: string;
  email: string;
  scheduleKey: string;
  mapUrl?: string;
}

export interface ContactChannel {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  link?: string;
}

export interface ServiceStatusItem {
  id: string;
  nameKey: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  descriptionKey: string;
  lastUpdated: string;
}

export interface OrganismItem {
  id: string;
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  websiteUrl?: string;
}

export interface TransparencyMetric {
  id: string;
  labelKey: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface TransparencyReport {
  id: string;
  titleKey: string;
  title?: string;
  year: number;
  descriptionKey: string;
  description?: string;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'holiday' | 'info' | 'reminder';
  description: string;
  relatedProcedure?: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  relatedTerms?: string[];
}

export interface LegislationItem {
  id: string;
  title: string;
  type: 'law' | 'decree' | 'order' | 'resolution';
  date: string;
  description: string;
  downloadUrl?: string;
  externalUrl?: string;
}

export interface InstitutionalSection {
  id: string;
  title: string;
  content: string;
  icon?: string;
}

export interface SitemapSection {
  id: string;
  titleKey: string;
  links: SitemapLink[];
}

export interface SitemapLink {
  labelKey: string;
  route: string;
}

export interface ThemeColor {
  token: string;
  value: string;
}

export interface ThemePalette {
  colors: ThemeColor[];
  updatedAt: string | null;
}
