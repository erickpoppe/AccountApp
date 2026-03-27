import { Injectable } from '@nestjs/common';
import { TableSheetPdf } from '../../common/TableSheetPdf';
import { IInventoryValuationReportQuery } from './InventoryValuationSheet.types';
import { InventoryValuationSheetTableInjectable } from './InventoryValuationSheetTableInjectable';
import { HtmlTableCustomCss } from './_constants';

@Injectable()
export class InventoryValuationSheetPdf {
  constructor(
    private readonly inventoryValuationTable: InventoryValuationSheetTableInjectable,
    private readonly tableSheetPdf: TableSheetPdf,
  ) {}

  /**
   * Converts the given balance sheet table to pdf.
   * @param {number} tenantId - Tenant ID.
   * @param {IBalanceSheetQuery} query - Balance sheet query.
   * @returns {Promise<Buffer>}
   */
  public async pdf(query: IInventoryValuationReportQuery): Promise<Buffer> {
    const table = await this.inventoryValuationTable.table(query);

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
