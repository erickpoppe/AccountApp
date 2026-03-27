import { Injectable } from '@nestjs/common';

interface QBOTransaction extends Record<string, string> {
  Date: string;
  Amount: string;
  Description: string;
  Payee: string;
  ReferenceNo: string;
}

@Injectable()
export class QBOParserService {
  public parse(buffer: Buffer): [Array<Record<string, string>>, string[]] {
    const content = buffer.toString('utf-8');
    const transactions = this.parseOFX(content);
    const columns = ['Date', 'Amount', 'Description', 'Payee', 'ReferenceNo'];
    return [transactions, columns];
  }

  private parseOFX(content: string): QBOTransaction[] {
    const transactions: QBOTransaction[] = [];
    const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;

    while ((match = stmtTrnRegex.exec(content)) !== null) {
      const block = match[1];

      let date = this.extractField(block, 'DTPOSTED') || '';
      // DTPOSTED can be 20251001120000 — take first 8 chars
      if (date.length >= 8) {
        date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
      }

      const transaction: QBOTransaction = {
        Date: date,
        Amount: this.extractField(block, 'TRNAMT') || '',
        Description: this.extractField(block, 'MEMO') || this.extractField(block, 'n') || '',
        Payee: this.extractField(block, 'n') || this.extractField(block, 'NAME') || '',
        ReferenceNo: this.extractField(block, 'FITID') || '',
      };

      transactions.push(transaction);
    }
    return transactions;
  }

  private extractField(block: string, field: string): string | null {
    const regex = new RegExp(`<${field}>([^<\\n\\r]+)`, 'i');
    const match = regex.exec(block);
    return match ? match[1].trim() : null;
  }
}
