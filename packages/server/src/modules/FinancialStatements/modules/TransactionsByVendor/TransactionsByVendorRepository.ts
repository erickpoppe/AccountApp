import * as R from 'ramda';
import * as moment from 'moment';
import { isEmpty, map } from 'lodash';
import { Inject, Injectable } from '@nestjs/common';
import { AccountTransaction } from '@/modules/Accounts/models/AccountTransaction.model';
import { Account } from '@/modules/Accounts/models/Account.model';
import { Vendor } from '@/modules/Vendors/models/Vendor';
import { ACCOUNT_TYPE } from '@/constants/accounts';
import { ILedgerEntry } from '@/modules/Ledger/types/Ledger.types';
import { TransactionsByContactRepository } from '../TransactionsByContact/TransactionsByContactRepository';
import { TenancyContext } from '@/modules/Tenancy/TenancyContext.service';
import { AccountRepository } from '@/modules/Accounts/repositories/Account.repository';
import { Ledger } from '@/modules/Ledger/Ledger';
import { ModelObject } from 'objection';
import { ITransactionsByVendorsFilter } from './TransactionsByVendor.types';
import { DateInput } from '@/common/types/Date';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

@Injectable()
export class TransactionsByVendorRepository extends TransactionsByContactRepository {
  @Inject(TenancyContext)
  public readonly tenancyContext: TenancyContext;

  @Inject(AccountRepository)
  public readonly accountRepository: AccountRepository;

  @Inject(Vendor.name)
  public readonly vendorModel: TenantModelProxy<typeof Vendor>;

  @Inject(Account.name)
  public readonly accountModel: TenantModelProxy<typeof Account>;

  @Inject(AccountTransaction.name)
  public readonly accountTransactionModel: TenantModelProxy<
    typeof AccountTransaction
  >;

  /**
   * Ledger.
   * @param {Ledger} ledger
   */
  public ledger: Ledger;

  /**
   * Vendors.
   * @param {ModelObject<Vendor>[]} vendors
   */
  public vendors: ModelObject<Vendor>[];

  /**
   * Accounts graph.
   * @param {any} accountsGraph
   */
  public accountsGraph: any;

  /**
   * Base currency.
   * @param {string} baseCurrency
   */
  public baseCurrency: string;

  /**
   * Report filter.
   * @param {ITransactionsByVendorsFilter} filter
   */
  public filter: ITransactionsByVendorsFilter;

  /**
   * Report entries.
   * @param {ILedgerEntry[]} reportEntries
   */
  public reportEntries: ILedgerEntry[];

  /**
   * Set filter.
   * @param {ITransactionsByVendorsFilter} filter
   */
  public setFilter(filter: ITransactionsByVendorsFilter) {
    this.filter = filter;
  }

  /**
   * Initialize the repository.
   * @returns {Promise<void>}
   */
  async asyncInit() {
    await this.initBaseCurrency();
    await this.initVendors();
    await this.initAccountsGraph();
    await this.initPeriodEntries();
    await this.initLedger();
  }

  /**
   * Retrieve the base currency.
   */
  async initBaseCurrency() {
    const tenantMetadata = await this.tenancyContext.getTenantMetadata();
    this.baseCurrency = tenantMetadata.baseCurrency;
  }

  /**
   * Retrieve the vendors.
   */
  async initVendors() {
    const vendors = await this.getVendors(this.filter.vendorsIds);
    this.vendors = vendors;
  }

  /**
   * Retrieve the accounts graph.
   */
  async initAccountsGraph() {
    this.accountsGraph = await this.accountRepository.getDependencyGraph();
  }

  /**
   * Retrieve the report entries.
   */
  async initPeriodEntries() {
    this.reportEntries = await this.getReportEntries(
      this.filter.fromDate,
      this.filter.toDate,
    );
  }

  async initLedger() {
    this.ledger = new Ledger(this.reportEntries);
  }

  /**
   * Retrieve the vendors opening balance transactions.
   * @param {Date} openingDate - The opening date.
   * @param {number[]} vendorsIds - The vendors ids.
   * @returns {Promise<ILedgerEntry[]>}
   */
  public async getVendorsOpeningBalanceEntries(
    openingDate: Date,
    vendorsIds?: number[],
  ): Promise<ILedgerEntry[]> {
    const openingTransactions = await this.getVendorsOpeningBalance(
      openingDate,
      vendorsIds,
    );

    // @ts-ignore
    return R.compose(
      R.map(R.assoc('date', openingDate)),
      R.map(R.assoc('accountNormal', 'debit')),
    )(openingTransactions);
  }

