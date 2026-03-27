import { ISalesByItemsReportQuery } from './SalesByItems.types';
import { SalesByItemsTableInjectable } from './SalesByItemsTableInjectable';
import { TableSheetPdf } from '../../common/TableSheetPdf';
import { HtmlTableCustomCss } from './constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SalesByItemsPdfInjectable {
  constructor(
    private readonly salesByItemsTable: SalesByItemsTableInjectable,
    private readonly tableSheetPdf: TableSheetPdf,
  ) { }

  /**
   * Retrieves the sales by items sheet in pdf format.
   * @param {ISalesByItemsReportQuery} query - The query to apply to the report.
   * @returns {Promise<Buffer>}
   */
  public async pdf(
    query: ISalesByItemsReportQuery,
  ): Promise<Buffer> {
    const table = await this.salesByItemsTable.table(query);

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
