import { Injectable } from '@nestjs/common';
import { AccountCandidate } from './AccountCandidatesService.service';
import { PriorRow } from './HistoryPriorService.service';

@Injectable()
export class PromptBuilderService {
  build(
    tx: { description?: string; payee?: string; amount: number; date: Date | string },
    candidates: AccountCandidate[],
    prior: PriorRow[],
  ): string {
    const direction = tx.amount < 0 ? 'withdrawal' : 'deposit';
    const payload = {
      transaction: {
        description: tx.description ?? null,
        payee: tx.payee ?? null,
        amount: Math.abs(tx.amount),
        direction,
      },
      candidate_accounts: candidates.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.accountType,
      })),
      historical_matches: prior.slice(0, 3).map((p) => ({
        creditAccountId: p.creditAccountId,
        occurrences: p.freq,
      })),
      instructions: [
        'Choose the best matching account from candidate_accounts.',
        'creditAccountId MUST be one of the id values in candidate_accounts.',
        'Set confidence to high if you are very sure, medium if unsure, low if guessing.',
        'Keep reasoning under 120 characters.',
      ],
      output_schema: {
        creditAccountId: 'integer (from candidate_accounts)',
        confidence: '"low" | "medium" | "high"',
        reasoning: 'string',
        payee: 'string | null',
        memo: 'string | null',
      },
    };
    return (
      'You are a bookkeeping assistant. Given a bank transaction, choose the most ' +
      'appropriate chart-of-accounts category. Respond ONLY with valid JSON matching ' +
      'output_schema. Never invent account IDs.\n\n' +
      JSON.stringify(payload)
    );
  }
}
