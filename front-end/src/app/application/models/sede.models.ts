/**
 * Models for sede electronica public pages.
 */

export interface FaqCategory {
  id: string;
  nameKey: string;
  icon: string;
}

export interface FaqItem {
  id: string;
  categoryId: string;
  questionKey: string;
  answerKey: string;
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
  nameKey: string;
  descriptionKey: string;
  categoryKey: string;
  phone: string;
  email: string;
  addressKey: string;
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
  year: number;
  descriptionKey: string;
  downloadUrl?: string;
}

export interface CalendarEvent {
  id: string;
  titleKey: string;
  date: string;
  type: 'deadline' | 'holiday' | 'info' | 'reminder';
  descriptionKey: string;
  relatedProcedure?: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definitionKey: string;
  relatedTerms?: string[];
}

export interface LegislationItem {
  id: string;
  titleKey: string;
  type: 'law' | 'decree' | 'order' | 'resolution';
  date: string;
  descriptionKey: string;
  downloadUrl?: string;
  externalUrl?: string;
}

export interface InstitutionalSection {
  id: string;
  titleKey: string;
  contentKey: string;
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
