import { TableSheetPdf } from '../../common/TableSheetPdf';
import { InventoryDetailsTableInjectable } from './InventoryItemDetailsTableInjectable';
import { IInventoryDetailsQuery } from './InventoryItemDetails.types';
import { HtmlTableCustomCss } from './constant';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryDetailsTablePdf {
  /***
   * Constructor method.
   * @param {InventoryDetailsTableInjectable} inventoryDetailsTable - Inventory details table injectable.
   * @param {TableSheetPdf} tableSheetPdf - Table sheet pdf.
   */
  constructor(
    private readonly inventoryDetailsTable: InventoryDetailsTableInjectable,
    private readonly tableSheetPdf: TableSheetPdf,
  ) {}

  /**
   * Converts the given inventory details sheet table to pdf.
   * @param {IBalanceSheetQuery} query - Balance sheet query.
   * @returns {Promise<Buffer>}
   */
  public async pdf(query: IInventoryDetailsQuery): Promise<Buffer> {
    const table = await this.inventoryDetailsTable.table(query);

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
