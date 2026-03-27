import { Knex } from 'knex';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BankTransaction } from '@/modules/BankingTransactions/models/BankTransaction';
import { CreateExpense } from '@/modules/Expenses/commands/CreateExpense.service';
import { Inject } from '@nestjs/common';
import { UnitOfWork } from '@/modules/Tenancy/TenancyDB/UnitOfWork.service';
import { Injectable } from '@nestjs/common';
import { events } from '@/common/events/events';
import {
  ICashflowTransactionCategorizedPayload,
  ICategorizeCashflowTransactioDTO,
} from '../types/BankingCategorize.types';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

@Injectable()
export class CategorizeTransactionAsExpense {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly eventPublisher: EventEmitter2,
    private readonly createExpenseService: CreateExpense,

    @Inject(BankTransaction.name)
    private readonly bankTransactionModel: TenantModelProxy<
      typeof BankTransaction
    >,
  ) {}

  /**
   * Categorize the transaction as expense transaction.
   * @param {number} cashflowTransactionId
   * @param {CategorizeTransactionAsExpenseDTO} transactionDTO
   */
  public async categorize(
    cashflowTransactionId: number,
    transactionDTO: ICategorizeCashflowTransactioDTO,
  ) {
    const transaction = await this.bankTransactionModel()
      .query()
      .findById(cashflowTransactionId)
      .throwIfNotFound();

    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      // Triggers `onTransactionUncategorizing` event.
      await this.eventPublisher.emitAsync(
        events.cashflow.onTransactionCategorizingAsExpense,
        {
          trx,
        } as ICashflowTransactionCategorizedPayload,
      );
      // Creates a new expense transaction. By Erick Poppe
      // TODO: the DTO is not complete, we need to add the missing properties.
      const expenseTransaction = await this.createExpenseService.newExpense({
        paymentDate: transaction.date,
        paymentAccountId: transaction.cashflowAccountId,
        description: transactionDTO.description || transaction.description,
        exchangeRate: transactionDTO.exchangeRate || transaction.exchangeRate,
        currencyCode: transactionDTO.currencyCode || transaction.currencyCode,
        branchId: transactionDTO.branchId || transaction.branchId,
        publish: true,
        categories: [{
          index: 1,
          expenseAccountId: transactionDTO.creditAccountId,
          amount: transaction.amount,
        }],
      }, trx);

      // Updates the item on the storage and fetches the updated once.
      const cashflowTransaction = await this.bankTransactionModel()
        .query(trx)
        .patchAndFetchById(cashflowTransactionId, {
          categorizeRefType: 'Expense',
          categorizeRefId: expenseTransaction.id,
          uncategorized: false,
        });
      // Triggers `onTransactionUncategorized` event.
      await this.eventPublisher.emitAsync(
        events.cashflow.onTransactionCategorizedAsExpense,
        {
          cashflowTransaction,
          trx,
        },
      );
    });
  }
}
