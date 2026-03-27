import { Injectable } from '@nestjs/common';
import { TableSheetPdf } from '../../common/TableSheetPdf';
import { ICashFlowStatementQuery } from './Cashflow.types';
import { CashflowTableInjectable } from './CashflowTableInjectable';
import { HtmlTableCustomCss } from './constants';

@Injectable()
export class CashflowTablePdfInjectable {
  constructor(
    private readonly cashflowTable: CashflowTableInjectable,
    private readonly tableSheetPdf: TableSheetPdf,
  ) {}

  /**
   * Converts the given cashflow sheet table to pdf.
   * @param {number} tenantId - Tenant ID.
   * @param {IBalanceSheetQuery} query - Balance sheet query.
   * @returns {Promise<Buffer>}
   */
  public async pdf(query: ICashFlowStatementQuery): Promise<Buffer> {
    const table = await this.cashflowTable.table(query);

    const timestamp = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const footerText = timestamp;
    return this.tableSheetPdf.convertToPdf(
      table.table,
      table.meta.organizationName,
      table.meta.sheetName,
      table.meta.formattedDateRange,
      HtmlTableCustomCss,
      footerText,
    );
  }
}
