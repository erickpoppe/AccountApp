import { Inject, Injectable } from '@nestjs/common';
import { Contact } from '@/modules/Contacts/models/Contact';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

export interface CustomerMatch {
  id: number;
  displayName: string;
}

@Injectable()
export class CustomerMatchService {
  constructor(
    @Inject(Contact.name)
    private readonly contactModel: TenantModelProxy<typeof Contact>,
  ) {}

  async match(payee: string, description: string): Promise<CustomerMatch | null> {
    const customers = await this.contactModel()
      .query()
      .where('contactService', 'customer')
      .select('id', 'displayName')
      .whereNotNull('displayName') as any[];

    const searchText = `${payee ?? ''} ${description ?? ''}`.toLowerCase();

    let bestMatch: CustomerMatch | null = null;
    let bestLength = 0;

    for (const c of customers) {
      const name = (c.displayName ?? '').trim().toLowerCase();
      if (name.length < 3) continue;
      if (searchText.includes(name) && name.length > bestLength) {
        bestMatch = { id: c.id, displayName: c.displayName };
        bestLength = name.length;
      }
    }
    return bestMatch;
  }
}
