import { sumBy } from 'lodash';
import { Transformer } from '@/modules/Transformer/Transformer';

export class GetAutofillCategorizeTransctionTransformer extends Transformer {
  /**
   * Included attributes to the object.
   * @returns {Array}
   */
  public includeAttributes = (): string[] => {
    return [
      'amount',
      'formattedAmount',
      'isRecognized',
      'date',
      'formattedDate',
      'creditAccountId',
      'debitAccountId',
      'contactId',
      'referenceNo',
      'description',
      'transactionType',
      'recognizedByRuleId',
      'recognizedByRuleName',
      'isWithdrawalTransaction',
      'isDepositTransaction',
      'isAiSuggested',
      'isHistoryAutoFill',
      'aiSuggestedAccountId',
      'aiSuggestedAccountName',
      'aiSuggestedPayee',
      'aiSuggestedMemo',
      'aiConfidence',
      'aiReasoning',
      'aiSource',
    ];
  };

  /**
   * Detarmines whether the transaction is recognized.
   * @returns {boolean}
   */
  public isRecognized() {
    return !!this.options.firstUncategorizedTransaction?.recognizedTransaction;
  }

  /**
   * Retrieves the total amount of uncategorized transactions.
   * @returns {number}
   */
  public amount() {
    return sumBy(this.options.uncategorizedTransactions, 'amount');
  }

  /**
   * Retrieves the formatted total amount of uncategorized transactions.
   * @returns {string}
   */
  public formattedAmount() {
    return this.formatNumber(this.amount(), {
      currencyCode: 'USD',
      money: true,
    });
  }

  /**
   * Detarmines whether the transaction is deposit.
   * @returns {boolean}
   */
  public isDepositTransaction() {
    const amount = this.amount();

    return amount > 0;
  }

  /**
   * Detarmines whether the transaction is withdrawal.
   * @returns {boolean}
   */
  public isWithdrawalTransaction() {
    const amount = this.amount();

    return amount < 0;
  }

  /**
   *
   * @param {string}
   */
  public date() {
    return this.options.firstUncategorizedTransaction?.date || null;
  }

  /**
   * Retrieves the formatted date of uncategorized transaction.
   * @returns {string}
   */
  public formattedDate() {
    return this.formatDate(this.date());
  }

  /**
   *
   * @param {string}
   */
  public referenceNo() {
    return this.options.firstUncategorizedTransaction?.referenceNo || null;
  }

  public description() {
    return this.options.firstUncategorizedTransaction?.description || null;
  }

  /**
   *
   * @returns {number}
   */
  public creditAccountId() {
    if (this.options.aiSuggestion?.autoFill && this.options.aiSuggestion?.creditAccountId) {
      return this.options.aiSuggestion.creditAccountId;
    }
    return (
      this.options.firstUncategorizedTransaction?.recognizedTransaction
        ?.assignedAccountId || null
    );
  }

  public isHistoryAutoFill() {
    return !!this.options.aiSuggestion?.autoFill;
  }

  /**
   *
   * @returns {number}
   */
  public debitAccountId() {
    return this.options.firstUncategorizedTransaction?.accountId || null;
  }

  public contactId() {
    if (this.options.aiSuggestion?.contactId) {
      return this.options.aiSuggestion.contactId;
    }
    return (
      this.options.firstUncategorizedTransaction?.recognizedTransaction
        ?.assignedContactId || null
    );
  }

  /**
   * Retrieves the assigned category of recognized transaction, if is not recognized
   * returns the default transaction type depends on the transaction normal.
   * @returns {string}
   */
  public transactionType() {
    const assignedCategory =
      this.options.firstUncategorizedTransaction?.recognizedTransaction
        ?.assignedCategory;

    if (assignedCategory) return assignedCategory;

    if (this.options.aiSuggestion?.contactTransactionType) {
      return this.options.aiSuggestion.contactTransactionType;
    }

    return this.isDepositTransaction() ? 'other_income' : 'other_expense';
  }

  /**
   *
   * @returns {string}
   */
  public payee() {
    return (
      this.options.firstUncategorizedTransaction?.recognizedTransaction
        ?.assignedPayee || null
    );
  }

  /**
   *
   * @returns {string}
   */
  public memo() {
    return (
      this.options.firstUncategorizedTransaction?.recognizedTransaction
        ?.assignedMemo || null
    );
  }

  /**
   * Retrieves the rule id the transaction recongized by.
   * @returns {string}
   */
  public recognizedByRuleId() {
    return (
      this.options.firstUncategorizedTransaction?.recognizedTransaction
        ?.bankRuleId || null
    );
  }

  /**
   * Retrieves the rule name the transaction recongized by.
   * @returns {string}
   */
  public recognizedByRuleName() {
    return (
      this.options.firstUncategorizedTransaction?.recognizedTransaction
        ?.bankRule?.name || null
    );
  }

  public isAiSuggested() {
    return !!this.options.aiSuggestion;
  }

  public aiSuggestedAccountId() {
    return this.options.aiSuggestion?.creditAccountId ?? null;
  }

  public aiSuggestedAccountName() {
    return this.options.aiSuggestion?.creditAccountName ?? null;
  }

  public aiSuggestedPayee() {
    return this.options.aiSuggestion?.payee ?? null;
  }

  public aiSuggestedMemo() {
    return this.options.aiSuggestion?.memo ?? null;
  }

  public aiConfidence() {
    return this.options.aiSuggestion?.confidence ?? null;
  }

  public aiReasoning() {
    return this.options.aiSuggestion?.reasoning ?? null;
  }

  public aiSource() {
    return this.options.aiSuggestion?.source ?? null;
  }
}
