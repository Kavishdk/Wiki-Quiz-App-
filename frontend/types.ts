
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: Difficulty;
  explanation: string;
  section?: string;
}

export interface KeyEntities {
  people: string[];
  organizations: string[];
  locations: string[];
}

export interface WikiData {
  id: number;
  url: string;
  title: string;
  summary: string;
  key_entities?: KeyEntities;
  sections: string[];
  quiz: QuizQuestion[];
  related_topics: string[];
  created_at?: string;
  timestamp?: number; // For backwards compatibility
}

export enum Tab {
  GENERATE = 'generate',
  HISTORY = 'history'
}
