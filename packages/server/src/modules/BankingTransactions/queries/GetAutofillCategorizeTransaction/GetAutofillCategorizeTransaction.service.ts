import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { castArray, first, uniq } from 'lodash';
import { GetAutofillCategorizeTransctionTransformer } from './GetAutofillCategorizeTransactionTransformer';
import { UncategorizedBankTransaction } from '@/modules/BankingTransactions/models/UncategorizedBankTransaction';
import { TransformerInjectable } from '@/modules/Transformer/TransformerInjectable.service';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import { SuggestCategoryService } from '@/modules/BankingAiCategorize/services/SuggestCategoryService.service';

@Injectable()
export class GetAutofillCategorizeTransactionService {
  private readonly logger = new Logger(GetAutofillCategorizeTransactionService.name);

  constructor(
    private readonly transformer: TransformerInjectable,
    private readonly config: ConfigService,
    private readonly suggestCategory: SuggestCategoryService,

    @Inject(UncategorizedBankTransaction.name)
    private readonly uncategorizedBankTransactionModel: TenantModelProxy<
      typeof UncategorizedBankTransaction
    >,
  ) {}

  /**
   * Retrieves the autofill values of categorize transactions form.
   * @param {Array<number> | number} uncategorizeTransactionsId - Uncategorized transactions ids.
   */
  public async getAutofillCategorizeTransaction(
    uncategorizeTransactionsId: Array<number> | number,
  ) {
    const uncategorizeTransactionsIds = uniq(
      castArray(uncategorizeTransactionsId),
    );
    const uncategorizedTransactions =
      await this.uncategorizedBankTransactionModel()
        .query()
        .whereIn('id', uncategorizeTransactionsIds)
        .withGraphFetched('recognizedTransaction.assignAccount')
        .withGraphFetched('recognizedTransaction.bankRule')
        .throwIfNotFound();

    const firstTx = first(uncategorizedTransactions);
    const aiEnabled = this.config.get<boolean>('bankingAi.enabled');
    const isSingleRow = uncategorizedTransactions.length === 1;
    const isAlreadyRecognized = !!firstTx?.recognizedTransaction;

    this.logger.debug(`AI autofill: enabled=${aiEnabled} single=${isSingleRow} recognized=${isAlreadyRecognized}`);

    const aiSuggestion =
      aiEnabled && isSingleRow && !isAlreadyRecognized && firstTx
        ? await this.suggestCategory.suggest(firstTx)
        : null;

    this.logger.debug(`AI autofill: suggestion=${JSON.stringify(aiSuggestion)}`);

    // When a customer name was matched, write the cleaned name back to the payee
    // column so the transactions list shows just the customer name.
    if (aiSuggestion?.cleanPayee && aiSuggestion?.payee && firstTx) {
      await this.uncategorizedBankTransactionModel()
        .query()
        .patch({ payee: aiSuggestion.payee })
        .where('id', firstTx.id);
    }

    return this.transformer.transform(
      {},
      new GetAutofillCategorizeTransctionTransformer(),
      {
        uncategorizedTransactions,
        firstUncategorizedTransaction: firstTx,
        aiSuggestion,
      },
    );
  }
}
