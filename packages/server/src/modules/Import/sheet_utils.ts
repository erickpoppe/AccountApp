import * as XLSX from 'xlsx';
import { first } from 'lodash';

/**
 * Parses the given sheet buffer to worksheet.
 * @param {Buffer} buffer
 * @returns {XLSX.WorkSheet}
 */
export function parseFirstSheet(buffer: Buffer): XLSX.WorkSheet {
  const workbook = XLSX.read(buffer, { type: 'buffer', raw: true });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  return worksheet;
}

/**
 * Extracts the given worksheet to columns.
 * @param {XLSX.WorkSheet} worksheet
 * @returns {Array<string>}
 */
export function extractSheetColumns(worksheet: XLSX.WorkSheet): Array<string> {
  // By default, sheet_to_json scans the first row and uses the values as headers.
  // With the header: 1 option, the function exports an array of arrays of values.
  const sheetCells = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const sheetCols = first(sheetCells) as Array<string>;

  return sheetCols.filter((col) => col);
}

/**
 * Parses the given worksheet to json values. the keys are columns labels.
 * @param {XLSX.WorkSheet} worksheet
 * @returns {Array<Record<string, string>>}
 */
export function parseSheetToJson(
  worksheet: XLSX.WorkSheet
): Array<Record<string, string>> {
  return XLSX.utils.sheet_to_json(worksheet, {});
}

/**
 * Parses the given sheet buffer then retrieves the sheet data and columns.
 * @param {Buffer} buffer
 */
export function parseSheetData(
  buffer: Buffer
): [Array<Record<string, string>>, string[]] {
  const worksheet = parseFirstSheet(buffer);

  const columns = extractSheetColumns(worksheet);
  const data = parseSheetToJson(worksheet);

  return [data, columns];
}

/**
 * Detects if a buffer is a QBO/OFX file.
 */
export function isQBOBuffer(buffer: Buffer): boolean {
  const start = buffer.toString('utf-8', 0, 100);
  return start.includes('OFXHEADER') || start.includes('<OFX>');
}

/**
 * Parses QBO/OFX buffer into sheet-compatible rows and columns.
 */
export function parseQBOBuffer(buffer: Buffer): [Array<Record<string, string>>, string[]] {
  const content = buffer.toString('utf-8');
  const columns = ['Date', 'Amount', 'Description', 'Payee', 'ReferenceNo'];
  const transactions: Array<Record<string, string>> = [];
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  const extractField = (block: string, field: string): string => {
    const regex = new RegExp(`<${field}>([^<\\n\\r]+)`, 'i');
    const m = regex.exec(block);
    return m ? m[1].trim() : '';
  };

  while ((match = stmtTrnRegex.exec(content)) !== null) {
    const block = match[1];
    let date = extractField(block, 'DTPOSTED');
    if (date.length >= 8) {
      date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    }
    transactions.push({
      Date: date,
      Amount: extractField(block, 'TRNAMT'),
      Description: extractField(block, 'MEMO') || extractField(block, 'n'),
      Payee: extractField(block, 'n') || extractField(block, 'NAME'),
      ReferenceNo: extractField(block, 'FITID'),
    });
  }
  return [transactions, columns];
}

/**
 * Auto-detects file type and parses accordingly.
 */
export function parseFileBuffer(buffer: Buffer): [Array<Record<string, string>>, string[]] {
  if (isQBOBuffer(buffer)) {
    return parseQBOBuffer(buffer);
  }
  return parseSheetData(buffer);
}
