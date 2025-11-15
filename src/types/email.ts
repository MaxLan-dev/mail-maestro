// Email types and interfaces

export type EmailCategory = 
  | 'urgent' 
  | 'important' 
  | 'work' 
  | 'personal' 
  | 'promotions' 
  | 'spam' 
  | 'newsletter' 
  | 'social' 
  | 'uncategorized';

export type EmailPriority = 'critical' | 'high' | 'medium' | 'low' | 'trash';

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: Date;
  read: boolean;
  starred: boolean;
  email_type?: 'inbox' | 'sent';
  // AI-generated fields
  summary?: string;
  category?: EmailCategory;
  priority?: EmailPriority;
  sentiment?: 'positive' | 'neutral' | 'negative';
  actionRequired?: boolean;
  confidence?: number; // AI confidence score 0-1
}

export interface EmailAnalysis {
  summary: string;
  category: EmailCategory;
  priority: EmailPriority;
  sentiment: 'positive' | 'neutral' | 'negative';
  actionRequired: boolean;
  keyPoints: string[];
  suggestedResponse?: string;
  confidence: number;
}

export interface CategoryStats {
  category: EmailCategory;
  count: number;
  color: string;
}

