import { TableSheetPdf } from '../../common/TableSheetPdf';
import { GeneralLedgerTableInjectable } from './GeneralLedgerTableInjectable';
import { IGeneralLedgerSheetQuery } from './GeneralLedger.types';
import { HtmlTableCustomCss } from './constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeneralLedgerPdf {
  constructor(
    private readonly generalLedgerTable: GeneralLedgerTableInjectable,
    private readonly tableSheetPdf: TableSheetPdf,
  ) {}

  /**
   * Converts the general ledger sheet table to pdf.
   * @param {IGeneralLedgerSheetQuery} query - General ledger sheet query.
   * @returns {Promise<Buffer>}
   */
  public async pdf(query: IGeneralLedgerSheetQuery): Promise<Buffer> {
    const table = await this.generalLedgerTable.table(query);

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
