import * as moment from 'moment';
import { defaultTo, omit, isEmpty } from 'lodash';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { UnitOfWork } from '@/modules/Tenancy/TenancyDB/UnitOfWork.service';
import { TenancyContext } from '@/modules/Tenancy/TenancyContext.service';
import { Contact } from '@/modules/Contacts/models/Contact';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

@Injectable()
export class GenericContactApplication {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly tenancyContext: TenancyContext,
    @Inject(Contact.name)
    private readonly contactModel: TenantModelProxy<typeof Contact>,
  ) {}

  private async buildContactObj(dto: any, contactService: string) {
    const tenantMeta = await this.tenancyContext.getTenant(true);
    const nullIfEmpty = (v: any) => (v === '' || v === undefined ? null : v);
    return {
      ...omit(dto, ['contactType', 'customerType', 'openingBalance', 'openingBalanceAt', 'openingBalanceBranchId', 'openingBalanceExchangeRate']),
      contactService,
      currencyCode: (typeof dto.currencyCode === 'string' && dto.currencyCode.length <= 3) ? dto.currencyCode : (tenantMeta?.metadata?.baseCurrency || 'USD'),
      active: defaultTo(dto.active, true),
      openingBalance: dto.openingBalance ? parseFloat(dto.openingBalance) : 0,
      openingBalanceBranchId: dto.openingBalanceBranchId ? parseInt(dto.openingBalanceBranchId) : null,
      openingBalanceExchangeRate: dto.openingBalanceExchangeRate ? parseFloat(dto.openingBalanceExchangeRate) : 1,
      ...(!isEmpty(dto.openingBalanceAt)
        ? { openingBalanceAt: moment(dto.openingBalanceAt).toMySqlDateTime() }
        : { openingBalanceAt: null }),
      billingAddress1: nullIfEmpty(dto.billingAddress1),
      billingAddress2: nullIfEmpty(dto.billingAddress2),
      billingAddressCity: nullIfEmpty(dto.billingAddressCity),
      billingAddressCountry: nullIfEmpty(dto.billingAddressCountry),
      billingAddressPhone: nullIfEmpty(dto.billingAddressPhone),
      billingAddressPostcode: nullIfEmpty(dto.billingAddressPostcode),
      billingAddressState: nullIfEmpty(dto.billingAddressState),
      shippingAddress1: nullIfEmpty(dto.shippingAddress1),
      shippingAddress2: nullIfEmpty(dto.shippingAddress2),
      shippingAddressCity: nullIfEmpty(dto.shippingAddressCity),
      shippingAddressCountry: nullIfEmpty(dto.shippingAddressCountry),
      shippingAddressPhone: nullIfEmpty(dto.shippingAddressPhone),
      shippingAddressPostcode: nullIfEmpty(dto.shippingAddressPostcode),
      shippingAddressState: nullIfEmpty(dto.shippingAddressState),
      note: nullIfEmpty(dto.note),
      website: nullIfEmpty(dto.website),
      workPhone: nullIfEmpty(dto.workPhone),
      personalPhone: nullIfEmpty(dto.personalPhone),
      companyName: nullIfEmpty(dto.companyName),
    };
  }

  public async createContact(dto: any, contactService: string) {
    const contactObj = await this.buildContactObj(dto, contactService);
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      return this.contactModel().query(trx).insertAndFetch(contactObj);
    });
  }

  public async editContact(contactId: number, dto: any, contactService: string) {
    const contactObj = omit(await this.buildContactObj(dto, contactService), ['contactService', 'currencyCode']);
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      return this.contactModel()
        .query(trx)
        .where('contact_service', contactService)
        .patchAndFetchById(contactId, contactObj);
    });
  }

  public async deleteContact(contactId: number, contactService: string) {
    return this.uow.withTransaction(async (trx: Knex.Transaction) => {
      await this.contactModel()
        .query(trx)
        .where('contact_service', contactService)
        .deleteById(contactId);
    });
  }

  public async getContact(contactId: number, contactService: string) {
    return this.contactModel()
      .query()
      .where('contact_service', contactService)
      .findById(contactId)
      .throwIfNotFound();
  }

  public async getContacts(contactService: string, query: any = {}) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const { results, total } = await this.contactModel()
      .query()
      .where('contact_service', contactService)
      .where('active', true)
      .orderBy('created_at', 'DESC')
      .page(page - 1, pageSize);
    return {
      data: results,
      pagination: { total, page, pageSize },
    };
  }
}
