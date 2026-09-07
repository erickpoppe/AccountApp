import { Inject, Injectable } from '@nestjs/common';
import { sumBy } from 'lodash';
import * as moment from 'moment';
import { BankTransaction } from '@/modules/BankingTransactions/models/BankTransaction';
import {
  CASHFLOW_DIRECTION,
  CASHFLOW_TRANSACTION_TYPE_META,
} from '@/modules/BankingTransactions/constants';
import { BankReconciliation } from '../models/BankReconciliation';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

@Injectable()
export class GetReconciliationDataService {
  constructor(
    @Inject(BankTransaction.name)
    private readonly bankTxModel: TenantModelProxy<typeof BankTransaction>,

    @Inject(BankReconciliation.name)
    private readonly reconciliationModel: TenantModelProxy<
      typeof BankReconciliation
    >,
  ) {}

  async getData(accountId: number, statementDate: string) {
    const statementDateMoment = moment(statementDate);

    // Get all published transactions for this account up to the statement date
    // that are not yet reconciled.
    const transactions = await this.bankTxModel()
      .query()
      .where('cashflow_account_id', accountId)
      .whereNotNull('published_at')
      .where('date', '<=', statementDateMoment.format('YYYY-MM-DD'))
      .where('is_reconciled', false)
      .orderBy('date', 'asc')
      .orderBy('id', 'asc');

    // Last completed reconciliation for the opening balance.
    const lastReconciliation = await this.reconciliationModel()
      .query()
      .where('cashflow_account_id', accountId)
      .where('status', 'completed')
      .orderBy('statement_date', 'desc')
      .first();

    const openingBalance = lastReconciliation?.closingBalance ?? 0;

    const isDeposit = (t: any) =>
      CASHFLOW_TRANSACTION_TYPE_META[t.transactionType]?.direction ===
      CASHFLOW_DIRECTION.IN;

    const deposits = transactions.filter((t) => isDeposit(t));
    const payments = transactions.filter((t) => !isDeposit(t));

    const clearedDeposits = deposits.filter((t) => (t as any).isCleared);
    const clearedPayments = payments.filter((t) => (t as any).isCleared);

    const clearedDepositsTotal = sumBy(clearedDeposits, 'amount');
    const clearedPaymentsTotal = Math.abs(sumBy(clearedPayments, 'amount'));

    const clearedBalance =
      Number(openingBalance) + clearedDepositsTotal - clearedPaymentsTotal;

    return {
      accountId,
      statementDate,
      openingBalance: Number(openingBalance),
      deposits: deposits.map(this.transformTx),
      payments: payments.map(this.transformTx),
      summary: {
        clearedDepositsCount: clearedDeposits.length,
        clearedDepositsTotal,
        clearedPaymentsCount: clearedPayments.length,
        clearedPaymentsTotal,
        clearedBalance,
        openingBalance: Number(openingBalance),
      },
    };
  }

  private transformTx(tx: any) {
    return {
      id: tx.id,
      date: tx.date,
      description: tx.description,
      amount: Math.abs(tx.amount),
      isCleared: !!tx.isCleared,
      isReconciled: !!tx.isReconciled,
      transactionType: tx.transactionType,
    };
  }
}
