
export interface Suggestion {
  id: string;
  type: 'Spelling' | 'Grammar' | 'Sandhi';
  original: string;
  suggestion: string;
  reason: string;
}

export interface GrammarResponse {
  correctedText: string;
  suggestions: Suggestion[];
}

export interface Lead {
  id?: string;
  email: string;
  created_at?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
