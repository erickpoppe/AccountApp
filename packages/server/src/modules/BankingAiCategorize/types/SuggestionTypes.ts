export type AiConfidence = 'low' | 'medium' | 'high';
export type AiSource = 'history' | 'llm';

export interface AiCategorySuggestion {
  creditAccountId: number | null;
  creditAccountName: string;
  payee: string | null;
  memo: string | null;
  confidence: AiConfidence;
  reasoning: string;
  source: AiSource;
  autoFill?: boolean;
  cleanPayee?: boolean;
  contactId?: number | null;
  contactTransactionType?: string;
}
