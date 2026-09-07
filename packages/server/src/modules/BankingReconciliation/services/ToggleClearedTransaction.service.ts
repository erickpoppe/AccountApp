import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BankTransaction } from '@/modules/BankingTransactions/models/BankTransaction';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

@Injectable()
export class ToggleClearedTransactionService {
  constructor(
    @Inject(BankTransaction.name)
    private readonly bankTxModel: TenantModelProxy<typeof BankTransaction>,
  ) {}

  async toggle(transactionId: number, cleared: boolean) {
    const tx = await this.bankTxModel().query().findById(transactionId);
    if (!tx) throw new NotFoundException('Transaction not found.');

    await this.bankTxModel()
      .query()
      .patch({ isCleared: cleared } as any)
      .where('id', transactionId);

    return { id: transactionId, isCleared: cleared };
  }
}
