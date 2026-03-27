import { Model } from 'objection';
import { TenantBaseModel } from '@/modules/System/models/TenantBaseModel';
import { BaseQueryBuilder } from '@/models/Model';

export class OtherQueryBuilder<M extends Model, R = M[]> extends BaseQueryBuilder<M, R> {
  constructor(...args) {
    // @ts-ignore
    super(...args);
    this.onBuild((builder) => {
      if (builder.isFind() || builder.isDelete() || builder.isUpdate()) {
        builder.where('contact_service', 'other');
      }
    });
  }
}

export class Other extends TenantBaseModel {
  contactService: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  workPhone?: string;
  personalPhone?: string;
  website?: string;
  note?: string;
  active: boolean;
  currencyCode: string;
  openingBalance: number;
  openingBalanceAt: Date | string;
  openingBalanceExchangeRate: number;
  balance: number;

  static QueryBuilder = OtherQueryBuilder;

  static get tableName() { return 'contacts'; }
  get timestamps() { return ['createdAt', 'updatedAt']; }
  static get virtualAttributes() { return ['closingBalance', 'contactNormal']; }
  get closingBalance() { return this.balance; }
  get contactNormal() { return 'debit'; }

  static get modifiers() {
    return {
      inactiveMode(query, active = false) { query.where('active', !active); },
      active(query) { query.where('active', 1); },
      inactive(query) { query.where('active', 0); },
    };
  }

  static get searchRoles() {
    return [
      { fieldKey: 'display_name', comparator: 'contains' },
      { condition: 'or', fieldKey: 'first_name', comparator: 'contains' },
      { condition: 'or', fieldKey: 'last_name', comparator: 'equals' },
      { condition: 'or', fieldKey: 'company_name', comparator: 'equals' },
      { condition: 'or', fieldKey: 'email', comparator: 'equals' },
      { condition: 'or', fieldKey: 'work_phone', comparator: 'equals' },
      { condition: 'or', fieldKey: 'personal_phone', comparator: 'equals' },
    ];
  }
}
