import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UncategorizedBankTransaction } from '@/modules/BankingTransactions/models/UncategorizedBankTransaction';
import { OllamaClientService } from './OllamaClient.service';
import { HistoryPriorService } from './HistoryPriorService.service';
import { AccountCandidatesService } from './AccountCandidatesService.service';
import { PromptBuilderService } from './PromptBuilder.service';
import { CustomerMatchService } from './CustomerMatchService.service';
import { parseSafe } from '../schemas/LlmSuggestion.schema';
import { AiCategorySuggestion } from '../types/SuggestionTypes';
import { ACCOUNT_TYPE } from '@/constants/accounts';

const INCOME_TYPES = new Set([ACCOUNT_TYPE.INCOME, ACCOUNT_TYPE.OTHER_INCOME]);

@Injectable()
export class SuggestCategoryService {
  private readonly logger = new Logger(SuggestCategoryService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly ollama: OllamaClientService,
    private readonly historyPrior: HistoryPriorService,
    private readonly accountCandidates: AccountCandidatesService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly customerMatch: CustomerMatchService,
  ) {}

  /**
   * Suggests a chart-of-accounts category for an uncategorized bank transaction.
   * Never throws — returns null on any failure or when AI is disabled.
   */
  async suggest(
    tx: InstanceType<typeof UncategorizedBankTransaction>,
  ): Promise<AiCategorySuggestion | null> {
    try {
      const isDeposit = tx.amount > 0;

      // Fast path: consistent 2-word payee key match → auto-fill directly
      const consistentAccountId = await this.historyPrior.fetchConsistentMatch(tx);
      if (consistentAccountId != null) {
        const candidates = await this.accountCandidates.fetch(isDeposit, [consistentAccountId]);
        const account = this.accountCandidates.buildMap(candidates).get(consistentAccountId);
        if (account) {
          return {
            creditAccountId: account.id,
            creditAccountName: account.name,
            payee: tx.payee ?? null,
            memo: null,
            confidence: 'high',
            reasoning: 'Auto-filled from transaction history',
            source: 'history',
            autoFill: true,
          };
        }
      }

      // Customer name match → clean description; auto-fill account if history is consistent
      const customer = await this.customerMatch.match(tx.payee ?? '', tx.description ?? '');
      if (customer) {
        const consistentId = await this.historyPrior.fetchConsistentMatchByText(
          customer.displayName,
          tx.accountId,
          1,
        );
        let creditAccount = null;
        if (consistentId) {
          const candidates = await this.accountCandidates.fetch(isDeposit, [consistentId]);
          creditAccount = this.accountCandidates.buildMap(candidates).get(consistentId) ?? null;
        }
        return {
          creditAccountId: creditAccount?.id ?? null,
          creditAccountName: creditAccount?.name ?? '',
          payee: customer.displayName,
          memo: null,
          confidence: creditAccount ? 'high' : 'low',
          reasoning: 'Matched registered customer name',
          source: 'history',
          autoFill: !!creditAccount,
          cleanPayee: true,
          contactId: customer.id,
          contactTransactionType: isDeposit ? 'customer_payment' : 'vendor_payment',
        };
      }

      const prior = await this.historyPrior.fetchPrior(tx);

      // Build accounts map from candidates + history-prior accounts
      const priorIds = prior.map((p) => p.creditAccountId);
      const candidates = await this.accountCandidates.fetch(isDeposit, priorIds);
      const accountMap = this.accountCandidates.buildMap(candidates);

      // Short-circuit: use history prior if confident enough
      if (this.historyPrior.meetsThreshold(prior)) {
        const top = prior[0];
        const account = accountMap.get(top.creditAccountId);
        if (account) {
          return {
            creditAccountId: account.id,
            creditAccountName: account.name,
            payee: tx.payee ?? null,
            memo: null,
            confidence: 'high',
            reasoning: `Matches ${top.freq} past transaction${top.freq > 1 ? 's' : ''} with the same payee`,
            source: 'history',
          };
        }
      }

      // Fall through to LLM
      const prompt = this.promptBuilder.build(tx, candidates, prior);
      const rawResponse = await this.ollama.generate(prompt);
      if (!rawResponse) return null;

      const candidateIds = new Set(candidates.map((c) => c.id));
      const parsed = parseSafe(rawResponse, candidateIds);
      if (!parsed) {
        // Fallback: use top history prior at low confidence if available
        if (prior.length > 0) {
          const account = accountMap.get(prior[0].creditAccountId);
          if (account) {
            return {
              creditAccountId: account.id,
              creditAccountName: account.name,
              payee: parsed?.payee ?? null,
              memo: parsed?.memo ?? null,
              confidence: 'low',
              reasoning: 'AI response could not be parsed; using top historical match',
              source: 'history',
            };
          }
        }
        return null;
      }

      const account = accountMap.get(parsed.creditAccountId);
      if (!account) return null;

      // Derive transaction-type from the account's type (avoids LLM hallucinating tx type)
      const transactionType = INCOME_TYPES.has(account.accountType as any)
        ? 'other_income'
        : 'other_expense';

      return {
        creditAccountId: account.id,
        creditAccountName: account.name,
        payee: parsed.payee ?? null,
        memo: parsed.memo ?? null,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning ?? '',
        source: 'llm',
      };
    } catch (err) {
      this.logger.debug(`AI suggestion failed: ${(err as Error).message}`);
      return null;
    }
  }
}
