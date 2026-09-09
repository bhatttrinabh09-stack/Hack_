export type UrgencyTier = 'high' | 'medium' | 'low';

export interface User {
  id: string;
  email: string;
  name: string;
  branch?: string;
  semester?: number;
}

export interface PanicSession {
  id: string;
  examInValue: number;
  examInUnit: string;
  urgencyLevel: UrgencyTier;
  deadline: string;
}

export interface Subject {
  id: string;
  name: string;
  branch: string;
  semester: number;
  enabled: boolean;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  importance_score?: number;
  is_must_ask?: boolean;
  description?: string;
}

export interface SwipeCard {
  id: string;
  type: string;
  title: string;
  preview: string;
  thumbnailUrl?: string | null;
}

export interface ContentAsset {
  id: string;
  topic_id?: string;
  asset_type?: string;
  type?: string;
  title?: string;
  content_url?: string;
  content_body?: string;
  est_minutes?: number;
  payload?: any;
}

export interface SwipeEvent {
  id?: string;
  topicId: string;
  cardId?: string;
  cardType?: string;
  direction: 'right' | 'left';
  timeSpent?: number;
}

