
export interface Suggestion {
  id: string;
  type: 'Spelling' | 'Grammar' | 'Sandhi';
  original: string;
  suggestion: string;
  reason: string;
  index?: number; // Starting index in the text for highlighting
  length?: number; // Length of the original text
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

export type AIModel = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
