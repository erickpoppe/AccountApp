import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { sumBy } from 'lodash';
import { BankTransaction } from '@/modules/BankingTransactions/models/BankTransaction';
import { BankReconciliation } from '../models/BankReconciliation';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

@Injectable()
export class FinishReconciliationService {
  constructor(
    @Inject(BankTransaction.name)
    private readonly bankTxModel: TenantModelProxy<typeof BankTransaction>,

    @Inject(BankReconciliation.name)
    private readonly reconciliationModel: TenantModelProxy<
      typeof BankReconciliation
    >,
  ) {}

  async finish(
    accountId: number,
    statementDate: string,
    statementClosingBalance: number,
    userId: number,
  ) {
    const dateStr = moment(statementDate).format('YYYY-MM-DD');

    // Collect all cleared-but-not-yet-reconciled transactions for this account
    // up to the statement date.
    const clearedTxs = await this.bankTxModel()
      .query()
      .where('cashflow_account_id', accountId)
      .where('is_cleared', true)
      .where('is_reconciled', false)
      .where('date', '<=', dateStr);

    // Opening balance from last completed reconciliation.
    const lastReconciliation = await this.reconciliationModel()
      .query()
      .where('cashflow_account_id', accountId)
      .where('status', 'completed')
      .orderBy('statement_date', 'desc')
      .first();

    const openingBalance = Number(lastReconciliation?.closingBalance ?? 0);

    const deposits = clearedTxs.filter((t) => (t as any).amount > 0);
    const payments = clearedTxs.filter((t) => (t as any).amount < 0);
    const closingBalance =
      openingBalance +
      sumBy(deposits, 'amount') -
      Math.abs(sumBy(payments, 'amount'));

    // Create reconciliation record.
    const reconciliation = await this.reconciliationModel()
      .query()
      .insert({
        cashflowAccountId: accountId,
        statementDate: dateStr,
        statementClosingBalance,
        openingBalance,
        closingBalance,
        status: 'completed',
        createdByUserId: userId,
      } as any);

    // Mark cleared transactions as reconciled and link to this reconciliation.
    if (clearedTxs.length > 0) {
      const ids = clearedTxs.map((t) => (t as any).id);
      await this.bankTxModel()
        .query()
        .patch({
          isReconciled: true,
          reconciliationId: reconciliation.id,
        } as any)
        .whereIn('id', ids);
    }

    return {
      id: reconciliation.id,
      accountId,
      statementDate: dateStr,
      statementClosingBalance,
      openingBalance,
      closingBalance,
      reconciledCount: clearedTxs.length,
    };
  }
}
