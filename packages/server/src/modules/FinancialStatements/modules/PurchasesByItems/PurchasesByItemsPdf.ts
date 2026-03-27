import { Injectable } from '@nestjs/common';
import { TableSheetPdf } from '../../common/TableSheetPdf';
import { PurchasesByItemsTableInjectable } from './PurchasesByItemsTableInjectable';
import { IPurchasesByItemsReportQuery } from './types/PurchasesByItems.types';
import { HtmlTableCustomCss } from './_types';

@Injectable()
export class PurchasesByItemsPdf {
  constructor(
    private readonly purchasesByItemsTable: PurchasesByItemsTableInjectable,
    private readonly tableSheetPdf: TableSheetPdf,
  ) {}

  /**
   * Converts the given journal sheet table to pdf.
   * @param {IBalanceSheetQuery} query - Balance sheet query.
   * @returns {Promise<Buffer>}
   */
  public async pdf(
    query: IPurchasesByItemsReportQuery,
  ): Promise<Buffer> {
    const table = await this.purchasesByItemsTable.table(query);

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