  /**
   * Retrieve the vendors period transactions.
   * @param {DateInput} fromDate
   * @param {DateInput} toDate
   */
  public async getVendorsPeriodEntries(
    fromDate: DateInput,
    toDate: DateInput,
  ): Promise<ILedgerEntry[]> {
    const transactions = await this.getVendorsPeriodTransactions(
      fromDate,
      toDate,
    );
    // @ts-ignore
    return R.compose(
      R.map(R.assoc('accountNormal', 'debit')),
      R.map((trans) => ({
        // @ts-ignore
        ...trans,
        // @ts-ignore
        contactId: trans.contactId,
        // @ts-ignore
        referenceTypeFormatted: trans.referenceTypeFormatted,
      })),
    )(transactions);
  }

  /**
   * Retrieve the report ledger entries from repository.
   * @param {number} tenantId
   * @param {Date} fromDate
   * @param {Date} toDate
   * @returns {Promise<ILedgerEntry[]>}
   */
  public async getReportEntries(
    fromDate: DateInput,
    toDate: DateInput,
  ): Promise<ILedgerEntry[]> {
    const openingBalanceDate = moment(fromDate).subtract(1, 'days').toDate();
    const vendorIds = map(this.vendors, 'id') as number[];

    return [
      ...(await this.getVendorsOpeningBalanceEntries(openingBalanceDate, vendorIds)),
      ...(await this.getVendorsPeriodEntries(fromDate, toDate)),
    ];
  }

  /**
   * Retrieve the report vendors.
   * @param {number[]} vendorsIds - The vendors IDs.
   * @returns {Promise<IVendor[]>}
   */
  public async getVendors(vendorsIds?: number[]): Promise<Vendor[]> {
    return await this.vendorModel()
      .query()
      .onBuild((q) => {
        q.orderBy('displayName');

        if (!isEmpty(vendorsIds)) {
          q.whereIn('id', vendorsIds);
        }
      });
  }

  /**
   * Retrieves the expense accounts (used for bank-categorized vendor transactions).
   * @returns {Promise<Account[]>}
   */
  public async getExpenseAccounts(): Promise<Account[]> {
    return this.accountModel()
      .query()
      .whereIn('accountType', [
        ACCOUNT_TYPE.EXPENSE,
        ACCOUNT_TYPE.OTHER_EXPENSE,
        ACCOUNT_TYPE.COST_OF_GOODS_SOLD,
      ]);
  }

  /**
   * Retrieve the vendors opening balance transactions.
   * @param {Date} openingDate - The opening date.
   * @param {number[]} vendorsIds - The vendors IDs.
   * @returns {Promise<AccountTransaction[]>}
   */
  public async getVendorsOpeningBalance(
    openingDate: Date,
    vendorsIds?: number[],
  ): Promise<AccountTransaction[]> {
    const expenseAccounts = await this.getExpenseAccounts();
    const expenseAccountIds = map(expenseAccounts, 'id');

    const openingTransactions = await this.accountTransactionModel()
      .query()
      .modify(
        'contactsOpeningBalance',
        openingDate,
        expenseAccountIds,
        vendorsIds,
      );
    return openingTransactions;
  }

  /**
   * Retrieve vendors periods transactions.
   * @param {Date} fromDate - The from date.
   * @param {Date} toDate - The to date.
   * @returns {Promise<AccountTransaction[]>}
   */
  public async getVendorsPeriodTransactions(
    fromDate: DateInput,
    toDate: DateInput,
  ): Promise<AccountTransaction[]> {
    const expenseAccounts = await this.getExpenseAccounts();
    const expenseAccountIds = map(expenseAccounts, 'id');
    const vendorIds = map(this.vendors, 'id') as number[];

    const transactions = await this.accountTransactionModel()
      .query()
      .onBuild((query) => {
        query.modify('filterDateRange', fromDate, toDate);
        query.whereIn('accountId', expenseAccountIds);
        if (vendorIds.length > 0) {
          query.whereIn('contactId', vendorIds);
        } else {
          query.whereNot('contactId', null);
        }
      });
    return transactions;
  }
}
