import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Account } from '@/modules/Accounts/models/Account.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import { ACCOUNT_TYPE } from '@/constants/accounts';

export interface AccountCandidate {
  id: number;
  name: string;
  accountType: string;
}

const INCOME_TYPES = [ACCOUNT_TYPE.INCOME, ACCOUNT_TYPE.OTHER_INCOME];
const EXPENSE_TYPES = [
  ACCOUNT_TYPE.EXPENSE,
  ACCOUNT_TYPE.OTHER_EXPENSE,
  ACCOUNT_TYPE.COST_OF_GOODS_SOLD,
];

@Injectable()
export class AccountCandidatesService {
  constructor(
    private readonly config: ConfigService,

    @Inject(Account.name)
    private readonly accountModel: TenantModelProxy<typeof Account>,
  ) {}

  async fetch(
    isDeposit: boolean,
    forceIncludeIds: number[] = [],
  ): Promise<AccountCandidate[]> {
    const cap = this.config.get<number>('bankingAi.candidatesCap') ?? 60;
    const types = isDeposit ? INCOME_TYPES : EXPENSE_TYPES;

    const rows = await this.accountModel()
      .query()
      .whereIn('accountType', types)
      .select('id', 'name', 'accountType')
      .limit(cap);

    const result: AccountCandidate[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      accountType: r.accountType,
    }));

    // Always include history-prior accounts even if outside the type filter
    if (forceIncludeIds.length > 0) {
      const existing = new Set(result.map((r) => r.id));
      const extras = await this.accountModel()
        .query()
        .whereIn('id', forceIncludeIds.filter((id) => !existing.has(id)))
        .select('id', 'name', 'accountType');

      extras.forEach((r: any) =>
        result.push({ id: r.id, name: r.name, accountType: r.accountType }),
      );
    }
    return result;
  }

  buildMap(candidates: AccountCandidate[]): Map<number, AccountCandidate> {
    return new Map(candidates.map((c) => [c.id, c]));
  }
}
