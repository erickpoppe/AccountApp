import { TableSheetPdf } from '../../common/TableSheetPdf';
import { ITrialBalanceSheetQuery } from './TrialBalanceSheet.types';
import { TrialBalanceSheetTableInjectable } from './TrialBalanceSheetTableInjectable';
import { HtmlTableCustomCss } from './_constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TrialBalanceSheetPdfInjectable {
  constructor(
    private readonly trialBalanceSheetTable: TrialBalanceSheetTableInjectable,
    private readonly tableSheetPdf: TableSheetPdf,
  ) { }

  /**
   * Converts the given trial balance sheet table to pdf.
   * @param {ITrialBalanceSheetQuery} query - Trial balance sheet query.
   * @returns {Promise<Buffer>}
   */
  public async pdf(query: ITrialBalanceSheetQuery): Promise<Buffer> {
    const table = await this.trialBalanceSheetTable.table(query);

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
