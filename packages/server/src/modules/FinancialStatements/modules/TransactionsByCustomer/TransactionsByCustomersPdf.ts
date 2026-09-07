import { TableSheetPdf } from '../../common/TableSheetPdf';
import { ITransactionsByCustomersFilter } from './TransactionsByCustomer.types';
import { Injectable } from '@nestjs/common';
import { TransactionsByCustomersTableInjectable } from './TransactionsByCustomersTableInjectable';

@Injectable()
export class TransactionsByCustomersPdf {
  constructor(
    private readonly transactionsByCustomersTable: TransactionsByCustomersTableInjectable,
    private readonly tableSheetPdf: TableSheetPdf,
  ) { }

  /**
   * Retrieves the transactions by customers in PDF format.
   * @param {ITransactionsByCustomersFilter} query - Transactions by customers filter.
   * @returns {Promise<Buffer>}
   */
  public async pdf(query: ITransactionsByCustomersFilter): Promise<Buffer> {
    const table = await this.transactionsByCustomersTable.table(query);

    const timestamp = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return this.tableSheetPdf.convertToPdf(
      table.table,
      table.meta.organizationName,
      table.meta.sheetName,
      table.meta.formattedDateRange,
      undefined,
      timestamp,
    );
  }
}
