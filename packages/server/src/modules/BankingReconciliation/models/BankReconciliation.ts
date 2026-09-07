import { TenantBaseModel } from '@/modules/System/models/TenantBaseModel';

export class BankReconciliation extends TenantBaseModel {
  cashflowAccountId: number;
  statementDate: Date;
  statementClosingBalance: number;
  openingBalance: number;
  closingBalance: number;
  status: string;
  createdByUserId: number;

  static get tableName() {
    return 'bank_reconciliations';
  }

  get timestamps() {
    return ['createdAt', 'updatedAt'];
  }
}
