import { TableSheetPdf } from '../../common/TableSheetPdf';
import { IBalanceSheetQuery } from './BalanceSheet.types';
import { BalanceSheetTableInjectable } from './BalanceSheetTableInjectable';
import { HtmlTableCustomCss } from './constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BalanceSheetPdfInjectable {
  constructor(
    private readonly balanceSheetTable: BalanceSheetTableInjectable,
    private readonly tableSheetPdf: TableSheetPdf,
  ) { }

  /**
   * Converts the given balance sheet table to pdf.
   * @param {IBalanceSheetQuery} query - Balance sheet query.
   * @returns {Promise<Buffer>}
   */
  public async pdf(query: IBalanceSheetQuery): Promise<Buffer> {
    const table = await this.balanceSheetTable.table(query);

    const basis = query.basis ? 'Accounting basis: ' + query.basis.charAt(0).toUpperCase() + query.basis.slice(1) : '';
    const timestamp = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const footerText = [basis, timestamp].filter(Boolean).join('    ');
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
