import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BankTransaction } from '@/modules/BankingTransactions/models/BankTransaction';
import { UncategorizedBankTransaction } from '@/modules/BankingTransactions/models/UncategorizedBankTransaction';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

export interface PriorRow {
  creditAccountId: number;
  freq: number;
  share: number;
}

@Injectable()
export class HistoryPriorService {
  private readonly logger = new Logger(HistoryPriorService.name);

  constructor(
    private readonly config: ConfigService,

    @Inject(BankTransaction.name)
    private readonly bankTxModel: TenantModelProxy<typeof BankTransaction>,
  ) {}

  get minFreq(): number {
    return this.config.get<number>('bankingAi.priorMinFreq') ?? 3;
  }

  get minShare(): number {
    return this.config.get<number>('bankingAi.priorMinShare') ?? 0.7;
  }

  async fetchPrior(
    tx: InstanceType<typeof UncategorizedBankTransaction>,
    k = 5,
  ): Promise<PriorRow[]> {
    const payeeKey = (tx.payee ?? '').trim().toLowerCase().slice(0, 60);
    const descKey = (tx.description ?? '').trim().toLowerCase().slice(0, 60);

    if (!payeeKey && !descKey) return [];

    const model = this.bankTxModel() as any;
    const rows = await model
      .query()
      .select('creditAccountId')
      .select(model.knex().raw('COUNT(*) as freq'))
      .where('cashflowAccountId', tx.accountId)
      .whereNotNull('creditAccountId')
      .where((b: any) => {
        if (payeeKey) b.orWhereRaw('LOWER(DESCRIPTION) LIKE ?', [`%${payeeKey}%`]);
        if (descKey && descKey !== payeeKey) {
          b.orWhereRaw('LOWER(DESCRIPTION) LIKE ?', [`%${descKey}%`]);
        }
      })
      .groupBy('creditAccountId')
      .orderBy('freq', 'desc')
      .limit(k);

    const total = rows.reduce((s: number, r: any) => s + Number(r.freq), 0);
    return rows.map((r: any) => ({
      creditAccountId: r.creditAccountId,
      freq: Number(r.freq),
      share: total ? Number(r.freq) / total : 0,
    }));
  }

  meetsThreshold(prior: PriorRow[]): boolean {
    const top = prior[0];
    return !!top && top.freq >= this.minFreq && top.share >= this.minShare;
  }

  static firstTwoWords(text: string): string {
    return (text ?? '').trim().toLowerCase().split(/\s+/).slice(0, 1).join(' ');
  }

  /**
   * Returns a creditAccountId when the last ≥2 categorized transactions whose
   * payee starts with the same two words all used the same account. Returns null
   * when there is no consistent match.
   */
  /**
   * Checks if the last ≥2 categorized transactions whose description CONTAINS
   * the given text all used the same account. Used for customer name matching.
   */
  async fetchConsistentMatchByText(
    searchText: string,
    accountId: number,
    minRows = 2,
  ): Promise<number | null> {
    const key = searchText.trim().toLowerCase();
    if (key.length < 3) return null;

    const model = this.bankTxModel() as any;
    const rows = await model
      .query()
      .select('creditAccountId')
      .where('cashflowAccountId', accountId)
      .whereNotNull('creditAccountId')
      .whereRaw('LOWER(DESCRIPTION) LIKE ?', [`%${key}%`])
      .orderBy('date', 'desc')
      .limit(5);

    this.logger.debug(
      `fetchConsistentMatchByText key="${key}" rows=${rows.length}`,
    );

    if (rows.length < minRows) return null;
    const firstId = rows[0].creditAccountId;
    return rows.every((r: any) => r.creditAccountId === firstId) ? firstId : null;
  }

  async fetchConsistentMatch(
    tx: InstanceType<typeof UncategorizedBankTransaction>,
  ): Promise<number | null> {
    const key = HistoryPriorService.firstTwoWords(tx.payee ?? tx.description ?? '');
    if (key.length < 2) return null;

    const model = this.bankTxModel() as any;
    const rows = await model
      .query()
      .select('creditAccountId')
      .where('cashflowAccountId', tx.accountId)
      .whereNotNull('creditAccountId')
      .whereRaw('LOWER(DESCRIPTION) LIKE ?', [`${key}%`])
      .orderBy('date', 'desc')
      .limit(5);

    this.logger.debug(
      `fetchConsistentMatch key="${key}" rows=${rows.length} ids=${rows.map((r: any) => r.creditAccountId).join(',')}`,
    );

    if (rows.length < 2) return null;
    const firstId = rows[0].creditAccountId;
    return rows.every((r: any) => r.creditAccountId === firstId) ? firstId : null;
  }
}
